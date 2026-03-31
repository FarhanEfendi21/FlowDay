// ============================================================
// FlowDay – Stats Service
// Efisien: semua aggregation via Supabase RPC (PostgreSQL functions)
// Tidak ada N+1 queries, satu RPC = satu round trip ke DB
// ============================================================

import { createClient } from '@/lib/supabase/client'
import {
  type DailyTaskStat,
  type SubjectTaskStat,
  type HabitStat,
  type DashboardSummary,
  mapDailyTaskStat,
  mapSubjectTaskStat,
  mapHabitStat,
  mapDashboardSummary,
} from '@/features/stats/types'

// ─── Client singleton ──────────────────────────────────────────
const getClient = () => createClient()

class ServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'ServiceError'
  }
}

// ─── getCurrentUserId ─────────────────────────────────────────
async function getCurrentUserId(): Promise<string> {
  const supabase = getClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  if (error || !user)
    throw new ServiceError('[stats] User not authenticated')
  return user.id
}

// ─── getWeeklyTaskStats ───────────────────────────────────────
/**
 * Jumlah task selesai per hari selama 7 hari terakhir.
 * Data ini digunakan untuk weekly progress bar/chart.
 *
 * Menggunakan RPC get_weekly_task_stats() — satu query
 * dengan generate_series di PostgreSQL untuk memastikan
 * semua 7 hari selalu ada (termasuk hari tanpa task).
 */
export async function getWeeklyTaskStats(): Promise<DailyTaskStat[]> {
  const supabase = getClient()
  const userId   = await getCurrentUserId()

  const { data, error } = await supabase
    .rpc('get_weekly_task_stats', { p_user_id: userId })

  if (error) throw new ServiceError(`[getWeeklyTaskStats] ${error.message}`, error)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) ?? []).map(mapDailyTaskStat)
}

// ─── getSubjectTaskStats ──────────────────────────────────────
/**
 * Statistik per mata kuliah: total, selesai, pending, overdue.
 * Digunakan untuk breakdown analysis di dashboard.
 *
 * Result sudah di-sort by total DESC (mata kuliah paling banyak
 * task di atas).
 */
export async function getSubjectTaskStats(): Promise<SubjectTaskStat[]> {
  const supabase = getClient()
  const userId   = await getCurrentUserId()

  const { data, error } = await supabase
    .rpc('get_subject_task_stats', { p_user_id: userId })

  if (error) throw new ServiceError(`[getSubjectTaskStats] ${error.message}`, error)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) ?? []).map(mapSubjectTaskStat)
}

// ─── getHabitStats ────────────────────────────────────────────
/**
 * Statistik per habit: current streak, longest streak,
 * completion rate 30 hari terakhir.
 *
 * Streak dihitung di DB trigger (incremental, efisien).
 * Longest streak dihitung via window function.
 */
export async function getHabitStats(): Promise<HabitStat[]> {
  const supabase = getClient()
  const userId   = await getCurrentUserId()

  const { data, error } = await supabase
    .rpc('get_habit_stats', { p_user_id: userId })

  if (error) throw new ServiceError(`[getHabitStats] ${error.message}`, error)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) ?? []).map(mapHabitStat)
}

// ─── getDashboardSummary ──────────────────────────────────────
/**
 * Satu RPC untuk semua angka di stats cards dashboard.
 * Menggantikan multiple queries yang tidak efisien.
 *
 * Return: total/completed/pending/overdue tasks,
 *         deadline hari ini/minggu ini,
 *         total streak, habits selesai hari ini.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  const supabase = getClient()
  const userId   = await getCurrentUserId()

  const { data, error } = await supabase
    .rpc('get_dashboard_summary', { p_user_id: userId })

  if (error) throw new ServiceError(`[getDashboardSummary] ${error.message}`, error)

  // RPC returns array of 1 row
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const row = Array.isArray(data) ? (data as any[])[0] : data
  if (!row) throw new ServiceError('[getDashboardSummary] No data returned')

  return mapDashboardSummary(row)
}
