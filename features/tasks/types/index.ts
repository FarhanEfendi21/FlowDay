import { z } from 'zod'
import type { Database } from '@/lib/types/database.types'

// ─── Raw DB Row ────────────────────────────────────────────────
export type TaskRow = Database['public']['Tables']['tasks']['Row']

// ─── Domain Types ──────────────────────────────────────────────
export type TaskPriority = 'low' | 'medium' | 'high'
export type TaskStatus   = 'todo' | 'done'
export type TaskDateRange = 'today' | 'this_week' | 'overdue' | 'upcoming' | 'all'

export interface Task {
  id:          string
  userId:      string
  title:       string
  description: string | null
  subject:     string
  priority:    TaskPriority
  status:      TaskStatus
  dueDate:     string   // ISO 8601 datetime: 'YYYY-MM-DDTHH:mm:ss.sssZ'
  createdAt:   string
  updatedAt:   string
  deletedAt:   string | null
}

// ─── Countdown Info ────────────────────────────────────────────
export interface TaskWithCountdown extends Task {
  isOverdue:        boolean
  hoursRemaining:   number
  minutesRemaining: number
  daysRemaining:    number
}

// ─── Advanced Filter / Query Options ──────────────────────────
export interface GetTasksFilter {
  /** Filter by single subject (mata kuliah) */
  subject?:    string
  /** Filter by multiple subjects */
  subjects?:   string[]
  /** Filter by status */
  status?:     TaskStatus
  /** Filter by priority */
  priority?:   TaskPriority
  /** Filter by date range category */
  dateRange?:  TaskDateRange
  /** Sort direction for due_date ('asc' = deadline terdekat dulu) */
  order?:      'asc' | 'desc'
  /** Max results to return */
  limit?:      number
  /** Search keyword untuk title atau description */
  search?:     string
  /** Include deleted tasks (untuk trash page) */
  includeDeleted?: boolean
}

// ─── Zod Schemas ──────────────────────────────────────────────
export const createTaskSchema = z.object({
  title:       z.string().min(1, 'Judul wajib diisi').max(255, 'Judul terlalu panjang'),
  description: z.string().max(1000).optional(),
  subject:     z.string().min(1, 'Mata kuliah wajib diisi'),
  priority:    z.enum(['low', 'medium', 'high']).default('medium'),
  dueDate:     z.string().min(1, 'Deadline wajib diisi'), // ISO 8601 datetime string
  dueTime:     z.string().optional(), // HH:mm format (optional, for UI convenience)
})

export const updateTaskSchema = createTaskSchema
  .partial()
  .extend({ status: z.enum(['todo', 'done']).optional() })

// ─── Input Types ──────────────────────────────────────────────
export type CreateTaskInput = z.infer<typeof createTaskSchema>
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>

// ─── Mapper: DB Row → Domain ───────────────────────────────────
export function mapTaskRow(row: TaskRow): Task {
  return {
    id:          row.id,
    userId:      row.user_id,
    title:       row.title,
    description: row.description,
    subject:     row.subject,
    priority:    row.priority as TaskPriority,
    status:      row.status   as TaskStatus,
    dueDate:     row.due_date,
    createdAt:   row.created_at,
    updatedAt:   row.updated_at,
    deletedAt:   row.deleted_at,
  }
}

// ─── Date Range Helpers ────────────────────────────────────────
/** Returns ISO date string 'YYYY-MM-DD' for today */
export function todayISO(): string {
  return new Date().toISOString().split('T')[0]
}

/** Returns ISO date string N days from today */
export function futureDateISO(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

/** Returns ISO date string for start of current week (Monday) */
export function startOfWeekISO(): string {
  const d = new Date()
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  d.setDate(diff)
  return d.toISOString().split('T')[0]
}

// ─── DateTime Helpers ──────────────────────────────────────────
/** Combine date (YYYY-MM-DD) and time (HH:mm) into ISO datetime string */
export function combineDateTimeISO(date: string, time: string): string {
  return `${date}T${time}:00.000Z`
}

/** Extract date from ISO datetime string */
export function extractDate(datetime: string): string {
  return datetime.split('T')[0]
}

/** Extract time (HH:mm) from ISO datetime string */
export function extractTime(datetime: string): string {
  const time = datetime.split('T')[1]
  if (!time) return '23:59'
  return time.substring(0, 5) // HH:mm
}

/** Format datetime for display (e.g., "31 Des 2024, 23:59") */
export function formatDeadline(datetime: string, locale: Locale = id): string {
  const date = new Date(datetime)
  return format(date, "d MMM yyyy, HH:mm", { locale })
}

/** Calculate countdown from now to deadline */
export function calculateCountdown(deadline: string): {
  isOverdue: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
  totalHours: number
  totalMinutes: number
} {
  const now = new Date()
  const target = new Date(deadline)
  const diff = target.getTime() - now.getTime()
  
  const isOverdue = diff < 0
  const absDiff = Math.abs(diff)
  
  const days = Math.floor(absDiff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((absDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  const minutes = Math.floor((absDiff % (1000 * 60 * 60)) / (1000 * 60))
  const seconds = Math.floor((absDiff % (1000 * 60)) / 1000)
  
  const totalHours = Math.floor(absDiff / (1000 * 60 * 60))
  const totalMinutes = Math.floor(absDiff / (1000 * 60))
  
  return {
    isOverdue,
    days,
    hours,
    minutes,
    seconds,
    totalHours,
    totalMinutes,
  }
}

import { format } from 'date-fns'
import { id } from 'date-fns/locale'
import type { Locale } from 'date-fns'
