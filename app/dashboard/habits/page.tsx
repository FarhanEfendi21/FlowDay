"use client"

import { useState, useMemo } from "react"
import {
  useGetHabits,
  useCreateHabit,
  useDeleteHabit,
  useToggleHabit,
  useGetDeletedHabits,
  useRestoreHabit,
  usePermanentDeleteHabit,
} from "@/features/habits"
import { useAuth } from "@/features/auth"
import { triggerSimpleConfetti, triggerStreakMilestoneConfetti } from "@/lib/confetti"
import { createNotification } from "@/features/notifications/api/notificationService"
import { useRateLimit } from "@/hooks/use-rate-limit"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  Plus,
  MoreHorizontal,
  Trash2,
  Flame,
  CheckCircle2,
  Loader2,
  RotateCcw,
  Archive,
  AlertTriangle,
} from "lucide-react"
import { format, subDays } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

export default function HabitsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newHabitTitle, setNewHabitTitle]     = useState("")
  const [searchQuery, setSearchQuery]         = useState("")
  const [showTrash, setShowTrash]             = useState(false)
  // AlertDialog state for permanent delete
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<string | null>(null)
  // AlertDialog state for soft delete confirmation
  const [softDeleteTarget, setSoftDeleteTarget] = useState<{ id: string; title: string } | null>(null)

  const { user } = useAuth()

  // ── Rate limiting ──────────────────────────────────────────
  const { guard: guardCreate } = useRateLimit("habit-create", { cooldownMs: 2000 })
  const { guard: guardDelete } = useRateLimit("habit-delete", { cooldownMs: 1000 })

  // ── React Query hooks ─────────────────────────────────────
  const { data: habits = [], isLoading } = useGetHabits()
  const { data: deletedHabits = [], isLoading: isLoadingDeleted } = useGetDeletedHabits()
  const createHabit = useCreateHabit()
  const deleteHabit = useDeleteHabit()
  const toggleHabit = useToggleHabit()
  const restoreHabit = useRestoreHabit()
  const permanentDeleteHabit = usePermanentDeleteHabit()

  const today = format(new Date(), "yyyy-MM-dd")

  // Last 7 days array for the tracker grid
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    return {
      date:    format(date, "yyyy-MM-dd"),
      label:   format(date, "EEE", { locale: id }),
      dayNum:  format(date, "d"),
      isToday: i === 6,
    }
  })

  // For mobile: show only last 2 days (yesterday + today)
  const last2Days = last7Days.slice(-2)

  // ── Filter habits by search query ─────────────────────────
  const filteredHabits = useMemo(() => {
    if (!searchQuery.trim()) return habits
    const query = searchQuery.toLowerCase()
    return habits.filter((habit) => 
      habit.title.toLowerCase().includes(query)
    )
  }, [habits, searchQuery])

  const filteredDeletedHabits = useMemo(() => {
    if (!searchQuery.trim()) return deletedHabits
    const query = searchQuery.toLowerCase()
    return deletedHabits.filter((habit) => 
      habit.title.toLowerCase().includes(query)
    )
  }, [deletedHabits, searchQuery])

  // ── Stats ─────────────────────────────────────────────────
  const totalStreak         = filteredHabits.reduce((sum, h) => sum + h.currentStreak, 0)
  const habitsCompletedToday = filteredHabits.filter((h) => h.isCompletedToday).length

  // ── Handlers ──────────────────────────────────────────────
  const handleAddHabit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newHabitTitle.trim()) return
    guardCreate(() => {
      createHabit.mutate(
        { title: newHabitTitle.trim() },
        {
          onSuccess: () => {
            setNewHabitTitle("")
            setIsAddDialogOpen(false)
            toast.success("Habit berhasil ditambahkan!")
          },
          onError: (err) => toast.error(err.message),
        }
      )
    })
  }

  // Soft delete: opens AlertDialog instead of window.confirm
  const handleDelete = (id: string, title: string) => {
    setSoftDeleteTarget({ id, title })
  }

  const confirmSoftDelete = () => {
    if (!softDeleteTarget) return
    guardDelete(() => {
      deleteHabit.mutate(softDeleteTarget.id, {
        onSuccess: () => {
          toast.success("Habit dipindahkan ke trash")
          setSoftDeleteTarget(null)
        },
        onError: (err) => {
          toast.error(err.message)
          setSoftDeleteTarget(null)
        },
      })
    })
  }

  const handleRestore = (id: string) => {
    restoreHabit.mutate(id, {
      onSuccess: () => toast.success("Habit berhasil dipulihkan"),
      onError: (err) => toast.error(err.message),
    })
  }

  // Permanent delete: opens AlertDialog instead of window.confirm
  const handlePermanentDelete = (id: string) => {
    setPermanentDeleteTarget(id)
  }

  const confirmPermanentDelete = () => {
    if (!permanentDeleteTarget) return
    permanentDeleteHabit.mutate(permanentDeleteTarget, {
      onSuccess: () => {
        toast.success("Habit dihapus permanen")
        setPermanentDeleteTarget(null)
      },
      onError: (err) => {
        toast.error(err.message)
        setPermanentDeleteTarget(null)
      },
    })
  }

  const handleToggle = (habitId: string, date: string) => {
    const habit = habits.find(h => h.id === habitId)
    if (!habit) return
    
    const isCompleted = habit.logs.some((log: any) => log.logDate === date && log.completed)
    const isChecking = !isCompleted // It will be checked after toggle

    toggleHabit.mutate(
      { habitId, date },
      { 
        onSuccess: () => {
          if (isChecking) {
            triggerSimpleConfetti()

            // Calculate optimistic streak
            let currentStreak = habit.currentStreak
            if (date === today && !habit.isCompletedToday) {
               currentStreak += 1
            }

            // Trigger milestone logic for every 7 days
            if (currentStreak > 0 && currentStreak % 7 === 0) {
              triggerStreakMilestoneConfetti(currentStreak)
              
              if (user?.id) {
                createNotification(
                  `Wow! Streak ${currentStreak} Hari 🔥`,
                  `Luar biasa! Kamu berhasil mempertahankan kebiasaan "${habit.title}" selama ${currentStreak} hari berturut-turut.`,
                  "streak_milestone",
                  {
                    url: "/dashboard/habits",
                    tag: `streak-${habitId}-${currentStreak}`
                  }
                ).catch(() => {
              // Silent — notification is non-critical, don't crash UX
            })
              }
            }
          }
        },
        onError: (err) => toast.error(err.message) 
      }
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {showTrash ? "Trash - Habits" : "Habits"}
          </h1>
          <p className="text-muted-foreground">
            {showTrash ? "Habit yang dihapus" : "Bangun kebiasaan produktif dan pantau streakmu"}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={showTrash ? "outline" : "secondary"}
            className="gap-2"
            onClick={() => setShowTrash(!showTrash)}
          >
            {showTrash ? (
              <>
                <Flame className="h-4 w-4" />
                Lihat Habits
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Lihat Trash ({deletedHabits.length})
              </>
            )}
          </Button>
          {!showTrash && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Habit
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Habit Baru</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddHabit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="habitTitle">Nama Habit</Label>
                    <Input
                      id="habitTitle"
                      value={newHabitTitle}
                      onChange={(e) => setNewHabitTitle(e.target.value)}
                      placeholder="Contoh: Belajar 2 jam"
                      required
                      disabled={createHabit.isPending}
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={createHabit.isPending}>
                    {createHabit.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Tambah Habit
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Search Input - Show in both active and trash views */}
      <div className="flex flex-wrap gap-3">
        <Input
          type="text"
          placeholder="Cari..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-[200px]"
        />
      </div>

      {/* TRASH VIEW */}
      {showTrash && (
        <>
          {isLoadingDeleted && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Memuat trash...
            </div>
          )}
          {!isLoadingDeleted && filteredDeletedHabits.length === 0 && (
            <Empty>
              <EmptyMedia variant="icon"><Archive /></EmptyMedia>
              <EmptyTitle>{deletedHabits.length === 0 ? "Trash kosong" : "Tidak ada hasil"}</EmptyTitle>
              <EmptyDescription>
                {deletedHabits.length === 0 
                  ? "Tidak ada habit yang dihapus." 
                  : `Tidak ada habit yang dihapus sesuai pencarian "${searchQuery}"`}
              </EmptyDescription>
            </Empty>
          )}
          {!isLoadingDeleted && filteredDeletedHabits.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDeletedHabits.map((habit) => (
                <Card key={habit.id} className="border-destructive/50">
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                          <Flame className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{habit.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {habit.currentStreak} hari streak
                          </p>
                        </div>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => handleRestore(habit.id)}
                            className="gap-2"
                          >
                            <RotateCcw className="h-4 w-4" />
                            Pulihkan
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handlePermanentDelete(habit.id)}
                            className="gap-2 text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                            Hapus Permanen
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}

      {/* ACTIVE HABITS VIEW */}
      {!showTrash && (
        <>
          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Memuat habits...
            </div>
          )}

          {!isLoading && (
            <>
              {/* Stats */}
              <div className="grid gap-3 sm:gap-4 grid-cols-3">
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent" />
                  <CardContent className="relative p-3 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-red-500 shadow-lg shadow-orange-500/30">
                        <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight">{totalStreak}</p>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent" />
                  <CardContent className="relative p-3 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30">
                        <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight">
                          {habitsCompletedToday}/{filteredHabits.length}
                        </p>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Selesai Hari Ini</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
                  <CardContent className="relative p-3 sm:p-5">
                    <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3">
                      <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/30">
                        <span className="text-lg sm:text-xl font-bold text-white">{filteredHabits.length}</span>
                      </div>
                      <div className="text-center sm:text-left">
                        <p className="text-2xl sm:text-3xl font-bold tracking-tight">{filteredHabits.length}</p>
                        <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Habit</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Tracker */}
              <Card className="relative overflow-hidden transition-all duration-300 hover:shadow-xl">
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-transparent to-transparent" />
                <CardHeader className="relative">
                  <CardTitle className="flex items-center gap-2 text-base font-semibold">
                    <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-purple-500/10">
                      <Flame className="h-4 w-4 text-purple-500" />
                    </div>
                    <span className="hidden sm:inline">Tracker Mingguan</span>
                    <span className="sm:hidden">Tracker</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 sm:p-6">
                  {filteredHabits.length > 0 ? (
                    <div className="space-y-4">
                      {/* Desktop View: 7 days */}
                      <div className="hidden sm:block">
                        {/* Header Row */}
                        <div className="flex items-center mb-4">
                          <div className="w-[180px] shrink-0" />
                          <div className="flex flex-1 justify-around">
                            {last7Days.map((day) => (
                              <div
                                key={day.date}
                                className={`flex flex-col items-center ${
                                  day.isToday ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-xs uppercase tracking-wider">{day.label}</span>
                                <span
                                  className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                                    day.isToday ? "bg-foreground text-background" : ""
                                  }`}
                                >
                                  {day.dayNum}
                                </span>
                              </div>
                            ))}
                          </div>
                          <div className="w-10 shrink-0" />
                        </div>

                        {/* Habit Rows */}
                        {filteredHabits.map((habit) => (
                          <div key={habit.id} className="flex items-center mb-3">
                            <div className="flex w-[180px] shrink-0 items-center gap-2">
                              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                                <Flame className="h-4 w-4 text-orange-500" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-sm font-medium">{habit.title}</p>
                                <p className="text-xs text-muted-foreground">
                                  {habit.currentStreak}d streak
                                </p>
                              </div>
                            </div>
                            <div className="flex flex-1 justify-around">
                              {last7Days.map((day) => {
                                const isCompleted = habit.logs.some(
                                  (log) => log.logDate === day.date && log.completed
                                )
                                return (
                                  <div key={day.date} className="flex justify-center">
                                    <Checkbox
                                      checked={isCompleted}
                                      onCheckedChange={() => handleToggle(habit.id, day.date)}
                                      className="h-6 w-6"
                                    />
                                  </div>
                                )
                              })}
                            </div>
                            <div className="w-10 shrink-0 flex justify-end">
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(habit.id, habit.title)}
                                    className="gap-2 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Mobile View: 2 days (yesterday + today) */}
                      <div className="sm:hidden space-y-3">
                        {filteredHabits.map((habit) => (
                          <div key={habit.id} className="rounded-lg border p-3 space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2 min-w-0">
                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                                  <Flame className="h-4 w-4 text-orange-500" />
                                </div>
                                <div className="min-w-0">
                                  <p className="truncate text-sm font-medium">{habit.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {habit.currentStreak}d streak
                                  </p>
                                </div>
                              </div>
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                    <MoreHorizontal className="h-4 w-4" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => handleDelete(habit.id, habit.title)}
                                    className="gap-2 text-destructive"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            </div>
                            <div className="flex gap-2">
                              {last2Days.map((day) => {
                                const isCompleted = habit.logs.some(
                                  (log) => log.logDate === day.date && log.completed
                                )
                                return (
                                  <div key={day.date} className="flex-1 flex flex-col items-center gap-2 p-2 rounded-lg bg-muted/30">
                                    <div className="text-center">
                                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{day.label}</p>
                                      <p className={`text-sm font-medium ${day.isToday ? "text-foreground" : "text-muted-foreground"}`}>
                                        {day.dayNum}
                                      </p>
                                    </div>
                                    <Checkbox
                                      checked={isCompleted}
                                      onCheckedChange={() => handleToggle(habit.id, day.date)}
                                      className="h-6 w-6"
                                    />
                                  </div>
                                )
                              })}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="p-6">
                      <Empty>
                        <EmptyMedia variant="icon"><Flame /></EmptyMedia>
                        <EmptyTitle>{habits.length === 0 ? "Belum ada habit" : "Tidak ada hasil"}</EmptyTitle>
                        <EmptyDescription>
                          {habits.length === 0 
                            ? "Tambah habit pertamamu untuk mulai tracking." 
                            : `Tidak ada habit sesuai pencarian "${searchQuery}"`}
                        </EmptyDescription>
                      </Empty>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Habit Cards (Today's status) */}
              {filteredHabits.length > 0 && (
                <div className="grid gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredHabits.map((habit) => (
                    <Card 
                      key={habit.id}
                      className={cn(
                        "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.02]",
                        habit.isCompletedToday && "border-green-500/50"
                      )}
                    >
                      {habit.isCompletedToday && (
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent" />
                      )}
                      <CardContent className="relative p-4 sm:p-5">
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div
                              className={cn(
                                "flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-lg transition-all",
                                habit.isCompletedToday
                                  ? "bg-gradient-to-br from-green-500 to-emerald-500 shadow-lg shadow-green-500/30"
                                  : "bg-gradient-to-br from-orange-500/20 to-red-500/20"
                              )}
                            >
                              {habit.isCompletedToday ? (
                                <CheckCircle2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                              ) : (
                                <Flame className="h-5 w-5 sm:h-6 sm:w-6 text-orange-500" />
                              )}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="font-semibold text-sm sm:text-base truncate">{habit.title}</p>
                              <p className="text-xs sm:text-sm font-medium text-muted-foreground flex items-center gap-1">
                                <Flame className="h-3 w-3 text-orange-500" />
                                {habit.currentStreak} hari streak
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Checkbox
                              checked={habit.isCompletedToday}
                              onCheckedChange={() => handleToggle(habit.id, today)}
                              className="h-5 w-5"
                            />
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() => handleDelete(habit.id, habit.title)}
                                  className="gap-2 text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Hapus
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </>
          )}
        </>
      )}
    </div>
  )
}
