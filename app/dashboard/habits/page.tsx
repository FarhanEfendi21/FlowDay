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
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  X,
  Archive,
} from "lucide-react"
import { format, subDays } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"

export default function HabitsPage() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [newHabitTitle, setNewHabitTitle]     = useState("")
  const [searchQuery, setSearchQuery]         = useState("")
  const [showTrash, setShowTrash]             = useState(false)

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
  }

  const handleDelete = (id: string) => {
    deleteHabit.mutate(id, {
      onSuccess: () => toast.success("Habit dipindahkan ke trash"),
      onError: (err) => toast.error(err.message),
    })
  }

  const handleRestore = (id: string) => {
    restoreHabit.mutate(id, {
      onSuccess: () => toast.success("Habit berhasil dipulihkan"),
      onError: (err) => toast.error(err.message),
    })
  }

  const handlePermanentDelete = (id: string) => {
    if (!confirm("Yakin ingin menghapus habit ini secara permanen?")) return
    permanentDeleteHabit.mutate(id, {
      onSuccess: () => toast.success("Habit dihapus permanen"),
      onError: (err) => toast.error(err.message),
    })
  }

  const handleToggle = (habitId: string, date: string) => {
    toggleHabit.mutate(
      { habitId, date },
      { onError: (err) => toast.error(err.message) }
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
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
              <div className="grid gap-4 sm:grid-cols-3">
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                        <Flame className="h-5 w-5 text-orange-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">{totalStreak}</p>
                        <p className="text-sm text-muted-foreground">Total Streak</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                        <CheckCircle2 className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">
                          {habitsCompletedToday}/{filteredHabits.length}
                        </p>
                        <p className="text-sm text-muted-foreground">Selesai Hari Ini</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                        <span className="text-lg font-semibold">{filteredHabits.length}</span>
                      </div>
                      <div>
                        <p className="text-2xl font-semibold">{filteredHabits.length}</p>
                        <p className="text-sm text-muted-foreground">Total Habit</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Weekly Tracker */}
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-base font-medium">Tracker Mingguan</CardTitle>
                </CardHeader>
                <CardContent className="p-0 sm:p-6">
                  {filteredHabits.length > 0 ? (
                    <div className="overflow-x-auto pb-4 sm:pb-0">
                      <div className="min-w-[600px] space-y-4 px-4 sm:px-0">
                        {/* Header Row */}
                        <div className="flex items-center">
                          <div className="w-[140px] shrink-0 sm:w-[180px]" />
                          <div className="flex flex-1 justify-around">
                            {last7Days.map((day) => (
                              <div
                                key={day.date}
                                className={`flex flex-col items-center ${
                                  day.isToday ? "text-foreground" : "text-muted-foreground"
                                }`}
                              >
                                <span className="text-[10px] uppercase tracking-wider sm:text-xs">{day.label}</span>
                                <span
                                  className={`mt-1 flex h-7 w-7 items-center justify-center rounded-full text-xs sm:text-sm ${
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
                          <div key={habit.id} className="flex items-center">
                            <div className="flex w-[140px] shrink-0 items-center gap-2 sm:w-[180px]">
                              <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30 sm:h-8 sm:w-8">
                                <Flame className="h-3.5 w-3.5 text-orange-500 sm:h-4 sm:w-4" />
                              </div>
                              <div className="min-w-0">
                                <p className="truncate text-xs font-medium sm:text-sm">{habit.title}</p>
                                <p className="text-[10px] text-muted-foreground sm:text-xs">
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
                                      className="h-5 w-5 sm:h-6 sm:w-6"
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
                                    onClick={() => handleDelete(habit.id)}
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
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredHabits.map((habit) => (
                    <Card key={habit.id}>
                      <CardContent className="p-5">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                                habit.isCompletedToday
                                  ? "bg-green-100 dark:bg-green-900/30"
                                  : "bg-muted"
                              }`}
                            >
                              {habit.isCompletedToday ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : (
                                <Flame className="h-5 w-5 text-orange-500" />
                              )}
                            </div>
                            <div>
                              <p className="font-medium">{habit.title}</p>
                              <p className="text-sm text-muted-foreground">
                                {habit.currentStreak} hari streak
                              </p>
                            </div>
                          </div>
                          <Checkbox
                            checked={habit.isCompletedToday}
                            onCheckedChange={() => handleToggle(habit.id, today)}
                          />
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
