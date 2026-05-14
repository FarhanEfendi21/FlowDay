"use client"

import { useState, useMemo, useCallback, useEffect } from "react"
import {
  useGetTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskStatus,
  useDeletedTasks,
  useRestoreTask,
  usePermanentDeleteTask,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/features/tasks"
import { useGetSubjects } from "@/features/subjects"
import { useAuth } from "@/features/auth"
import { triggerTaskCompleteConfetti } from "@/lib/confetti"
import { createNotification } from "@/features/notifications/api/notificationService"
import { useRateLimit } from "@/hooks/use-rate-limit"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { CountdownBadge } from "@/components/tasks/countdown-badge"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  CheckSquare,
  Loader2,
  Archive,
  AlertTriangle,
  Clock,
  CheckCircle2,
  X,
  RotateCcw,
  Timer,
} from "lucide-react"
import { format, isPast } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { TaskForm } from "@/components/tasks/task-form"
import { PomodoroTimer } from "@/components/pomodoro/pomodoro-timer"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export default function TasksPage() {
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [filterStatus, setFilterStatus]   = useState<string>("all")
  const [searchQuery, setSearchQuery]     = useState<string>("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTask, setEditingTask]     = useState<Task | null>(null)
  const [showTrash, setShowTrash]         = useState(false)
  const [permanentDeleteTarget, setPermanentDeleteTarget] = useState<string | null>(null)
  const [pomodoroOpen, setPomodoroOpen]   = useState(false)

  // ── Bulk Selection State ──────────────────────────────────
  const [selectedTaskIds, setSelectedTaskIds] = useState<Set<string>>(new Set())
  const isSelectionMode = selectedTaskIds.size > 0

  // ── React Query hooks ─────────────────────────────────────
  const { data: tasks = [], isLoading } = useGetTasks()
  const { data: deletedTasks = [], isLoading: loadingTrash } = useDeletedTasks()
  const createTask   = useCreateTask()
  const updateTask   = useUpdateTask()
  const deleteTask   = useDeleteTask()
  const toggleStatus = useToggleTaskStatus()
  const restoreTask  = useRestoreTask()
  const permanentDelete = usePermanentDeleteTask()

  const { user } = useAuth()
  const { guard: guardCreate } = useRateLimit("task-create", { cooldownMs: 2000 })

  const { data: subjects = [] } = useGetSubjects()

  const expandedSubjects = useMemo(() => {
    const result: Array<{ id: string; name: string; displayName: string; isPracticum: boolean }> = []
    subjects.forEach((subject) => {
      result.push({ id: subject.id, name: subject.name, displayName: subject.name, isPracticum: false })
      if (subject.hasPracticum) {
        result.push({ id: `${subject.id}-practicum`, name: `${subject.name} (Praktikum)`, displayName: `${subject.name} (Praktikum)`, isPracticum: true })
      }
    })
    return result
  }, [subjects])

  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterSubject !== "all" && task.subject !== filterSubject) return false
        if (filterStatus  !== "all" && task.status  !== filterStatus)  return false
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          return task.title.toLowerCase().includes(query) || task.description?.toLowerCase().includes(query)
        }
        return true
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "todo" ? -1 : 1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
  }, [tasks, filterSubject, filterStatus, searchQuery])

  const todoTasks = filteredTasks.filter((t) => t.status === "todo")
  const doneTasks = filteredTasks.filter((t) => t.status === "done")

  // ── Selection Handlers ────────────────────────────────────
  const toggleSelectTask = (taskId: string) => {
    const newSelected = new Set(selectedTaskIds)
    if (newSelected.has(taskId)) newSelected.delete(taskId)
    else newSelected.add(taskId)
    setSelectedTaskIds(newSelected)
  }

  const selectAllVisible = () => {
    if (selectedTaskIds.size === filteredTasks.length) setSelectedTaskIds(new Set())
    else setSelectedTaskIds(new Set(filteredTasks.map(t => t.id)))
  }

  // ── Bulk Actions ──────────────────────────────────────────
  const handleBulkComplete = async () => {
    const ids = Array.from(selectedTaskIds)
    let completedCount = 0
    
    for (const id of ids) {
      const task = tasks.find(t => t.id === id)
      if (task && task.status === "todo") {
        await toggleStatus.mutateAsync(id)
        completedCount++
      }
    }
    
    if (completedCount > 0) {
      triggerTaskCompleteConfetti()
      toast.success(`${completedCount} tugas berhasil diselesaikan!`)
    }
    setSelectedTaskIds(new Set())
  }

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedTaskIds)
    for (const id of ids) {
      await deleteTask.mutateAsync(id)
    }
    toast.success(`${ids.length} tugas dipindahkan ke tempat sampah`, {
      action: {
        label: "Undo",
        onClick: () => handleBulkRestore(ids)
      }
    })
    setSelectedTaskIds(new Set())
  }

  const handleBulkRestore = async (ids: string[]) => {
    for (const id of ids) {
      await restoreTask.mutateAsync(id)
    }
    toast.success(`${ids.length} tugas dikembalikan`)
  }

  // ── Individual Handlers ──────────────────────────────────
  const handleCreate = (data: CreateTaskInput) => {
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

  const handleUpdate = (data: UpdateTaskInput) => {
    if (!editingTask) return
    updateTask.mutate(
      { id: editingTask.id, input: data },
      {
        onSuccess: () => {
          setEditingTask(null)
          toast.success("Tugas berhasil diperbarui!")
        },
        onError: (err) => toast.error(err.message),
      }
    )
  }

  const handleDelete = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    deleteTask.mutate(taskId, {
      onSuccess: () => {
        toast.success("Tugas dipindahkan ke tempat sampah", {
          duration: 5000,
          action: {
            label: "Undo",
            onClick: () => handleRestore(taskId)
          }
        })
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const handleToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    const isCompleting = task && task.status === "todo"
    toggleStatus.mutate(taskId, {
      onSuccess: () => {
        if (isCompleting) {
          triggerTaskCompleteConfetti()
          if (user?.id) {
            createNotification("Tugas Selesai! 🎉", `Kamu berhasil menyelesaikan "${task.title}".`, "task_complete", {
              url: "/dashboard/tasks",
              tag: `task-complete-${task.id}`
            }).catch(() => {})
          }
        }
      },
      onError: (err) => toast.error(err.message),
    })
  }

  const handleRestore = (taskId: string) => {
    restoreTask.mutate(taskId, {
      onSuccess: () => toast.success("Tugas berhasil dikembalikan!"),
      onError: (err) => toast.error(err.message),
    })
  }

  const confirmPermanentDelete = () => {
    if (!permanentDeleteTarget) return
    permanentDelete.mutate(permanentDeleteTarget, {
      onSuccess: () => {
        toast.success("Tugas berhasil dihapus permanen!")
        setPermanentDeleteTarget(null)
      },
      onError: (err) => {
        toast.error(err.message)
        setPermanentDeleteTarget(null)
      },
    })
  }

  return (
    <div className="space-y-6 relative min-h-[calc(100vh-12rem)]">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            {showTrash ? "Tempat Sampah" : "Tugas"}
          </h1>
          <p className="text-muted-foreground">
            {showTrash ? "Tugas yang baru saja dihapus" : "Kelola tugas kuliah dan deadline kamu"}
          </p>
        </div>
        <div className="flex gap-2">
          {/* Trash/Active Toggle Button */}
          <Button
            variant={showTrash ? "outline" : "secondary"}
            size="default"
            onClick={() => {
              setShowTrash(!showTrash)
              setSelectedTaskIds(new Set())
            }}
            title={showTrash ? "Lihat Tugas Aktif" : `Trash (${deletedTasks.length})`}
          >
            {showTrash ? (
              <>
                <CheckSquare className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Tugas Aktif</span>
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Trash</span>
                <span className="ml-1">({deletedTasks.length})</span>
              </>
            )}
          </Button>
          
          {!showTrash && (
            <>
              {/* Pomodoro Button - Icon only on mobile */}
              <Button
                variant="outline"
                size="default"
                onClick={() => setPomodoroOpen(true)}
                title="Pomodoro Timer"
              >
                <Timer className="h-4 w-4" />
                <span className="hidden sm:inline ml-2">Pomodoro</span>
              </Button>
              
              {/* Add Task Button */}
              <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="default">
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline ml-2">Tambah Tugas</span>
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh]">
                  <DialogHeader><DialogTitle>Tambah Tugas Baru</DialogTitle></DialogHeader>
                  <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
                    <TaskForm subjects={expandedSubjects} isLoading={createTask.isPending} onAdd={handleCreate} />
                  </div>
                </DialogContent>
              </Dialog>
            </>
          )}
        </div>
      </div>

      {/* Filters */}
      {!showTrash && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
          <Input
            type="text"
            placeholder="Cari tugas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-[250px]"
          />
          <Select value={filterSubject} onValueChange={setFilterSubject}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Mata Kuliah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mata Kuliah</SelectItem>
              {expandedSubjects.map((s) => (
                <SelectItem key={s.id} value={s.name}>{s.displayName}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="done">Selesai</SelectItem>
            </SelectContent>
          </Select>
          {filteredTasks.length > 0 && (
            <Button variant="ghost" size="sm" onClick={selectAllVisible} className="text-muted-foreground ml-auto">
              {selectedTaskIds.size === filteredTasks.length ? "Deselect All" : "Select All"}
            </Button>
          )}
        </div>
      )}

      {/* Main Content Area */}
      {showTrash ? (
        <div className="space-y-4">
          {loadingTrash ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : deletedTasks.length === 0 ? (
            <EmptyView icon={<Trash2 />} title="Trash Kosong" description="Tidak ada tugas di tempat sampah." />
          ) : (
            <div className="grid gap-2">
              {deletedTasks.map(task => (
                <TrashTaskCard 
                  key={task.id} 
                  task={task} 
                  onRestore={() => handleRestore(task.id)} 
                  onPermanentDelete={() => setPermanentDeleteTarget(task.id)} 
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-8">
          {isLoading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : filteredTasks.length === 0 ? (
            <EmptyView icon={<CheckSquare />} title="Belum Ada Tugas" description="Mulai dengan menambahkan tugas baru!" />
          ) : (
            <>
              {todoTasks.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" /> Belum Selesai ({todoTasks.length})
                  </h2>
                  <div className="grid gap-2">
                    {todoTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        selected={selectedTaskIds.has(task.id)}
                        onSelect={() => toggleSelectTask(task.id)}
                        onToggle={() => handleToggle(task.id)}
                        onEdit={() => setEditingTask(task)}
                        onDelete={() => handleDelete(task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {doneTasks.length > 0 && (
                <div className="space-y-3">
                  <h2 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" /> Selesai ({doneTasks.length})
                  </h2>
                  <div className="grid gap-2">
                    {doneTasks.map(task => (
                      <TaskCard 
                        key={task.id} 
                        task={task} 
                        selected={selectedTaskIds.has(task.id)}
                        onSelect={() => toggleSelectTask(task.id)}
                        onToggle={() => handleToggle(task.id)}
                        onEdit={() => setEditingTask(task)}
                        onDelete={() => handleDelete(task.id)}
                      />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Floating Bulk Action Bar */}
      {isSelectionMode && !showTrash && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-foreground text-background px-4 py-3 rounded-full shadow-2xl flex items-center gap-4 border border-border/20 backdrop-blur-md">
            <span className="text-sm font-bold px-2">{selectedTaskIds.size} dipilih</span>
            <div className="h-4 w-[1px] bg-background/20" />
            <Button variant="ghost" size="sm" onClick={handleBulkComplete} className="hover:bg-background/10 gap-2 h-8">
              <CheckCircle2 className="h-4 w-4" /> Selesaikan
            </Button>
            <Button variant="ghost" size="sm" onClick={handleBulkDelete} className="hover:bg-destructive hover:text-white gap-2 h-8">
              <Trash2 className="h-4 w-4" /> Hapus
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setSelectedTaskIds(new Set())} className="h-8 w-8 hover:bg-background/10">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Edit & Delete Dialogs */}
      <Dialog open={!!editingTask} onOpenChange={(open) => !open && setEditingTask(null)}>
        <DialogContent className="w-[95vw] sm:max-w-[500px] max-h-[90vh]">
          <DialogHeader><DialogTitle>Edit Tugas</DialogTitle></DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-8rem)] pr-2">
            {editingTask && <TaskForm subjects={expandedSubjects} initialData={editingTask} isLoading={updateTask.isPending} onEdit={handleUpdate} />}
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!permanentDeleteTarget} onOpenChange={(o) => !o && setPermanentDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertTriangle className="text-destructive" /> Hapus Permanen?</AlertDialogTitle>
            <AlertDialogDescription>Tindakan ini tidak dapat dibatalkan. Tugas akan dihapus selamanya.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPermanentDelete} className="bg-destructive text-white hover:bg-destructive/90">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Pomodoro Timer */}
      <PomodoroTimer
        open={pomodoroOpen}
        onOpenChange={setPomodoroOpen}
        tasks={todoTasks}
      />
    </div>
  )
}

function TaskCard({ task, selected, onSelect, onToggle, onEdit, onDelete }: any) {
  const isOverdue = isPast(new Date(task.dueDate)) && task.status === "todo"
  return (
    <Card className={cn(
      "transition-all duration-200 group border-l-4",
      selected ? "bg-primary/5 border-l-primary shadow-md" : "border-l-transparent",
      task.status === "done" && "opacity-60",
      isOverdue && !selected && "border-l-destructive bg-destructive/5"
    )}>
      <CardContent className="p-3 sm:p-4 flex items-start gap-3">
        <TooltipProvider>
          <div className="flex items-center gap-2 mt-1">
            {/* Checkbox for bulk selection */}
            <Tooltip>
              <TooltipTrigger asChild>
                <div>
                  <Checkbox 
                    checked={selected} 
                    onCheckedChange={onSelect}
                    className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                  />
                </div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Pilih untuk aksi bulk</p>
              </TooltipContent>
            </Tooltip>
            
            {/* Button for marking task as done/undone */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onToggle}
                  className={cn(
                    "h-6 w-6 rounded-full transition-all",
                    task.status === "done" 
                      ? "text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950" 
                      : "text-muted-foreground hover:text-green-600 hover:bg-green-50 dark:hover:bg-green-950"
                  )}
                >
                  {task.status === "done" ? (
                    <CheckCircle2 className="h-5 w-5 fill-current" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{task.status === "done" ? "Tandai belum selesai" : "Tandai selesai"}</p>
              </TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start gap-2">
            <div>
              <p className={cn("font-semibold leading-none", task.status === "done" && "line-through text-muted-foreground")}>{task.title}</p>
              {task.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{task.description}</p>}
              <div className="flex flex-wrap gap-2 mt-2">
                <Badge variant="outline" className="text-[10px] uppercase tracking-wider">{task.subject}</Badge>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] uppercase tracking-wider",
                    task.priority === 'high' && "bg-red-500/10 text-red-600 border-red-500/20",
                    task.priority === 'medium' && "bg-amber-500/10 text-amber-600 border-amber-500/20",
                    task.priority === 'low' && "bg-blue-500/10 text-blue-600 border-blue-500/20"
                  )}
                >
                  {task.priority === 'high' ? 'Tinggi' : task.priority === 'medium' ? 'Sedang' : 'Rendah'}
                </Badge>
                <CountdownBadge deadline={task.dueDate} status={task.status} />
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreHorizontal className="h-4 w-4" /></Button></DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit}><Pencil className="mr-2 h-4 w-4" /> Edit</DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive"><Trash2 className="mr-2 h-4 w-4" /> Hapus</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function TrashTaskCard({ task, onRestore, onPermanentDelete }: any) {
  return (
    <Card className="opacity-75 grayscale hover:grayscale-0 hover:opacity-100 transition-all">
      <CardContent className="p-4 flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="font-medium truncate">{task.title}</p>
          <p className="text-xs text-muted-foreground">{task.subject} • Dihapus {format(new Date(task.deletedAt || Date.now()), "d MMM", { locale: id })}</p>
        </div>
        <div className="flex gap-1">
          <Button variant="ghost" size="icon" onClick={onRestore} title="Kembalikan"><RotateCcw className="h-4 w-4" /></Button>
          <Button variant="ghost" size="icon" onClick={onPermanentDelete} className="text-destructive" title="Hapus Permanen"><Trash2 className="h-4 w-4" /></Button>
        </div>
      </CardContent>
    </Card>
  )
}

function EmptyView({ icon, title, description }: any) {
  return (
    <Card className="border-dashed"><CardContent className="py-12 flex flex-col items-center text-center">
      <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-4 text-muted-foreground">{icon}</div>
      <h3 className="font-semibold">{title}</h3>
      <p className="text-sm text-muted-foreground max-w-[250px]">{description}</p>
    </CardContent></Card>
  )
}
