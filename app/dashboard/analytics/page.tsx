"use client"

import { useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import {
  Bar,
  BarChart,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import {
  CheckCircle2,
  Flame,
  TrendingUp,
  BookOpen,
  Target,
  Clock,
} from "lucide-react"

// ── Supabase hooks — semua data user-specific via p_user_id ───
import {
  useDashboardSummary,
  useWeeklyTaskStats,
  useSubjectTaskStats,
  useHabitStats,
} from "@/features/stats"
import { useGetTasks } from "@/features/tasks"

export default function AnalyticsPage() {
  // ── Semua query paralel, user-isolated via RLS + Supabase RPC ─
  const { data: summary,  isLoading: loadingSummary  } = useDashboardSummary()
  const { data: weekly,   isLoading: loadingWeekly   } = useWeeklyTaskStats()
  const { data: subjects, isLoading: loadingSubjects } = useSubjectTaskStats()
  const { data: habitStats, isLoading: loadingHabits } = useHabitStats()
  const { data: tasks = [], isLoading: loadingTasks  } = useGetTasks()

  // ── Priority breakdown (kalkulasi client-side dari tasks DB) ──
  const priorityStats = useMemo(() => ({
    high:   tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low:    tasks.filter((t) => t.priority === "low").length,
  }), [tasks])

  // ── Habit consistency chart dari habitStats RPC ────────────
  // habitStats sudah berisi completion_rate per habit (30 hari),
  // kita gunakan rata-rata sebagai indikator konsistensi
  const avgHabitCompletion = useMemo(() => {
    if (!habitStats || habitStats.length === 0) return 0
    const total = habitStats.reduce((sum, h) => sum + h.completionRate, 0)
    return Math.round(total / habitStats.length)
  }, [habitStats])

  const isLoading = loadingSummary || loadingWeekly || loadingSubjects || loadingHabits || loadingTasks

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Lihat statistik dan progress belajarmu
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Completion Rate"
          value={summary ? `${summary.completionRate}%` : "—"}
          subtitle={
            summary
              ? `${summary.completedTasks} dari ${summary.totalTasks} tugas`
              : "Memuat..."
          }
          icon={<Target className="h-4 w-4" />}
          isLoading={loadingSummary}
        />
        <StatsCard
          title="Tugas Pending"
          value={summary ? summary.pendingTasks.toString() : "—"}
          subtitle={
            summary
              ? summary.overdueTasks > 0
                ? `${summary.overdueTasks} sudah overdue`
                : "Semua on track"
              : "Memuat..."
          }
          icon={<Clock className="h-4 w-4" />}
          isLoading={loadingSummary}
        />
        <StatsCard
          title="Total Streak"
          value={summary ? `${summary.totalStreak} hari` : "—"}
          subtitle={
            summary
              ? `Rata-rata ${habitStats && habitStats.length > 0
                  ? Math.round(summary.totalStreak / habitStats.length)
                  : 0} hari/habit`
              : "Memuat..."
          }
          icon={<Flame className="h-4 w-4 text-orange-500" />}
          isLoading={loadingSummary || loadingHabits}
        />
        <StatsCard
          title="Habit Aktif"
          value={summary ? summary.totalHabits.toString() : "—"}
          subtitle={
            summary
              ? `${summary.habitsDoneToday} selesai hari ini`
              : "Memuat..."
          }
          icon={<TrendingUp className="h-4 w-4" />}
          isLoading={loadingSummary}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Weekly Task Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Progress Tugas Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {loadingWeekly ? (
                <div className="flex items-end gap-2 h-full">
                  {Array.from({ length: 7 }).map((_, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded"
                      style={{ height: `${30 + Math.random() * 60}%` }}
                    />
                  ))}
                </div>
              ) : weekly && weekly.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly}>
                    <XAxis
                      dataKey="dayLabel"
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload
                          return (
                            <div className="rounded-lg border bg-background p-2 shadow-sm">
                              <p className="text-sm font-medium">{data.date}</p>
                              <p className="text-xs text-muted-foreground">
                                Selesai: {data.completed} tugas
                              </p>
                            </div>
                          )
                        }
                        return null
                      }}
                    />
                    <Bar
                      dataKey="completed"
                      fill="hsl(var(--foreground))"
                      radius={[4, 4, 0, 0]}
                      maxBarSize={40}
                    />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <p className="text-sm text-muted-foreground">
                    Belum ada tugas selesai minggu ini
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Habit Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base font-medium">
              Statistik Habit (30 Hari)
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loadingHabits ? (
              <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1">
                    <Skeleton className="h-3 w-2/3" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                ))}
              </div>
            ) : habitStats && habitStats.length > 0 ? (
              <div className="space-y-4">
                {/* Ring rata-rata konsistensi */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    Rata-rata konsistensi
                  </span>
                  <span className="font-semibold">{avgHabitCompletion}%</span>
                </div>
                <Progress value={avgHabitCompletion} className="h-2 mb-4" />
                {/* Per-habit breakdown */}
                <div className="space-y-3">
                  {habitStats.slice(0, 5).map((habit) => (
                    <div key={habit.habitId} className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium truncate max-w-[60%]">
                          {habit.title}
                        </span>
                        <span className="text-muted-foreground text-xs">
                          🔥 {habit.currentStreak} hari · {habit.completionRate}%
                        </span>
                      </div>
                      <Progress value={habit.completionRate} className="h-1.5" />
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[200px]">
                <p className="text-sm text-muted-foreground">
                  Belum ada data habit
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Tasks by Subject (dari Supabase RPC get_subject_task_stats) */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base font-medium">
            <BookOpen className="h-4 w-4" />
            Tugas per Mata Kuliah
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loadingSubjects ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <Skeleton className="h-3 w-1/3" />
                  <Skeleton className="h-2 w-full rounded-full" />
                </div>
              ))}
            </div>
          ) : subjects && subjects.length > 0 ? (
            <div className="space-y-4">
              {subjects.map((subject) => (
                <div key={subject.subject} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{subject.subject}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {subject.overdue > 0 && (
                        <span className="text-destructive font-medium">
                          {subject.overdue} overdue
                        </span>
                      )}
                      <span>
                        {subject.completed}/{subject.total}
                      </span>
                    </div>
                  </div>
                  <Progress
                    value={subject.completionRate}
                    className="h-2"
                  />
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-sm text-muted-foreground py-4">
              Belum ada data tugas per mata kuliah
            </p>
          )}
        </CardContent>
      </Card>

      {/* Priority Distribution */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prioritas Tinggi</p>
                {loadingTasks ? (
                  <Skeleton className="mt-1 h-8 w-10" />
                ) : (
                  <p className="mt-1 text-2xl font-semibold">
                    {priorityStats.high}
                  </p>
                )}
              </div>
              <div className="h-3 w-3 rounded-full bg-red-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prioritas Sedang</p>
                {loadingTasks ? (
                  <Skeleton className="mt-1 h-8 w-10" />
                ) : (
                  <p className="mt-1 text-2xl font-semibold">
                    {priorityStats.medium}
                  </p>
                )}
              </div>
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prioritas Rendah</p>
                {loadingTasks ? (
                  <Skeleton className="mt-1 h-8 w-10" />
                ) : (
                  <p className="mt-1 text-2xl font-semibold">
                    {priorityStats.low}
                  </p>
                )}
              </div>
              <div className="h-3 w-3 rounded-full bg-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

// ── StatsCard Component ────────────────────────────────────────
function StatsCard({
  title,
  value,
  subtitle,
  icon,
  isLoading = false,
}: {
  title: string
  value: string
  subtitle: string
  icon: React.ReactNode
  isLoading?: boolean
}) {
  return (
    <Card>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm text-muted-foreground truncate">{title}</span>
          <div className="text-muted-foreground shrink-0">{icon}</div>
        </div>
        {isLoading ? (
          <div className="mt-2 space-y-1">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ) : (
          <div className="mt-2">
            <p className="text-xl sm:text-2xl font-semibold truncate">{value}</p>
            <p className="mt-1 text-[10px] sm:text-xs text-muted-foreground line-clamp-1">{subtitle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
