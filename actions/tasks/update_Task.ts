'use server'

import { createClient } from '@/lib/supabase/server'
import { taskImagePathFromPublicUrl, taskRowToTask } from '@/interfaces/task'
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

export async function updateTask(formData: FormData): Promise<MutateTaskResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const id = String(formData.get('id') ?? '')
    if (!id) {
      return { success: false, error: 'Id de tarea requerido' }
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
    const removeImage = formData.get('removeImage') === 'true'
    const existingImage = String(formData.get('existingImage') ?? '')
    const imageFile = formData.get('image')

    let imageUrl: string | null = removeImage ? null : existingImage || null

    if (imageFile instanceof File && imageFile.size > 0) {
      const path = `${user.id}/${crypto.randomUUID()}.${extFromFile(imageFile)}`
      const { error: upErr } = await supabase.storage
        .from('task-images')
        .upload(path, imageFile, { cacheControl: '3600', upsert: false })
      if (upErr) {
        console.error('updateTask upload:', upErr)
        return { success: false, error: upErr.message }
      }
      const { data: pub } = supabase.storage.from('task-images').getPublicUrl(path)
      imageUrl = pub.publicUrl
    }

    if (imageFile instanceof File && imageFile.size > 0 && existingImage) {
      const oldPath = taskImagePathFromPublicUrl(existingImage)
      if (oldPath) {
        const { error: delErr } = await supabase.storage.from('task-images').remove([oldPath])
        if (delErr) {
          console.warn('updateTask remove old image:', delErr)
        }
      }
    }

    if (removeImage && existingImage && !(imageFile instanceof File && imageFile.size > 0)) {
      const oldPath = taskImagePathFromPublicUrl(existingImage)
      if (oldPath) {
        const { error: delErr } = await supabase.storage.from('task-images').remove([oldPath])
        if (delErr) {
          console.warn('updateTask remove on clear:', delErr)
        }
      }
    }

    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('tasks')
      .update({
        title,
        description: description || null,
        status,
        priority,
        image: imageUrl,
        updated_at: now,
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      console.error('updateTask:', error)
      return { success: false, error: error.message }
    }

    return { success: true, task: taskRowToTask(data) }
  } catch (e) {
    console.error('updateTask:', e)
    return { success: false, error: 'Error al actualizar la tarea' }
  }
}
