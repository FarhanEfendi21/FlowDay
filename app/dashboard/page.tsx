"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import {
  CheckCircle2,
  Clock,
  Flame,
  ArrowRight,
  Calendar,
  AlertCircle,
  TrendingUp,
  BookOpen,
} from "lucide-react"
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns"
import { id as localeId } from "date-fns/locale"

// ── Feature hooks ─────────────────────────────────────────────
import { useDashboardSummary, useWeeklyTaskStats, useSubjectTaskStats } from "@/features/stats"
import { useUpcomingTasks } from "@/features/tasks"
import { useGetHabits } from "@/features/habits"

export default function DashboardPage() {
  // ── Data fetching — semua parallel ───────────────────────
  const { data: summary,   isLoading: loadingSummary }   = useDashboardSummary()
  const { data: weekly,    isLoading: loadingWeekly }    = useWeeklyTaskStats()
  const { data: subjects,  isLoading: loadingSubjects }  = useSubjectTaskStats()
  const { data: upcoming,  isLoading: loadingUpcoming }  = useUpcomingTasks(5)
  const { data: habits = [], isLoading: loadingHabits }  = useGetHabits()

  const today = new Date().toISOString().split("T")[0]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Ini ringkasan progress kamu.
        </p>
      </div>

      {/* ─── Stats Cards ──────────────────────────────────── */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Tugas Selesai"
          value={summary ? `${summary.completedTasks}/${summary.totalTasks}` : "—"}
          subtitle={summary ? `${summary.completionRate}% completion rate` : "Memuat..."}
          icon={<CheckCircle2 className="h-4 w-4" />}
          isLoading={loadingSummary}
        />
        <StatCard
          title="Tugas Pending"
          value={summary ? summary.pendingTasks.toString() : "—"}
          subtitle={
            summary
              ? summary.overdueTasks > 0
                ? `${summary.overdueTasks} overdue`
                : "Semua on track"
              : "Memuat..."
          }
          icon={<Clock className="h-4 w-4" />}
          alert={!!summary && summary.overdueTasks > 0}
          isLoading={loadingSummary}
        />
        <StatCard
          title="Total Streak"
          value={summary ? `${summary.totalStreak} hari` : "—"}
          subtitle={
            summary
              ? `${summary.habitsDoneToday}/${summary.totalHabits} selesai hari ini`
              : "Memuat..."
          }
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          isLoading={loadingSummary}
        />
        <StatCard
          title="Deadline Minggu Ini"
          value={summary ? summary.tasksDueWeek.toString() : "—"}
          subtitle={
            summary
              ? summary.tasksDueToday > 0
                ? `${summary.tasksDueToday} jatuh tempo hari ini!`
                : "Tidak ada deadline hari ini"
              : "Memuat..."
          }
          icon={<Calendar className="h-4 w-4" />}
          alert={!!summary && summary.tasksDueToday > 0}
          isLoading={loadingSummary}
        />
      </div>

      {/* ─── Main Row: Weekly Chart + Habits ─────────────── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Weekly Progress Bar Chart */}
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <TrendingUp className="h-4 w-4" />
              Progress Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingWeekly ? (
              <div className="flex items-end gap-2 h-32">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 rounded" style={{ height: `${40 + Math.random() * 60}%` }} />
                ))}
              </div>
            ) : weekly && weekly.length > 0 ? (
              <WeeklyChart data={weekly} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                Belum ada data minggu ini.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Habits Hari Ini */}
        <Card className="lg:col-span-3">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Habit Hari Ini</CardTitle>
            <Link href="/dashboard/habits">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {loadingHabits ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : habits.length > 0 ? (
              habits.slice(0, 4).map((habit) => (
                <div key={habit.id} className="flex items-center gap-3">
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full ${
                      habit.isCompletedToday
                        ? "bg-green-100 text-green-600 dark:bg-green-900/30"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {habit.isCompletedToday ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Flame className="h-4 w-4" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{habit.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {habit.currentStreak} hari streak
                    </p>
                  </div>
                  {habit.isCompletedToday && (
                    <Badge variant="secondary" className="text-xs shrink-0">Done</Badge>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                Belum ada habit. Tambah habit pertamamu!
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ─── Bottom Row: Upcoming Tasks + Subject Stats ─── */}
      <div className="grid gap-6 lg:grid-cols-7">
        {/* Upcoming Tasks */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-medium">Tugas Mendatang</CardTitle>
            <Link href="/dashboard/tasks">
              <Button variant="ghost" size="sm" className="gap-1 text-xs">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {loadingUpcoming ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <div className="flex-1 space-y-1">
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                    <Skeleton className="h-5 w-14 rounded-full" />
                  </div>
                ))
              ) : upcoming && upcoming.length > 0 ? (
                upcoming.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <PriorityDot priority={task.priority} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground">{task.subject}</p>
                      </div>
                    </div>
                    <DeadlineBadge dueDate={task.dueDate} />
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">
                  Tidak ada tugas pending. Bagus! 🎉
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Subject Breakdown */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base font-medium">
              <BookOpen className="h-4 w-4" />
              Per Mata Kuliah
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingSubjects ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : subjects && subjects.length > 0 ? (
              <div className="space-y-4">
                {subjects.slice(0, 5).map((s) => (
                  <div key={s.subject} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{s.subject}</span>
                      <span className="text-muted-foreground ml-2 shrink-0">
                        {s.completed}/{s.total}
                      </span>
                    </div>
                    <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: `${s.completionRate}%` }}
                      />
                    </div>
                    {s.overdue > 0 && (
                      <p className="text-xs text-destructive">
                        {s.overdue} overdue
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">
                Belum ada tugas. Tambah tugas pertamamu!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── Sub-components ────────────────────────────────────────────

function StatCard({
  title,
  value,
  subtitle,
  icon,
  alert = false,
  isLoading = false,
}: {
  title:     string
  value:     string
  subtitle:  string
  icon:      React.ReactNode
  alert?:    boolean
  isLoading?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{title}</span>
          <div className={alert ? "text-destructive" : "text-muted-foreground"}>
            {alert ? <AlertCircle className="h-4 w-4" /> : icon}
          </div>
        </div>
        {isLoading ? (
          <>
            <Skeleton className="mt-2 h-7 w-20" />
            <Skeleton className="mt-1 h-3 w-28" />
          </>
        ) : (
          <>
            <p className="mt-2 text-2xl font-semibold">{value}</p>
            <p className={`mt-1 text-xs ${alert ? "text-destructive" : "text-muted-foreground"}`}>
              {subtitle}
            </p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

// ── Weekly Bar Chart ──────────────────────────────────────────
import type { DailyTaskStat } from "@/features/stats"

function WeeklyChart({ data }: { data: DailyTaskStat[] }) {
  const maxCompleted = Math.max(...data.map((d) => d.completed), 1)

  return (
    <div className="space-y-3">
      <div className="flex items-end justify-between gap-1 h-32">
        {data.map((day) => {
          const heightPct = Math.round((day.completed / maxCompleted) * 100)
          const isToday   = day.date === new Date().toISOString().split("T")[0]
          return (
            <div key={day.date} className="flex flex-1 flex-col items-center gap-1">
              <span className="text-xs font-medium text-foreground">
                {day.completed > 0 ? day.completed : ""}
              </span>
              <div className="w-full flex items-end" style={{ height: "96px" }}>
                <div
                  className={`w-full rounded-t-sm transition-all ${
                    isToday ? "bg-primary" : "bg-primary/30"
                  }`}
                  style={{ height: `${Math.max(heightPct, 4)}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between">
        {data.map((day) => {
          const isToday = day.date === new Date().toISOString().split("T")[0]
          return (
            <div key={day.date} className="flex-1 text-center">
              <span className={`text-xs ${isToday ? "font-semibold text-primary" : "text-muted-foreground"}`}>
                {day.dayLabel}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = {
    high:   "bg-red-500",
    medium: "bg-yellow-500",
    low:    "bg-green-500",
  }
  return (
    <div className={`h-2 w-2 shrink-0 rounded-full ${colors[priority] ?? "bg-muted"}`} />
  )
}

function DeadlineBadge({ dueDate }: { dueDate: string }) {
  const date     = new Date(dueDate)
  const isOverdue = isPast(date) && !isToday(date)
  let text = format(date, "d MMM", { locale: localeId })
  if (isToday(date))    text = "Hari ini"
  if (isTomorrow(date)) text = "Besok"
  return (
    <Badge
      variant={isOverdue ? "destructive" : "secondary"}
      className="text-xs shrink-0"
    >
      {isOverdue ? "Overdue" : text}
    </Badge>
  )
}
