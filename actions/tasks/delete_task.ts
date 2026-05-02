'use server'

import { createClient } from '@/lib/supabase/server'
import { taskImagePathFromPublicUrl } from '@/interfaces/task'
import type { DeleteTaskResult } from '@/lib/tasks'

export async function deleteTask(taskId: string): Promise<DeleteTaskResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    if (!taskId) {
      return { success: false, error: 'Id de tarea requerido' }
    }

    const { data: row, error: fetchErr } = await supabase
      .from('tasks')
      .select('image')
      .eq('id', taskId)
      .eq('user_id', user.id)
      .single()

    if (fetchErr || !row) {
      return { success: false, error: fetchErr?.message ?? 'Tarea no encontrada' }
    }

    const image = row.image as string | null
    if (image) {
      const path = taskImagePathFromPublicUrl(image)
      if (path) {
        const { error: delStor } = await supabase.storage.from('task-images').remove([path])
        if (delStor) {
          console.warn('deleteTask storage:', delStor)
        }
      }
    }

    const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', user.id)

    if (error) {
      console.error('deleteTask:', error)
      return { success: false, error: error.message }
    }

    return { success: true }
  } catch (e) {
    console.error('deleteTask:', e)
    return { success: false, error: 'Error al eliminar la tarea' }
  }
}
