'use client'

import { useCallback, useEffect, useState } from 'react'
import toast from 'react-hot-toast'
import { getTasks } from '@/actions/tasks/get_tasks'
import { TASKS_PAGE_SIZE } from '@/lib/tasks'
import { deleteTask } from '@/actions/tasks/delete_task'
import type { Task } from '@/interfaces/task'
import { TasksNav } from '@/components/dashboard/TasksNav'
import { TaskFilters } from '@/components/dashboard/TaskFilters'
import { TaskCard } from '@/components/dashboard/TaskCard'
import { TaskForm } from '@/components/dashboard/TaskForm'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'

export function TasksBoard() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    search: '',
    status: 'all',
    priority: 'all',
  })
  const [formOpen, setFormOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)

  const totalPages = Math.max(1, Math.ceil(total / TASKS_PAGE_SIZE))

  const loadTasksList = useCallback(async () => {
    setLoading(true)
    const res = await getTasks({
      page,
      search: filters.search,
      status: filters.status,
      priority: filters.priority,
    })
    if (res.success) {
      const tp = Math.max(1, Math.ceil(res.total / TASKS_PAGE_SIZE))
      setTasks(res.tasks)
      setTotal(res.total)
      if (page > tp) {
        setPage(tp)
      }
    } else {
      toast.error(res.error)
      setTasks([])
      setTotal(0)
    }
    setLoading(false)
  }, [page, filters.search, filters.status, filters.priority])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- hidratar desde server action al cambiar página/filtros
    void loadTasksList()
  }, [loadTasksList])

  const handleSearchChange = useCallback((search: string) => {
    setFilters((f) => ({ ...f, search }))
    setPage(1)
  }, [])

  const handleStatusChange = useCallback((status: string) => {
    setFilters((f) => ({ ...f, status }))
    setPage(1)
  }, [])

  const handlePriorityChange = useCallback((priority: string) => {
    setFilters((f) => ({ ...f, priority }))
    setPage(1)
  }, [])

  const openCreate = useCallback(() => {
    setEditingTask(null)
    setFormOpen(true)
  }, [])

  const handleEdit = useCallback((task: Task) => {
    setEditingTask(task)
    setFormOpen(true)
  }, [])

  const handleDelete = useCallback(
    async (task: Task) => {
      if (!window.confirm(`¿Eliminar la tarea «${task.title}»?`)) return
      const res = await deleteTask(task.id)
      if (!res.success) {
        toast.error(res.error)
        return
      }
      toast.success('Tarea eliminada')
      await loadTasksList()
    },
    [loadTasksList],
  )

  return (
    <div className="min-h-screen bg-background">
      <TasksNav onNewTask={openCreate} />

      <main className="px-4 pb-10 md:px-6 max-w-7xl mx-auto">
        <TaskFilters
          onSearchChange={handleSearchChange}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          currentFilters={filters}
        />

        {loading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="size-8 animate-spin text-muted-foreground" />
          </div>
        ) : tasks.length === 0 ? (
          <p className="text-center text-muted-foreground py-16 text-sm">
            No hay tareas que coincidan con los filtros.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {!loading && total > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-10">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="size-4" />
              Anterior
            </Button>
            <span className="text-sm text-muted-foreground tabular-nums">
              Página {page} de {totalPages}
              <span className="hidden sm:inline"> · {total} tareas</span>
            </span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Siguiente
              <ChevronRight className="size-4" />
            </Button>
          </div>
        )}
      </main>

      <TaskForm
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false)
          setEditingTask(null)
        }}
        task={editingTask}
        onSuccess={() => {
          void loadTasksList()
        }}
      />
    </div>
  )
}
