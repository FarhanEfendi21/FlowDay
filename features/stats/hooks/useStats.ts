// ============================================================
// FlowDay – Stats Hooks (React Query)
// Semua hooks untuk fetching statistics
// staleTime tinggi karena stats tidak sering berubah
// ============================================================

import { useQuery } from '@tanstack/react-query'
import {
  getWeeklyTaskStats,
  getSubjectTaskStats,
  getHabitStats,
  getDashboardSummary,
} from '@/features/stats/api/statsService'
import type {
  DailyTaskStat,
  SubjectTaskStat,
  HabitStat,
  DashboardSummary,
} from '@/features/stats/types'

// ─── Query Key Factory ────────────────────────────────────────
// Centralized key management — memudahkan invalidation
export const statsKeys = {
  all:       ['stats']                       as const,
  weekly:    ['stats', 'weekly']             as const,
  subjects:  ['stats', 'subjects']           as const,
  habits:    ['stats', 'habits']             as const,
  dashboard: ['stats', 'dashboard']          as const,
} as const

// ─── useWeeklyTaskStats ───────────────────────────────────────
/**
 * Progress mingguan: jumlah task selesai per hari (7 hari).
 * staleTime: 30s (reduced from 5min for faster updates)
 */
export function useWeeklyTaskStats() {
  return useQuery<DailyTaskStat[], Error>({
    queryKey: statsKeys.weekly,
    queryFn:  getWeeklyTaskStats,
    staleTime: 30 * 1000, // 30 detik
  })
}

// ─── useSubjectTaskStats ──────────────────────────────────────
/**
 * Breakdown tugas per mata kuliah.
 * staleTime: 30s (reduced from 5min for faster updates)
 */
export function useSubjectTaskStats() {
  return useQuery<SubjectTaskStat[], Error>({
    queryKey: statsKeys.subjects,
    queryFn:  getSubjectTaskStats,
    staleTime: 30 * 1000, // 30 detik
  })
}

// ─── useHabitStats ────────────────────────────────────────────
/**
 * Streak & completion rate per habit.
 * staleTime: 30s (reduced from 2min for faster updates)
 */
export function useHabitStats() {
  return useQuery<HabitStat[], Error>({
    queryKey: statsKeys.habits,
    queryFn:  getHabitStats,
    staleTime: 30 * 1000, // 30 detik
  })
}

// ─── useDashboardSummary ──────────────────────────────────────
/**
 * Semua angka stats cards dashboard dalam satu query.
 * Menggantikan useStore().tasks + habits.reduce() yang
 * bergantung pada local state.
 *
 * staleTime: 30s (reduced from 1min for faster updates)
 */
export function useDashboardSummary() {
  return useQuery<DashboardSummary, Error>({
    queryKey: statsKeys.dashboard,
    queryFn:  getDashboardSummary,
    staleTime: 30 * 1000, // 30 detik
  })
}

// ─── Re-export types ──────────────────────────────────────────
export type { DailyTaskStat, SubjectTaskStat, HabitStat, DashboardSummary }
