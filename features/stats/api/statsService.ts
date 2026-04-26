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

// ─── Client Singleton ─────────────────────────────────────────
// Kita simpan client di variable agar tidak recreate di setiap call
let supabaseClient: ReturnType<typeof createClient> | null = null

const getClient = () => {
  if (!supabaseClient) {
    supabaseClient = createClient()
  }
  return supabaseClient
}

class ServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'ServiceError'
  }
}

// ─── Cache User ID ────────────────────────────────────────────
// Cache user ID untuk menghindari multiple auth.getUser() calls
let cachedUserId: string | null = null
let cacheTimestamp: number = 0
const CACHE_DURATION = 5000 // 5 seconds

// ─── getCurrentUserId ─────────────────────────────────────────
/**
 * Helper untuk mendapatkan ID user yang sedang login.
 * Melempar error jika session tidak ditemukan.
 * OPTIMIZED: Cache user ID untuk 5 detik untuk menghindari multiple calls
 */
async function getCurrentUserId(): Promise<string> {
  const now = Date.now()
  
  // Return cached user ID if still valid
  if (cachedUserId && (now - cacheTimestamp) < CACHE_DURATION) {
    return cachedUserId
  }
  
  const supabase = getClient()
  const { data: { user }, error } = await supabase.auth.getUser()
  
  if (error || !user) {
    throw new ServiceError('[stats] User not authenticated')
  }
  
  // Cache the user ID
  cachedUserId = user.id
  cacheTimestamp = now
  
  return user.id
}

// ─── getWeeklyTaskStats ───────────────────────────────────────
/**
 * Jumlah task selesai per hari selama 7 hari terakhir.
 */
export async function getWeeklyTaskStats(): Promise<DailyTaskStat[]> {
  try {
    const supabase = getClient()
    const userId   = await getCurrentUserId()

    const { data, error } = await supabase
      .rpc('get_weekly_task_stats', { p_user_id: userId })

    if (error) throw error
    
    return (Array.isArray(data) ? data : []).map(mapDailyTaskStat)
  } catch (err) {
    throw new ServiceError(`[getWeeklyTaskStats] ${err instanceof Error ? err.message : String(err)}`, err)
  }
}

// ─── getSubjectTaskStats ──────────────────────────────────────
/**
 * Statistik per mata kuliah: total, selesai, pending, overdue.
 */
export async function getSubjectTaskStats(): Promise<SubjectTaskStat[]> {
  try {
    const supabase = getClient()
    const userId   = await getCurrentUserId()

    const { data, error } = await supabase
      .rpc('get_subject_task_stats', { p_user_id: userId })

    if (error) throw error
    
    return (Array.isArray(data) ? data : []).map(mapSubjectTaskStat)
  } catch (err) {
    throw new ServiceError(`[getSubjectTaskStats] ${err instanceof Error ? err.message : String(err)}`, err)
  }
}

// ─── getHabitStats ────────────────────────────────────────────
/**
 * Statistik per habit: current streak, longest streak, completion rate.
 */
export async function getHabitStats(): Promise<HabitStat[]> {
  try {
    const supabase = getClient()
    const userId   = await getCurrentUserId()

    const { data, error } = await supabase
      .rpc('get_habit_stats', { p_user_id: userId })

    if (error) throw error
    
    return (Array.isArray(data) ? data : []).map(mapHabitStat)
  } catch (err) {
    throw new ServiceError(`[getHabitStats] ${err instanceof Error ? err.message : String(err)}`, err)
  }
}

// ─── getDashboardSummary ──────────────────────────────────────
/**
 * Ringkasan semua angka statistik untuk dashboard cards.
 */
export async function getDashboardSummary(): Promise<DashboardSummary> {
  try {
    const supabase = getClient()
    const userId   = await getCurrentUserId()

    const { data, error } = await supabase
      .rpc('get_dashboard_summary', { p_user_id: userId })

    if (error) throw error

    // RPC RETURNS TABLE selalu mengembalikan array
    const row = Array.isArray(data) ? data[0] : data
    
    // Jika user benar-benar baru dan query tidak mengembalikan baris (jarang terjadi di aggregate),
    // kita tetap kembalikan data default agar tidak crash di UI.
    if (!row) {
      return mapDashboardSummary({
        total_tasks: 0,
        completed_tasks: 0,
        pending_tasks: 0,
        overdue_tasks: 0,
        tasks_due_today: 0,
        tasks_due_week: 0,
        total_habits: 0,
        total_streak: 0,
        habits_done_today: 0
      })
    }

    return mapDashboardSummary(row)
  } catch (err) {
    throw new ServiceError(`[getDashboardSummary] ${err instanceof Error ? err.message : String(err)}`, err)
  }
}
