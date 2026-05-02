import type { Task } from '@/interfaces/task'

export const TASKS_PAGE_SIZE = 10

export type GetTasksResult =
  | { success: true; tasks: Task[]; total: number; page: number; pageSize: number }
  | { success: false; error: string }

export type MutateTaskResult = { success: true; task: Task } | { success: false; error: string }

export type DeleteTaskResult = { success: true } | { success: false; error: string }
