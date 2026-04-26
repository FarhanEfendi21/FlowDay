// ============================================================
// FlowDay – Task Hooks (React Query)
// Abstraction layer antara UI dan service layer
// ============================================================

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  getTasks,
  createTask,
  updateTask,
  deleteTask,
  toggleTaskStatus,
  getUpcomingTasks,
  getOverdueTasks,
  restoreTask,
  permanentDeleteTask,
  getDeletedTasks,
} from '@/features/tasks/api/taskService'
import type {
  Task,
  CreateTaskInput,
  UpdateTaskInput,
  GetTasksFilter,
} from '@/features/tasks/types'

// ─── Query Keys ──────────────────────────────────────────────
export const taskKeys = {
  all:      ()                      => ['tasks']               as const,
  list:     (filter: GetTasksFilter)=> ['tasks', 'list', filter] as const,
  upcoming: ()                      => ['tasks', 'upcoming']   as const,
  overdue:  ()                      => ['tasks', 'overdue']    as const,
  deleted:  ()                      => ['tasks', 'deleted']    as const,
  detail:   (id: string)            => ['tasks', 'detail', id] as const,
} as const

// ─── Stats invalidation helper ────────────────────────────────
// Saat tasks berubah, stats juga harus di-refetch
function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: taskKeys.all() })
  qc.invalidateQueries({ queryKey: ['stats'] })
}

// ─── useGetTasks ─────────────────────────────────────────────
export function useGetTasks(
  filter: GetTasksFilter = {},
  options?: Omit<UseQueryOptions<Task[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.list(filter),
    queryFn:  () => getTasks(filter),
    staleTime: 30 * 1000, // 30s
    ...options,
  })
}

// ─── useUpcomingTasks ────────────────────────────────────────
/**
 * Shortcut hook: deadline terdekat untuk widget dashboard.
 */
export function useUpcomingTasks(limit = 5) {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.upcoming(),
    queryFn:  () => getUpcomingTasks(limit),
    staleTime: 30 * 1000,
  })
}

// ─── useOverdueTasks ─────────────────────────────────────────
export function useOverdueTasks() {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.overdue(),
    queryFn:  getOverdueTasks,
    staleTime: 60 * 1000,
  })
}

// ─── useCreateTask ───────────────────────────────────────────
export function useCreateTask() {
  const queryClient = useQueryClient()
  return useMutation<Task, Error, CreateTaskInput>({
    mutationFn: createTask,
    onSuccess:  () => invalidateAll(queryClient),
  })
}

// ─── useUpdateTask ───────────────────────────────────────────
export function useUpdateTask() {
  const queryClient = useQueryClient()
  return useMutation<Task, Error, { id: string; input: UpdateTaskInput }>({
    mutationFn: ({ id, input }) => updateTask(id, input),
    onSuccess:  () => invalidateAll(queryClient),
  })
}

// ─── useDeleteTask ───────────────────────────────────────────
/**
 * Soft delete task (pindah ke trash)
 */
export function useDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: deleteTask,
    onSuccess:  () => invalidateAll(queryClient),
  })
}

// ─── useRestoreTask ──────────────────────────────────────────
/**
 * Restore task dari trash
 */
export function useRestoreTask() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: restoreTask,
    onSuccess:  () => invalidateAll(queryClient),
  })
}

// ─── usePermanentDeleteTask ──────────────────────────────────
/**
 * Permanent delete task (hard delete)
 */
export function usePermanentDeleteTask() {
  const queryClient = useQueryClient()
  return useMutation<void, Error, string>({
    mutationFn: permanentDeleteTask,
    onSuccess:  () => invalidateAll(queryClient),
  })
}

// ─── useDeletedTasks ─────────────────────────────────────────
/**
 * Fetch tasks yang sudah dihapus (untuk trash page)
 */
export function useDeletedTasks() {
  return useQuery<Task[], Error>({
    queryKey: taskKeys.deleted(),
    queryFn:  getDeletedTasks,
    staleTime: 30 * 1000,
  })
}

// ─── useToggleTaskStatus ─────────────────────────────────────
/**
 * Optimistic update: langsung flip status di cache,
 * rollback jika mutation gagal.
 */
export function useToggleTaskStatus() {
  const queryClient = useQueryClient()

  return useMutation<Task, Error, string>({
    mutationFn: toggleTaskStatus,

    onMutate: async (taskId) => {
      // Cancel in-flight queries
      await queryClient.cancelQueries({ queryKey: taskKeys.all() })

      // Snapshot for rollback
      const previousData = queryClient.getQueriesData<Task[]>({ queryKey: taskKeys.all() })

      // Optimistic update across all task queries
      queryClient.setQueriesData<Task[]>(
        { queryKey: taskKeys.all() },
        (old) =>
          old?.map((task) =>
            task.id === taskId
              ? { ...task, status: task.status === 'todo' ? 'done' : 'todo' }
              : task
          )
      )

      return { previousData }
    },

    onError: (_err, _taskId, context) => {
      // Rollback optimistic update
      const ctx = context as { previousData?: [readonly unknown[], Task[]][] }
      ctx?.previousData?.forEach(([queryKey, data]) => {
        queryClient.setQueryData(queryKey, data)
      })
    },

    onSettled: () => {
      invalidateAll(queryClient)
    },
  })
}
