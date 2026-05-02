'use server'

import { createClient } from '@/lib/supabase/server'
import { taskRowToTask } from '@/interfaces/task'
import type { MutateTaskResult } from '@/lib/tasks'
import * as z from 'zod'

const taskFieldsSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  description: z.string().optional(),
  status: z.enum(['todo', 'in-progress', 'review', 'done']),
  priority: z.enum(['low', 'medium', 'high']),
})

function extFromFile(file: File): string {
  const fromName = file.name?.split('.').pop()
  if (fromName && fromName.length <= 8 && /^[a-z0-9]+$/i.test(fromName)) {
    return fromName.toLowerCase()
  }
  const t = file.type
  if (t === 'image/jpeg') return 'jpg'
  if (t === 'image/png') return 'png'
  if (t === 'image/gif') return 'gif'
  if (t === 'image/webp') return 'webp'
  return 'bin'
}

export async function createTask(formData: FormData): Promise<MutateTaskResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const parsed = taskFieldsSchema.safeParse({
      title: formData.get('title'),
      description: formData.get('description') ?? '',
      status: formData.get('status'),
      priority: formData.get('priority'),
    })
    if (!parsed.success) {
      return { success: false, error: parsed.error.flatten().formErrors.join(', ') || 'Datos inválidos' }
    }

    const { title, description, status, priority } = parsed.data
    const imageFile = formData.get('image')

    let imageUrl: string | null = null
    if (imageFile instanceof File && imageFile.size > 0) {
      const path = `${user.id}/${crypto.randomUUID()}.${extFromFile(imageFile)}`
      const { error: upErr } = await supabase.storage
        .from('task-images')
        .upload(path, imageFile, { cacheControl: '3600', upsert: false })
      if (upErr) {
        console.error('createTask upload:', upErr)
        return { success: false, error: upErr.message }
      }
      const { data: pub } = supabase.storage.from('task-images').getPublicUrl(path)
      imageUrl = pub.publicUrl
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('tasks')
      .insert({
        title,
        description: description || null,
        status,
        priority,
        user_id: user.id,
        image: imageUrl,
        created_at: now,
        updated_at: now,
      })
      .select()
      .single()

    if (error) {
      console.error('createTask:', error)
      return { success: false, error: error.message }
    }

    return { success: true, task: taskRowToTask(data) }
  } catch (e) {
    console.error('createTask:', e)
    return { success: false, error: 'Error al crear la tarea' }
  }
}
