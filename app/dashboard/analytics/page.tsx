"use client"

import { useState, useMemo } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
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
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { PomodoroStatsCard } from "@/components/pomodoro/pomodoro-stats-card"

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
  
  const [subjectPage, setSubjectPage] = useState(1)
  const SUBJECTS_PER_PAGE = 5
  
  const totalSubjectPages = Math.ceil((subjects?.length || 0) / SUBJECTS_PER_PAGE)
  const paginatedSubjects = useMemo(() => {
    if (!subjects) return []
    const start = (subjectPage - 1) * SUBJECTS_PER_PAGE
    return subjects.slice(start, start + SUBJECTS_PER_PAGE)
  }, [subjects, subjectPage])

  // ── Priority breakdown (kalkulasi client-side dari tasks DB) ──
  const priorityStats = useMemo(() => ({
    high:   tasks.filter((t) => t.priority === "high").length,
    medium: tasks.filter((t) => t.priority === "medium").length,
    low:    tasks.filter((t) => t.priority === "low").length,
  }), [tasks])

  const totalPriority = priorityStats.high + priorityStats.medium + priorityStats.low;

  // ── Habit consistency chart dari habitStats RPC ────────────
  // habitStats sudah berisi completion_rate per habit (30 hari),
  // kita gunakan rata-rata sebagai indikator konsistensi
  const avgHabitCompletion = useMemo(() => {
    if (!habitStats || habitStats.length === 0) return 0
    const total = habitStats.reduce((sum, h) => sum + h.completionRate, 0)
    return Math.round(total / habitStats.length)
  }, [habitStats])

  // Loading states are handled individually per component for better UX.

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Analytics</h1>
        <p className="text-muted-foreground">
          Lihat statistik dan progress belajarmu
        </p>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
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
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Progress Tugas Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              {loadingWeekly ? (
                <div className="flex items-end gap-2 h-full">
                  {/* Deterministic heights — no Math.random() to avoid hydration mismatch */}
                  {[50, 75, 40, 90, 60, 80, 35].map((h, i) => (
                    <Skeleton
                      key={i}
                      className="flex-1 rounded"
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              ) : weekly && weekly.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={weekly}>
                    <XAxis
                      dataKey="dayLabel"
                      stroke="var(--muted-foreground)"
                      fontSize={12}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      stroke="var(--muted-foreground)"
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
                      fill="var(--chart-1)"
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
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
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

      {/* Pomodoro Stats */}
      <PomodoroStatsCard />

      {/* Tasks by Subject (dari Supabase RPC get_subject_task_stats) */}
      <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />
        <CardHeader className="relative">
          <div className="flex items-center justify-between w-full">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
                <BookOpen className="h-4 w-4 text-purple-500" />
              </div>
              Tugas per Mata Kuliah
            </CardTitle>
            
            {subjects && subjects.length > SUBJECTS_PER_PAGE && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSubjectPage(p => Math.max(1, p - 1))}
                  disabled={subjectPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="text-xs font-medium min-w-[2.5rem] text-center">
                  {subjectPage} / {totalSubjectPages}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setSubjectPage(p => Math.min(totalSubjectPages, p + 1))}
                  disabled={subjectPage === totalSubjectPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
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
              {paginatedSubjects.map((subject) => (
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
                  <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className={cn(
                        "h-full rounded-full transition-all duration-500",
                        subject.completionRate >= 80 ? "bg-green-500" : subject.completionRate >= 50 ? "bg-blue-500" : "bg-orange-500"
                      )}
                      style={{ width: `${subject.completionRate}%` }}
                    />
                  </div>
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
      <div className="grid gap-3 sm:gap-4 grid-cols-3">
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prioritas Tinggi</p>
                {loadingTasks ? (
                  <Skeleton className="mt-1 h-8 w-10" />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {priorityStats.high}
                  </p>
                )}
              </div>
              <MiniDonut 
                value={priorityStats.high} 
                total={totalPriority} 
                colorClass="text-red-500" 
                textClass="text-red-500" 
              />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prioritas Sedang</p>
                {loadingTasks ? (
                  <Skeleton className="mt-1 h-8 w-10" />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {priorityStats.medium}
                  </p>
                )}
              </div>
              <MiniDonut 
                value={priorityStats.medium} 
                total={totalPriority} 
                colorClass="text-yellow-500" 
                textClass="text-yellow-500" 
              />
            </div>
          </CardContent>
        </Card>
        <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
          <CardContent className="relative p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Prioritas Rendah</p>
                {loadingTasks ? (
                  <Skeleton className="mt-1 h-8 w-10" />
                ) : (
                  <p className="mt-2 text-3xl font-bold tracking-tight">
                    {priorityStats.low}
                  </p>
                )}
              </div>
              <MiniDonut 
                value={priorityStats.low} 
                total={totalPriority} 
                colorClass="text-green-500" 
                textClass="text-green-500" 
              />
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
    <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
      <CardContent className="relative p-4 sm:p-5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</span>
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10 text-primary shrink-0">
            {icon}
          </div>
        </div>
        {isLoading ? (
          <div className="mt-2 space-y-1">
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        ) : (
          <div className="mt-3">
            <p className="text-2xl sm:text-3xl font-bold tracking-tight truncate">{value}</p>
            <p className="mt-1.5 text-[10px] sm:text-xs font-medium text-muted-foreground line-clamp-1">{subtitle}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

function MiniDonut({ value, total, colorClass, textClass }: { value: number; total: number; colorClass: string; textClass: string }) {
  const pct = total > 0 ? (value / total) * 100 : 0;
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (pct / 100) * circumference;
  
  return (
    <div className="relative flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 shrink-0 drop-shadow-sm">
      <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          className="text-muted/20"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          stroke="currentColor"
          strokeWidth="10"
          fill="transparent"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className={cn("transition-all duration-1000 ease-in-out", colorClass)}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={cn("text-[10px] sm:text-xs font-bold", textClass)}>{Math.round(pct)}%</span>
      </div>
    </div>
  )
}
