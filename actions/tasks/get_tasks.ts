'use server'

import { createClient } from '@/lib/supabase/server'
import { TASKS_PAGE_SIZE, type GetTasksResult } from '@/lib/tasks'
import { taskRowToTask, type TaskRow } from '@/interfaces/task'

/** Patrón ILIKE para PostgREST (comillas duplicadas internas). */
function buildIlikePattern(raw: string): string {
  const t = raw.trim()
  if (!t) return ''
  const esc = t
    .replace(/\\/g, '\\\\')
    .replace(/%/g, '\\%')
    .replace(/_/g, '\\_')
    .replace(/"/g, '""')
  return `%${esc}%`
}

export async function getTasks(params: {
  page: number
  search?: string
  status?: string
  priority?: string
}): Promise<GetTasksResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, error: 'No autenticado' }
    }

    const page = Math.max(1, Math.floor(params.page))
    const from = (page - 1) * TASKS_PAGE_SIZE
    const to = from + TASKS_PAGE_SIZE - 1

    const runFilteredQuery = () => {
      let q = supabase
        .from('tasks')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })

      if (params.status && params.status !== 'all') {
        q = q.eq('status', params.status)
      }
      if (params.priority && params.priority !== 'all') {
        q = q.eq('priority', params.priority)
      }
      const pattern = buildIlikePattern(params.search ?? '')
      if (pattern) {
        q = q.or(`title.ilike."${pattern}",description.ilike."${pattern}"`)
      }
      return q
    }

    const { data, error, count } = await runFilteredQuery().range(from, to)

    if (error) {
      console.error('getTasks:', error)
      return { success: false, error: error.message }
    }

    const rows = (data ?? []) as TaskRow[]
    const tasks = rows.map(taskRowToTask)
    const total = count ?? 0

    return { success: true, tasks, total, page, pageSize: TASKS_PAGE_SIZE }
  } catch (e) {
    console.error('getTasks:', e)
    return { success: false, error: 'Error al cargar tareas' }
  }
}
