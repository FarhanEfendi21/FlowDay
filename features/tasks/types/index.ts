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
  dueDate:     string   // 'YYYY-MM-DD'
  createdAt:   string
  updatedAt:   string
  deletedAt:   string | null
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
  dueDate:     z.string().min(1, 'Deadline wajib diisi'),
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
