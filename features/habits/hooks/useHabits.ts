// ============================================================
// FlowDay – Habit Hooks (React Query)
// Abstraction layer antara UI dan habit service
// ============================================================

'use client'

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from '@tanstack/react-query'
import {
  getHabits,
  createHabit,
  deleteHabit,
  toggleHabit,
} from '@/features/habits/api/habitService'
import type {
  HabitWithLogs,
  Habit,
  CreateHabitInput,
} from '@/features/habits/types'
import { format } from 'date-fns'

// ─── Query Keys ──────────────────────────────────────────────
export const habitKeys = {
  all:  () => ['habits']        as const,
  list: () => ['habits', 'list'] as const,
}

// ─── useGetHabits ────────────────────────────────────────────
export function useGetHabits(
  options?: Omit<UseQueryOptions<HabitWithLogs[], Error>, 'queryKey' | 'queryFn'>
) {
  return useQuery<HabitWithLogs[], Error>({
    queryKey: habitKeys.list(),
    queryFn:  getHabits,
    staleTime: 1000 * 30, // 30s cache
    ...options,
  })
}

// ─── useCreateHabit ──────────────────────────────────────────
export function useCreateHabit() {
  const queryClient = useQueryClient()

  return useMutation<Habit, Error, CreateHabitInput>({
    mutationFn: createHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all() })
    },
  })
}

// ─── useDeleteHabit ──────────────────────────────────────────
export function useDeleteHabit() {
  const queryClient = useQueryClient()

  return useMutation<void, Error, string>({
    mutationFn: deleteHabit,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all() })
    },
  })
}

// ─── useToggleHabit ──────────────────────────────────────────
/**
 * Optimistic update: langsung flip isCompletedToday di cache.
 * Streak diupdate oleh DB trigger, di-sync saat invalidate.
 */
export function useToggleHabit() {
  const queryClient = useQueryClient()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  return useMutation<void, Error, { habitId: string; date?: string }>({
    mutationFn: ({ habitId, date }) => toggleHabit(habitId, date),

    onMutate: async ({ habitId, date }) => {
      const targetDate = date ?? todayStr

      await queryClient.cancelQueries({ queryKey: habitKeys.all() })
      const previousData = queryClient.getQueryData<HabitWithLogs[]>(habitKeys.list())

      // Optimistic: flip isCompletedToday + update log in cache
      queryClient.setQueryData<HabitWithLogs[]>(habitKeys.list(), (old) =>
        old?.map((habit) => {
          if (habit.id !== habitId) return habit

          const existingLog = habit.logs.find((l) => l.logDate === targetDate)
          const newCompleted = existingLog ? !existingLog.completed : true

          const updatedLogs = existingLog
            ? habit.logs.map((l) =>
                l.logDate === targetDate ? { ...l, completed: newCompleted } : l
              )
            : [
                ...habit.logs,
                {
                  id:        crypto.randomUUID(),
                  habitId:   habit.id,
                  userId:    habit.userId,
                  logDate:   targetDate,
                  completed: true,
                  createdAt: new Date().toISOString(),
                },
              ]

          return {
            ...habit,
            logs: updatedLogs,
            isCompletedToday: targetDate === todayStr ? newCompleted : habit.isCompletedToday,
          }
        })
      )

      return { previousData }
    },

    onError: (_err, _vars, context) => {
      const ctx = context as { previousData?: HabitWithLogs[] }
      if (ctx?.previousData) {
        queryClient.setQueryData(habitKeys.list(), ctx.previousData)
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: habitKeys.all() })
    },
  })
}
