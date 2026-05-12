import { createClient } from "@/lib/supabase/client"
import type {
  PomodoroSession,
  PomodoroSettings,
  PomodoroStats,
  CreatePomodoroSessionInput,
  UpdatePomodoroSessionInput,
  PomodoroSettingsInput,
} from "../types"

const supabase = createClient()

// ─── Session Management ────────────────────────────────────────

export async function createPomodoroSession(input: CreatePomodoroSessionInput): Promise<PomodoroSession> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .insert({
      user_id: user.id,
      task_id: input.taskId || null,
      type: input.type,
      duration_minutes: input.durationMinutes,
      status: "in_progress",
    })
    .select()
    .single()

  if (error) throw error
  return mapPomodoroSession(data)
}

export async function updatePomodoroSession(
  sessionId: string,
  input: UpdatePomodoroSessionInput
): Promise<PomodoroSession> {
  const updateData: any = {}
  
  if (input.completedMinutes !== undefined) {
    updateData.completed_minutes = input.completedMinutes
  }
  if (input.status) {
    updateData.status = input.status
  }
  if (input.completedAt) {
    updateData.completed_at = input.completedAt
  }

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .update(updateData)
    .eq("id", sessionId)
    .select()
    .single()

  if (error) throw error
  return mapPomodoroSession(data)
}

export async function getPomodoroSessions(limit = 50): Promise<PomodoroSession[]> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("pomodoro_sessions")
    .select("*")
    .eq("user_id", user.id)
    .order("started_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data.map(mapPomodoroSession)
}

export async function getPomodoroStats(days = 7): Promise<PomodoroStats> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase.rpc("get_pomodoro_stats", {
    p_user_id: user.id,
    p_days: days,
  })

  if (error) throw error
  
  return {
    totalSessions: data.total_sessions || 0,
    completedSessions: data.completed_sessions || 0,
    totalWorkMinutes: data.total_work_minutes || 0,
    totalBreakMinutes: data.total_break_minutes || 0,
    dailyBreakdown: data.daily_breakdown || [],
  }
}

// ─── Settings Management ───────────────────────────────────────

export async function getPomodoroSettings(): Promise<PomodoroSettings> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const { data, error } = await supabase
    .from("notification_preferences")
    .select("*")
    .eq("user_id", user.id)
    .single()

  if (error) {
    console.log("No Pomodoro settings found, returning defaults")
    // Return defaults if no preferences exist
    return {
      workDuration: 25,
      shortBreak: 5,
      longBreak: 15,
      sessionsUntilLongBreak: 4,
      autoStartBreaks: false,
      autoStartWork: false,
      soundEnabled: true,
    }
  }

  const settings = {
    workDuration: data.pomodoro_work_duration || 25,
    shortBreak: data.pomodoro_short_break || 5,
    longBreak: data.pomodoro_long_break || 15,
    sessionsUntilLongBreak: data.pomodoro_sessions_until_long_break || 4,
    autoStartBreaks: data.pomodoro_auto_start_breaks || false,
    autoStartWork: data.pomodoro_auto_start_work || false,
    soundEnabled: data.pomodoro_sound_enabled !== false, // Default true
  }
  
  console.log("Fetched Pomodoro settings:", settings)
  return settings
}

export async function updatePomodoroSettings(settings: Partial<PomodoroSettingsInput>): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error("User not authenticated")

  const updateData: any = {}
  
  if (settings.workDuration !== undefined) {
    updateData.pomodoro_work_duration = settings.workDuration
  }
  if (settings.shortBreak !== undefined) {
    updateData.pomodoro_short_break = settings.shortBreak
  }
  if (settings.longBreak !== undefined) {
    updateData.pomodoro_long_break = settings.longBreak
  }
  if (settings.sessionsUntilLongBreak !== undefined) {
    updateData.pomodoro_sessions_until_long_break = settings.sessionsUntilLongBreak
  }
  if (settings.autoStartBreaks !== undefined) {
    updateData.pomodoro_auto_start_breaks = settings.autoStartBreaks
  }
  if (settings.autoStartWork !== undefined) {
    updateData.pomodoro_auto_start_work = settings.autoStartWork
  }
  if (settings.soundEnabled !== undefined) {
    updateData.pomodoro_sound_enabled = settings.soundEnabled
  }

  console.log("Updating Pomodoro settings:", updateData)

  // Upsert to handle case where preferences don't exist yet
  const { data, error } = await supabase
    .from("notification_preferences")
    .upsert(
      {
        user_id: user.id,
        ...updateData,
      },
      {
        onConflict: "user_id",
      }
    )
    .select()

  if (error) {
    console.error("Failed to update Pomodoro settings:", error)
    throw error
  }
  
  console.log("Pomodoro settings updated successfully:", data)
}

// ─── Mapper ────────────────────────────────────────────────────

function mapPomodoroSession(row: any): PomodoroSession {
  return {
    id: row.id,
    userId: row.user_id,
    taskId: row.task_id,
    type: row.type,
    durationMinutes: row.duration_minutes,
    completedMinutes: row.completed_minutes,
    status: row.status,
    startedAt: row.started_at,
    completedAt: row.completed_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}
