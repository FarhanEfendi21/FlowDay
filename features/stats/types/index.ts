// ============================================================
// FlowDay – Stats Types
// Semua types untuk aggregated statistics
// ============================================================

// ─── Weekly Task Stats (dari RPC: get_weekly_task_stats) ──────
export interface DailyTaskStat {
  /** 'YYYY-MM-DD' */
  date:      string
  /** Label singkat: 'Sen', 'Sel', dll */
  dayLabel:  string
  completed: number
  created:   number
}

// ─── Subject Stats (dari RPC: get_subject_task_stats) ─────────
export interface SubjectTaskStat {
  subject:         string
  total:           number
  completed:       number
  pending:         number
  overdue:         number
  completionRate:  number  // 0–100
}

// ─── Habit Stats (dari RPC: get_habit_stats) ──────────────────
export interface HabitStat {
  habitId:        string
  title:          string
  currentStreak:  number
  longestStreak:  number
  completionRate: number  // 0–100, 30 hari terakhir
  totalDays:      number
  completedDays:  number
}

// ─── Dashboard Summary (dari RPC: get_dashboard_summary) ──────
export interface DashboardSummary {
  totalTasks:      number
  completedTasks:  number
  pendingTasks:    number
  overdueTasks:    number
  tasksDueToday:   number
  tasksDueWeek:    number
  completionRate:  number  // 0–100
  totalHabits:     number
  totalStreak:     number
  habitsDoneToday: number
  habitCompletionRate: number  // 0–100 hari ini
}

// ─── Mappers ──────────────────────────────────────────────────
import { format } from 'date-fns'
import { id as localeId } from 'date-fns/locale'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDailyTaskStat(row: any): DailyTaskStat {
  const date = new Date(row.stat_date)
  return {
    date:      format(date, 'yyyy-MM-dd'),
    dayLabel:  format(date, 'EEE', { locale: localeId }),
    completed: Number(row.completed ?? 0),
    created:   Number(row.created   ?? 0),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapSubjectTaskStat(row: any): SubjectTaskStat {
  const total     = Number(row.total     ?? 0)
  const completed = Number(row.completed ?? 0)
  return {
    subject:        row.subject     ?? '',
    total,
    completed,
    pending:        Number(row.pending   ?? 0),
    overdue:        Number(row.overdue   ?? 0),
    completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapHabitStat(row: any): HabitStat {
  return {
    habitId:        row.habit_id,
    title:          row.title,
    currentStreak:  Number(row.current_streak  ?? 0),
    longestStreak:  Number(row.longest_streak  ?? 0),
    completionRate: Number(row.completion_rate ?? 0),
    totalDays:      Number(row.total_days      ?? 0),
    completedDays:  Number(row.completed_days  ?? 0),
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapDashboardSummary(row: any): DashboardSummary {
  const totalTasks     = Number(row.total_tasks     ?? 0)
  const completedTasks = Number(row.completed_tasks ?? 0)
  const totalHabits    = Number(row.total_habits    ?? 0)
  const habitsDoneToday = Number(row.habits_done_today ?? 0)
  return {
    totalTasks,
    completedTasks,
    pendingTasks:     Number(row.pending_tasks     ?? 0),
    overdueTasks:     Number(row.overdue_tasks     ?? 0),
    tasksDueToday:    Number(row.tasks_due_today   ?? 0),
    tasksDueWeek:     Number(row.tasks_due_week    ?? 0),
    completionRate:   totalTasks > 0
      ? Math.round((completedTasks / totalTasks) * 100)
      : 0,
    totalHabits,
    totalStreak:      Number(row.total_streak      ?? 0),
    habitsDoneToday,
    habitCompletionRate: totalHabits > 0
      ? Math.round((habitsDoneToday / totalHabits) * 100)
      : 0,
  }
}
