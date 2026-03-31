// ============================================================
// FlowDay – Zustand Store
// Hanya untuk state UI sementara yang tidak perlu di-persist
// ke Supabase. Tasks, habits, dan subjects sudah dikelola
// sepenuhnya via React Query → Supabase.
// ============================================================

import { create } from 'zustand'

export type Priority = 'low' | 'medium' | 'high'
export type Status = 'todo' | 'done'

export interface Task {
  id: string
  title: string
  description?: string
  priority: Priority
  status: Status
  dueDate: string
  subject: string
  createdAt: string
}

export interface Habit {
  id: string
  title: string
  currentStreak: number
  logs: { date: string; completed: boolean }[]
  createdAt: string
}

// Store ini dipertahankan untuk kompatibilitas backward, namun
// tidak lagi menyimpan data nyata (tasks/habits/subjects sekarang
// dikelola oleh React Query + Supabase dengan isolasi per-user).
interface FlowDayStore {
  tasks: Task[]
  habits: Habit[]
}

export const useStore = create<FlowDayStore>()(() => ({
  tasks:  [],
  habits: [],
}))
