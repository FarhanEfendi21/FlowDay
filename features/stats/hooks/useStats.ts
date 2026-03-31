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
 * staleTime: 5 menit — data ini cukup stabil.
 */
export function useWeeklyTaskStats() {
  return useQuery<DailyTaskStat[], Error>({
    queryKey: statsKeys.weekly,
    queryFn:  getWeeklyTaskStats,
    staleTime: 5 * 60 * 1000, // 5 menit
  })
}

// ─── useSubjectTaskStats ──────────────────────────────────────
/**
 * Breakdown tugas per mata kuliah.
 * staleTime: 5 menit — hanya berubah saat ada add/delete task.
 */
export function useSubjectTaskStats() {
  return useQuery<SubjectTaskStat[], Error>({
    queryKey: statsKeys.subjects,
    queryFn:  getSubjectTaskStats,
    staleTime: 5 * 60 * 1000,
  })
}

// ─── useHabitStats ────────────────────────────────────────────
/**
 * Streak & completion rate per habit.
 * staleTime: 2 menit — streak bisa berubah lebih sering.
 */
export function useHabitStats() {
  return useQuery<HabitStat[], Error>({
    queryKey: statsKeys.habits,
    queryFn:  getHabitStats,
    staleTime: 2 * 60 * 1000, // 2 menit
  })
}

// ─── useDashboardSummary ──────────────────────────────────────
/**
 * Semua angka stats cards dashboard dalam satu query.
 * Menggantikan useStore().tasks + habits.reduce() yang
 * bergantung pada local state.
 *
 * staleTime: 1 menit — karena ini overview utama.
 */
export function useDashboardSummary() {
  return useQuery<DashboardSummary, Error>({
    queryKey: statsKeys.dashboard,
    queryFn:  getDashboardSummary,
    staleTime: 1 * 60 * 1000, // 1 menit
  })
}

// ─── Re-export types ──────────────────────────────────────────
export type { DailyTaskStat, SubjectTaskStat, HabitStat, DashboardSummary }
