import { z } from 'zod'

// ─── Domain Types ──────────────────────────────────────────────
export type PomodoroType = 'work' | 'short_break' | 'long_break'
export type PomodoroStatus = 'in_progress' | 'completed' | 'cancelled'

export interface PomodoroSession {
  id: string
  userId: string
  taskId: string | null
  type: PomodoroType
  durationMinutes: number
  completedMinutes: number
  status: PomodoroStatus
  startedAt: string
  completedAt: string | null
  createdAt: string
  updatedAt: string
}

export interface PomodoroSettings {
  workDuration: number // minutes
  shortBreak: number
  longBreak: number
  sessionsUntilLongBreak: number
  autoStartBreaks: boolean
  autoStartWork: boolean
  soundEnabled: boolean
}

export interface PomodoroStats {
  totalSessions: number
  completedSessions: number
  totalWorkMinutes: number
  totalBreakMinutes: number
  dailyBreakdown: Array<{
    date: string
    workMinutes: number
    sessions: number
  }>
}

// ─── Zod Schemas ──────────────────────────────────────────────
export const createPomodoroSessionSchema = z.object({
  taskId: z.string().uuid().optional().nullable(),
  type: z.enum(['work', 'short_break', 'long_break']),
  durationMinutes: z.number().min(1).max(120),
})

export const updatePomodoroSessionSchema = z.object({
  completedMinutes: z.number().min(0).optional(),
  status: z.enum(['in_progress', 'completed', 'cancelled']).optional(),
  completedAt: z.string().optional(),
})

export const pomodoroSettingsSchema = z.object({
  workDuration: z.number().min(1).max(60).default(25),
  shortBreak: z.number().min(1).max(30).default(5),
  longBreak: z.number().min(1).max(60).default(15),
  sessionsUntilLongBreak: z.number().min(2).max(10).default(4),
  autoStartBreaks: z.boolean().default(false),
  autoStartWork: z.boolean().default(false),
  soundEnabled: z.boolean().default(true),
})

// ─── Input Types ──────────────────────────────────────────────
export type CreatePomodoroSessionInput = z.infer<typeof createPomodoroSessionSchema>
export type UpdatePomodoroSessionInput = z.infer<typeof updatePomodoroSessionSchema>
export type PomodoroSettingsInput = z.infer<typeof pomodoroSettingsSchema>

// ─── Timer State ──────────────────────────────────────────────
export interface PomodoroTimerState {
  sessionId: string | null
  type: PomodoroType
  durationMinutes: number
  remainingSeconds: number
  isRunning: boolean
  isPaused: boolean
  taskId: string | null
  completedWorkSessions: number // Track for long break
}
