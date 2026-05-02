export type TaskStatus = 'todo' | 'in-progress' | 'review' | 'done'
export type TaskPriority = 'low' | 'medium' | 'high'

/** Fila tal como viene de Supabase */
export interface TaskRow {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  priority: TaskPriority
  created_at: string | null
  updated_at: string | null
  user_id: string
  image: string | null
}

/** Modelo usado en TaskCard y TaskForm (created_at en ms para date-fns) */
export interface Task {
  id: string
  title: string
  description: string
  status: TaskStatus
  priority: TaskPriority
  created_at: number
  image: string | null
}

export function taskRowToTask(row: TaskRow): Task {
  const created = row.created_at ? new Date(row.created_at).getTime() : Date.now()
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? '',
    status: row.status,
    priority: row.priority,
    created_at: created,
    image: row.image,
  }
}

const TASK_IMAGES_PUBLIC_MARKER = '/task-images/'

/** Ruta relativa en el bucket `task-images` a partir de la URL pública, o null */
export function taskImagePathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const i = url.indexOf(TASK_IMAGES_PUBLIC_MARKER)
  if (i === -1) return null
  return decodeURIComponent(url.slice(i + TASK_IMAGES_PUBLIC_MARKER.length))
}
