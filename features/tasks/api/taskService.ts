// ============================================================
// FlowDay – Task Service (Advanced)
// Semua query ke Supabase untuk tasks dengan sorting,
// filtering multi-dimensi, dan query yang efisien
// ============================================================

import { createClient } from '@/lib/supabase/client'
import {
  type Task,
  type CreateTaskInput,
  type UpdateTaskInput,
  type GetTasksFilter,
  type TaskPriority,
  type TaskStatus,
  createTaskSchema,
  updateTaskSchema,
  mapTaskRow,
  todayISO,
  futureDateISO,
  startOfWeekISO,
} from '@/features/tasks/types'

// ─── Client singleton ──────────────────────────────────────────
// Re-use the shared browser client (from lib/supabase/client) so
// that a single Supabase session/cookie is used across all calls.
// Creating a new createBrowserClient() per-call was causing stale
// or cross-user session fragments in the cookie jar.
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
  if (data === null || data === undefined)
    throw new ServiceError(`[${context}] Data not found`)
  return data as T
}

// ─── SELECT column list (reusable) ───────────────────────────
const TASK_COLUMNS =
  'id, user_id, title, description, subject, priority, status, due_date, created_at, updated_at'

// ─── getTasks ────────────────────────────────────────────────
/**
 * Fetch tasks milik user dengan full filter & sort support.
 *
 * Fitur:
 * - Sort by due_date ASC (deadline terdekat dulu)
 * - Filter by subject, subjects[], status, priority, dateRange
 * - Limit hasil
 */
export async function getTasks(filter: GetTasksFilter = {}): Promise<Task[]> {
  const supabase = getClient()
  const today    = todayISO()

  let query = supabase
    .from('tasks')
    .select(TASK_COLUMNS)
    // ── Primary sort: deadline terdekat dulu ───────────────
    .order('due_date', { ascending: filter.order !== 'desc' })
    // ── Secondary sort: priority (high > medium > low) ─────
    .order('priority', { ascending: false })

  // ── Filter: single subject ────────────────────────────────
  if (filter.subject && filter.subject !== 'all') {
    query = query.eq('subject', filter.subject)
  }

  // ── Filter: multiple subjects ─────────────────────────────
  if (filter.subjects && filter.subjects.length > 0) {
    query = query.in('subject', filter.subjects)
  }

  // ── Filter: status ────────────────────────────────────────
  if (filter.status) {
    query = query.eq('status', filter.status)
  }

  // ── Filter: priority ──────────────────────────────────────
  if (filter.priority) {
    query = query.eq('priority', filter.priority)
  }

  // ── Filter: date range ────────────────────────────────────
  switch (filter.dateRange) {
    case 'today':
      query = query.eq('due_date', today)
      break
    case 'this_week':
      query = query
        .gte('due_date', startOfWeekISO())
        .lte('due_date', futureDateISO(7))
      break
    case 'overdue':
      query = query.lt('due_date', today).eq('status', 'todo')
      break
    case 'upcoming':
      query = query
        .gte('due_date', today)
        .eq('status', 'todo')
      break
    // 'all' or undefined: no date filter
  }

  // ── Limit ─────────────────────────────────────────────────
  if (filter.limit) {
    query = query.limit(filter.limit)
  }

  const { data, error } = await query
  if (error) throw new ServiceError(`[getTasks] ${error.message}`, error)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return ((data as any[]) ?? []).map(mapTaskRow)
}

// ─── getUpcomingTasks ────────────────────────────────────────
/**
 * Shortcut: deadline terdekat, status todo.
 * Digunakan di dashboard.
 */
export async function getUpcomingTasks(limit = 5): Promise<Task[]> {
  return getTasks({ status: 'todo', dateRange: 'upcoming', order: 'asc', limit })
}

// ─── getOverdueTasks ─────────────────────────────────────────
/**
 * Shortcut: tugas yang sudah melewati deadline.
 */
export async function getOverdueTasks(): Promise<Task[]> {
  return getTasks({ dateRange: 'overdue', order: 'asc' })
}

// ─── getTasksBySubject ────────────────────────────────────────
/**
 * Shortcut: semua tasks untuk 1 mata kuliah.
 */
export async function getTasksBySubject(subject: string): Promise<Task[]> {
  return getTasks({ subject, order: 'asc' })
}

// ─── createTask ──────────────────────────────────────────────
export async function createTask(input: CreateTaskInput): Promise<Task> {
  const parsed = createTaskSchema.safeParse(input)
  if (!parsed.success)
    throw new ServiceError(`[createTask] ${parsed.error.errors[0].message}`)

  const supabase = getClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user)
    throw new ServiceError('[createTask] User not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id:     user.id,
      title:       parsed.data.title,
      description: parsed.data.description ?? null,
      subject:     parsed.data.subject,
      priority:    parsed.data.priority,
      due_date:    parsed.data.dueDate,
      status:      'todo',
    })
    .select(TASK_COLUMNS)
    .single()

  return mapTaskRow(assertRow(data, error, 'createTask'))
}

// ─── updateTask ──────────────────────────────────────────────
export async function updateTask(id: string, input: UpdateTaskInput): Promise<Task> {
  const parsed = updateTaskSchema.safeParse(input)
  if (!parsed.success)
    throw new ServiceError(`[updateTask] ${parsed.error.errors[0].message}`)

  const supabase = getClient()
  const payload: Record<string, unknown> = {}
  if (parsed.data.title       !== undefined) payload.title       = parsed.data.title
  if (parsed.data.description !== undefined) payload.description = parsed.data.description
  if (parsed.data.subject     !== undefined) payload.subject     = parsed.data.subject
  if (parsed.data.priority    !== undefined) payload.priority    = parsed.data.priority
  if (parsed.data.status      !== undefined) payload.status      = parsed.data.status
  if (parsed.data.dueDate     !== undefined) payload.due_date    = parsed.data.dueDate

  const { data, error } = await supabase
    .from('tasks')
    .update(payload)
    .eq('id', id)
    .select(TASK_COLUMNS)
    .single()

  return mapTaskRow(assertRow(data, error, 'updateTask'))
}

// ─── deleteTask ──────────────────────────────────────────────
export async function deleteTask(id: string): Promise<void> {
  const supabase = getClient()
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw new ServiceError(`[deleteTask] ${error.message}`, error)
}

// ─── toggleTaskStatus ────────────────────────────────────────
/**
 * Flip status 'todo' ↔ 'done'.
 * Fetch current status → compute new → update.
 */
export async function toggleTaskStatus(id: string): Promise<Task> {
  const supabase = getClient()

  const { data: current, error: fetchError } = await supabase
    .from('tasks')
    .select('status')
    .eq('id', id)
    .single()

  if (fetchError || !current)
    throw new ServiceError(`[toggleTaskStatus] Task not found: ${id}`)

  const newStatus: TaskStatus =
    (current as { status: TaskStatus }).status === 'todo' ? 'done' : 'todo'

  const { data, error } = await supabase
    .from('tasks')
    .update({ status: newStatus as string })
    .eq('id', id)
    .select(TASK_COLUMNS)
    .single()

  return mapTaskRow(assertRow(data, error, 'toggleTaskStatus'))
}

// Re-export types untuk convenience
export type { TaskPriority, TaskStatus }
