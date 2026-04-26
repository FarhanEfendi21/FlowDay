// ============================================================
// FlowDay – Habit Service
// Business logic layer: semua query ke Supabase untuk habits
// ============================================================

import { createClient } from '@/lib/supabase/client'
import {
  type Habit,
  type HabitWithLogs,
  type CreateHabitInput,
  createHabitSchema,
  mapHabitRow,
  mapHabitLogRow,
} from '@/features/habits/types'
import { format } from 'date-fns'

// ─── Client singleton ──────────────────────────────────────────
// Re-use the shared browser client so that a single Supabase
// session/cookie is used for all habit queries.
const getClient = () => createClient()

// ─── Error helper ────────────────────────────────────────────
class ServiceError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message)
    this.name = 'ServiceError'
  }
}

function assertRow<T>(
  data: unknown,
  error: { message: string } | null,
  context: string
): T {
  if (error) throw new ServiceError(`[${context}] ${error.message}`, error)
  if (data === null || data === undefined) throw new ServiceError(`[${context}] Data not found`)
  return data as T
}

const todayStr = () => format(new Date(), 'yyyy-MM-dd')

// ─── getHabits ───────────────────────────────────────────────
/**
 * Fetch habits + habit_logs 7 hari terakhir dalam satu query.
 * Fallback ke query tanpa join jika tidak ada logs.
 */
export async function getHabits(): Promise<HabitWithLogs[]> {
  const supabase = getClient()

  const today   = todayStr()
  const weekAgo = format(new Date(Date.now() - 6 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd')

  // Primary: Fetch habits WITHOUT inner join (so habits with no logs still appear)
  // Filter out soft-deleted habits
  const { data: habitsData, error: habitsError } = await supabase
    .from('habits')
    .select('id, user_id, title, current_streak, created_at, updated_at, deleted_at')
    .is('deleted_at', null)
    .order('created_at', { ascending: true })

  if (habitsError) throw new ServiceError(`[getHabits] ${habitsError.message}`, habitsError)

  const habits = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((habitsData ?? []) as any[]).map(mapHabitRow)
  )
  if (habits.length === 0) return []

  // Fetch logs for last 7 days in a single query
  const habitIds = habits.map((h) => h.id)
  const { data: logsData, error: logsError } = await supabase
    .from('habit_logs')
    .select('id, habit_id, user_id, log_date, completed, created_at')
    .in('habit_id', habitIds)
    .gte('log_date', weekAgo)
    .lte('log_date', today)

  if (logsError) throw new ServiceError(`[getHabits:logs] ${logsError.message}`, logsError)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const logs = ((logsData as any[]) ?? []).map(mapHabitLogRow)

  // Group logs by habit_id
  const logsByHabit = logs.reduce<Record<string, typeof logs>>((acc, log) => {
    if (!acc[log.habitId]) acc[log.habitId] = []
    acc[log.habitId].push(log)
    return acc
  }, {})

  return habits.map((habit) => {
    const habitLogs = logsByHabit[habit.id] ?? []
    const isCompletedToday = habitLogs.some((l) => l.logDate === today && l.completed)
    return { ...habit, logs: habitLogs, isCompletedToday }
  })
}

// ─── createHabit ─────────────────────────────────────────────
export async function createHabit(input: CreateHabitInput): Promise<Habit> {
  const parsed = createHabitSchema.safeParse(input)
  if (!parsed.success) {
    throw new ServiceError(`[createHabit] ${parsed.error.errors[0].message}`)
  }

  const supabase = getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new ServiceError('[createHabit] User not authenticated')

  const { data, error } = await supabase
    .from('habits')
    .insert({
      user_id:        user.id,
      title:          parsed.data.title,
      current_streak: 0,
    })
    .select()
    .single()

  return mapHabitRow(assertRow(data, error, 'createHabit'))
}

// ─── deleteHabit (soft delete) ───────────────────────────────
export async function deleteHabit(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('habits')
    .update({ deleted_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw new ServiceError(`[deleteHabit] ${error.message}`, error)
}

// ─── getDeletedHabits ────────────────────────────────────────
export async function getDeletedHabits(): Promise<Habit[]> {
  const supabase = getClient()
  const { data, error } = await supabase
    .from('habits')
    .select('id, user_id, title, current_streak, created_at, updated_at, deleted_at')
    .not('deleted_at', 'is', null)
    .order('deleted_at', { ascending: false })

  if (error) throw new ServiceError(`[getDeletedHabits] ${error.message}`, error)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data ?? []) as any[]).map(mapHabitRow)
}

// ─── restoreHabit ────────────────────────────────────────────
export async function restoreHabit(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase
    .from('habits')
    .update({ deleted_at: null })
    .eq('id', id)
  if (error) throw new ServiceError(`[restoreHabit] ${error.message}`, error)
}

// ─── permanentDeleteHabit ────────────────────────────────────
export async function permanentDeleteHabit(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('habits').delete().eq('id', id)
  if (error) throw new ServiceError(`[permanentDeleteHabit] ${error.message}`, error)
}

// ─── toggleHabit ─────────────────────────────────────────────
/**
 * Upsert habit_log untuk hari ini (atau tanggal tertentu).
 * Streak dihitung ulang otomatis oleh DB trigger.
 */
export async function toggleHabit(habitId: string, date?: string): Promise<void> {
  const supabase = getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) throw new ServiceError('[toggleHabit] User not authenticated')

  const logDate = date ?? todayStr()

  const { data: existing } = await supabase
    .from('habit_logs')
    .select('id, completed')
    .eq('habit_id', habitId)
    .eq('log_date',  logDate)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('habit_logs')
      .update({ completed: !(existing as { completed: boolean }).completed })
      .eq('id', (existing as { id: string }).id)
    if (error) throw new ServiceError(`[toggleHabit] ${error.message}`, error)
  } else {
    const { error } = await supabase
      .from('habit_logs')
      .insert({
        habit_id:  habitId,
        user_id:   user.id,
        log_date:  logDate,
        completed: true,
      })
    if (error) throw new ServiceError(`[toggleHabit] ${error.message}`, error)
  }
}
