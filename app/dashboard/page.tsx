"use client"

import { useState, useMemo } from "react"
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
  Plus,
} from "lucide-react"
import { format, isToday, isTomorrow, isPast, differenceInDays } from "date-fns"
import { id as localeId } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

// ── Feature hooks ─────────────────────────────────────────────
import { useDashboardSummary, useWeeklyTaskStats, useSubjectTaskStats } from "@/features/stats"
import { useUpcomingTasks, useCreateTask } from "@/features/tasks"
import { useGetHabits, useToggleHabit } from "@/features/habits"
import { useGetSubjects } from "@/features/subjects"
import { useRateLimit } from "@/hooks/use-rate-limit"

// ── Recharts ──────────────────────────────────────────────────
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  Tooltip,
} from "recharts"

// ── Components ───────────────────────────────────────────────
import { OnboardingModal } from "@/components/onboarding/onboarding-modal"
import { useOnboarding } from "@/hooks/use-onboarding"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { TaskForm } from "@/components/tasks/task-form"

export default function DashboardPage() {
  // ── Onboarding state ──────────────────────────────────────
  const {
    showOnboarding,
    isLoading: onboardingLoading,
    completeOnboarding,
  } = useOnboarding()
  
  // ── Data fetching ───────────────────────────────────────
  const { data: summary,   isLoading: loadingSummary }   = useDashboardSummary()
  const { data: weekly,    isLoading: loadingWeekly }    = useWeeklyTaskStats()
  const { data: subjects,  isLoading: loadingSubjects }  = useSubjectTaskStats()
  const { data: upcoming,  isLoading: loadingUpcoming }  = useUpcomingTasks(5)
  const { data: habits = [], isLoading: loadingHabits }  = useGetHabits()
  const { data: rawSubjects = [] } = useGetSubjects()
  
  const toggleHabitMutation = useToggleHabit()
  const createTask = useCreateTask()
  const { guard: guardCreate } = useRateLimit("task-create", { cooldownMs: 2000 })
  
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)

  const expandedSubjects = useMemo(() => {
    const result: Array<{ id: string; name: string; displayName: string; isPracticum: boolean }> = []
    rawSubjects.forEach((subject) => {
      result.push({ id: subject.id, name: subject.name, displayName: subject.name, isPracticum: false })
      if (subject.hasPracticum) {
        result.push({ id: `${subject.id}-practicum`, name: `${subject.name} (Praktikum)`, displayName: `${subject.name} (Praktikum)`, isPracticum: true })
      }
    })
    return result
  }, [rawSubjects])

  const handleCreate = (data: any) => {
    guardCreate(() => {
      createTask.mutate(data, {
        onSuccess: () => {
          setIsAddDialogOpen(false)
          toast.success("Tugas berhasil ditambahkan!")
        },
        onError: (err) => toast.error(err.message),
      })
    })
  }

  return (
    <div className="space-y-6 relative pb-20">
      {/* Onboarding Modal */}
      {!onboardingLoading && (
        <OnboardingModal
          open={showOnboarding}
          onComplete={completeOnboarding}
        />
      )}

      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Selamat datang kembali! Ini ringkasan progress kamu.
        </p>
      </div>

      {/* ─── Stats Cards ──────────────────────────────────── */}
      <div className="grid gap-3 sm:gap-4 grid-cols-2 lg:grid-cols-4">
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
        <Card className="lg:col-span-4 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-base font-semibold">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/10">
                <TrendingUp className="h-4 w-4 text-primary" />
              </div>
              Progress Mingguan
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {loadingWeekly ? (
              <div className="flex items-end gap-2 h-32">
                {Array.from({ length: 7 }).map((_, i) => (
                  <Skeleton key={i} className="flex-1 rounded" style={{ height: `${40 + (i * 8)}%` }} />
                ))}
              </div>
            ) : weekly && weekly.length > 0 ? (
              <WeeklyChart data={weekly} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Belum ada data minggu ini.</p>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 via-transparent to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-orange-500/10">
                <Flame className="h-4 w-4 text-orange-500" />
              </div>
              Habit Hari Ini
            </CardTitle>
            <Link href="/dashboard/habits">
              <Button variant="ghost" size="sm" className="gap-1 text-xs hover:bg-orange-500/10">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[300px] overflow-y-auto pr-2 scrollbar-thin">
            {loadingHabits ? (
              Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-1">
                    <Skeleton className="h-3 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))
            ) : habits.length > 0 ? (
              habits.map((habit) => (
                <div 
                  key={habit.id} 
                  className={cn(
                    "flex items-center gap-3 p-2 rounded-lg transition-all group",
                    "hover:bg-orange-500/5"
                  )}
                >
                  <button
                    onClick={() => toggleHabitMutation.mutate(habit.id)}
                    disabled={toggleHabitMutation.isPending}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full transition-all shrink-0",
                      habit.isCompletedToday
                        ? "bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-lg shadow-green-500/30"
                        : "bg-muted text-muted-foreground hover:bg-orange-500/20 hover:text-orange-600"
                    )}
                  >
                    {habit.isCompletedToday ? (
                      <CheckCircle2 className="h-5 w-5" />
                    ) : (
                      <Plus className="h-5 w-5" />
                    )}
                  </button>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-sm font-medium truncate", habit.isCompletedToday && "text-muted-foreground line-through")}>
                      {habit.title}
                    </p>
                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                      <Flame className="h-3 w-3 text-orange-500" />
                      {habit.currentStreak} hari streak
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">Belum ada habit.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7">
        <Card className="lg:col-span-4 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent" />
          <CardHeader className="relative flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-500/10">
                <Calendar className="h-4 w-4 text-blue-500" />
              </div>
              Tugas Mendatang
            </CardTitle>
            <Link href="/dashboard/tasks">
              <Button variant="ghost" size="sm" className="gap-1 text-xs hover:bg-blue-500/10">
                Lihat semua <ArrowRight className="h-3 w-3" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="relative">
            <div className="space-y-2">
              {loadingUpcoming ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 p-3">
                    <Skeleton className="h-2 w-2 rounded-full" />
                    <div className="flex-1 space-y-1"><Skeleton className="h-3 w-3/4" /><Skeleton className="h-3 w-1/2" /></div>
                  </div>
                ))
              ) : upcoming && upcoming.length > 0 ? (
                upcoming.map((task) => (
                  <div key={task.id} className="flex items-center justify-between rounded-lg border p-3 hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <PriorityDot priority={task.priority} />
                      <div className="min-w-0">
                        <p className="text-sm font-medium truncate">{task.title}</p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                          <BookOpen className="h-3 w-3" /> {task.subject}
                        </p>
                      </div>
                    </div>
                    <DeadlineBadge dueDate={task.dueDate} />
                  </div>
                ))
              ) : (
                <p className="text-center text-sm text-muted-foreground py-4">Tidak ada tugas pending. 🎉</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 relative overflow-hidden transition-all duration-300 hover:shadow-xl">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />
          <CardHeader className="relative">
            <CardTitle className="flex items-center gap-2 text-xl font-semibold">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
                <BookOpen className="h-4 w-4 text-purple-500" />
              </div>
              Per Mata Kuliah
            </CardTitle>
          </CardHeader>
          <CardContent className="relative">
            {loadingSubjects ? (
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="space-y-1"><Skeleton className="h-3 w-2/3" /><Skeleton className="h-2 w-full rounded-full" /></div>
                ))}
              </div>
            ) : subjects && subjects.length > 0 ? (
              <div className="space-y-4">
                {subjects.slice(0, 5).map((s) => (
                  <div key={s.subject} className="space-y-2 group">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium truncate">{s.subject}</span>
                      <span className="text-muted-foreground font-medium">{s.completed}/{s.total}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all duration-500",
                          s.completionRate >= 80 ? "bg-green-500" : s.completionRate >= 50 ? "bg-blue-500" : "bg-orange-500"
                        )}
                        style={{ width: `${s.completionRate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-sm text-muted-foreground py-4">Belum ada tugas.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Add FAB */}
      <Button
        onClick={() => setIsAddDialogOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-2xl z-40 transition-transform hover:scale-110 active:scale-95"
        size="icon"
      >
        <Plus className="h-6 w-6" />
      </Button>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Tambah Tugas Baru</DialogTitle>
          </DialogHeader>
          <TaskForm 
            subjects={expandedSubjects} 
            isLoading={createTask.isPending} 
            onAdd={handleCreate} 
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function StatCard({ title, value, subtitle, icon, alert = false, isLoading = false }: any) {
  return (
    <Card className={cn("relative overflow-hidden transition-all hover:shadow-lg", alert && "border-destructive/50")}>
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-center justify-between">
          <span className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</span>
          <div className={cn("flex items-center justify-center w-8 h-8 rounded-lg", alert ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary")}>
            {alert ? <AlertCircle className="h-4 w-4" /> : icon}
          </div>
        </div>
        {isLoading ? (
          <Skeleton className="mt-2 h-8 w-20" />
        ) : (
          <>
            <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
            <p className={cn("mt-1 text-[10px] sm:text-xs font-medium", alert ? "text-destructive" : "text-muted-foreground")}>{subtitle}</p>
          </>
        )}
      </CardContent>
    </Card>
  )
}

function WeeklyChart({ data }: { data: DailyTaskStat[] }) {
  return (
    <div className="h-40 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data}>
          <XAxis dataKey="dayLabel" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload?.length) {
                const dayData = payload[0].payload
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="text-sm font-medium">{dayData.date}</p>
                    <p className="text-xs text-muted-foreground">Selesai: {dayData.completed} tugas</p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar dataKey="completed" fill="var(--chart-1)" radius={[4, 4, 0, 0]} maxBarSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

function PriorityDot({ priority }: { priority: string }) {
  const colors: Record<string, string> = { high: "bg-red-500", medium: "bg-yellow-500", low: "bg-green-500" }
  return <div className={`h-2 w-2 shrink-0 rounded-full ${colors[priority] ?? "bg-muted"}`} />
}

function DeadlineBadge({ dueDate }: { dueDate: string }) {
  const date = new Date(dueDate)
  const isOverdue = isPast(date) && !isToday(date)
  const diff = differenceInDays(date, new Date())
  
  let variant: "default" | "secondary" | "destructive" | "outline" = "secondary"
  let className = "text-xs shrink-0"
  
  if (isOverdue) variant = "destructive"
  else if (isToday(date) || (diff >= 0 && diff < 1)) {
    variant = "destructive"
    className += " animate-pulse"
  } else if (diff >= 1 && diff <= 3) {
    className += " bg-orange-500 text-white hover:bg-orange-600"
  } else {
    className += " bg-green-500/10 text-green-600 border-green-500/20"
  }

  let text = format(date, "d MMM", { locale: localeId })
  if (isToday(date)) text = "Hari ini"
  if (isTomorrow(date)) text = "Besok"
  
  return (
    <Badge variant={variant} className={className}>
      {isOverdue ? "Overdue" : text}
    </Badge>
  )
}
