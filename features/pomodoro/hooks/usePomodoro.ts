import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import {
  createPomodoroSession,
  updatePomodoroSession,
  getPomodoroSessions,
  getPomodoroStats,
  getPomodoroSettings,
  updatePomodoroSettings,
} from "../api/pomodoroService"
import type {
  CreatePomodoroSessionInput,
  UpdatePomodoroSessionInput,
  PomodoroSettingsInput,
} from "../types"

// ─── Query Keys ────────────────────────────────────────────────
const POMODORO_KEYS = {
  all: ["pomodoro"] as const,
  sessions: () => [...POMODORO_KEYS.all, "sessions"] as const,
  stats: (days: number) => [...POMODORO_KEYS.all, "stats", days] as const,
  settings: () => [...POMODORO_KEYS.all, "settings"] as const,
}

// ─── Sessions ──────────────────────────────────────────────────

export function useGetPomodoroSessions(limit = 50) {
  return useQuery({
    queryKey: [...POMODORO_KEYS.sessions(), limit],
    queryFn: () => getPomodoroSessions(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

export function useCreatePomodoroSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (input: CreatePomodoroSessionInput) => createPomodoroSession(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POMODORO_KEYS.sessions() })
      queryClient.invalidateQueries({ queryKey: POMODORO_KEYS.all })
    },
  })
}

export function useUpdatePomodoroSession() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ sessionId, input }: { sessionId: string; input: UpdatePomodoroSessionInput }) =>
      updatePomodoroSession(sessionId, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POMODORO_KEYS.sessions() })
      queryClient.invalidateQueries({ queryKey: POMODORO_KEYS.all })
    },
  })
}

// ─── Stats ─────────────────────────────────────────────────────

export function useGetPomodoroStats(days = 7) {
  return useQuery({
    queryKey: POMODORO_KEYS.stats(days),
    queryFn: () => getPomodoroStats(days),
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

// ─── Settings ──────────────────────────────────────────────────

export function useGetPomodoroSettings() {
  return useQuery({
    queryKey: POMODORO_KEYS.settings(),
    queryFn: getPomodoroSettings,
    staleTime: 1000 * 60 * 10, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when user returns to tab
  })
}

export function useUpdatePomodoroSettings() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (settings: Partial<PomodoroSettingsInput>) => updatePomodoroSettings(settings),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: POMODORO_KEYS.settings() })
    },
  })
}
