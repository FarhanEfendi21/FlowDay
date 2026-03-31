import { z } from 'zod'
import type { Database } from '@/lib/types/database.types'

// ─── Raw DB Row Types ──────────────────────────────────────────
export type HabitRow    = Database['public']['Tables']['habits']['Row']
export type HabitLogRow = Database['public']['Tables']['habit_logs']['Row']

// ─── Domain Types ──────────────────────────────────────────────
export interface HabitLog {
  id:        string
  habitId:   string
  userId:    string
  logDate:   string   // 'YYYY-MM-DD'
  completed: boolean
  createdAt: string
}

export interface Habit {
  id:            string
  userId:        string
  title:         string
  currentStreak: number
  createdAt:     string
  updatedAt:     string
}

/** Habit enriched with recent 7-day logs */
export interface HabitWithLogs extends Habit {
  logs: HabitLog[]
  /** Whether today's log is completed */
  isCompletedToday: boolean
}

// ─── Zod Schemas ──────────────────────────────────────────────
export const createHabitSchema = z.object({
  title: z.string().min(1, 'Judul habit wajib diisi').max(100, 'Judul terlalu panjang'),
})

export type CreateHabitInput = z.infer<typeof createHabitSchema>

// ─── Mappers ──────────────────────────────────────────────────
export function mapHabitRow(row: HabitRow): Habit {
  return {
    id:            row.id,
    userId:        row.user_id,
    title:         row.title,
    currentStreak: row.current_streak,
    createdAt:     row.created_at,
    updatedAt:     row.updated_at,
  }
}

export function mapHabitLogRow(row: HabitLogRow): HabitLog {
  return {
    id:        row.id,
    habitId:   row.habit_id,
    userId:    row.user_id,
    logDate:   row.log_date,
    completed: row.completed,
    createdAt: row.created_at,
  }
}
