"use client"

import { useState, useMemo, useCallback } from "react"
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
  extractDate,
  extractTime,
  combineDateTimeISO,
} from "@/features/tasks"
import { useGetSubjects, type Subject } from "@/features/subjects"
import { useAuth } from "@/features/auth"
import { triggerTaskCompleteConfetti } from "@/lib/confetti"
import { createNotification } from "@/features/notifications/api/notificationService"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
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
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { TimePicker } from "@/components/ui/time-picker"
import { CountdownBadge } from "@/components/tasks/countdown-badge"
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  CheckSquare,
  Loader2,
  RotateCcw,
  Archive,
  Clock,
} from "lucide-react"
import { format, isPast } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"
import { cn } from "@/lib/utils"


export default function TasksPage() {
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [filterStatus, setFilterStatus]   = useState<string>("all")
  const [searchQuery, setSearchQuery]     = useState<string>("")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTask, setEditingTask]     = useState<Task | null>(null)
  const [showTrash, setShowTrash]         = useState(false)

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

  // ── Subjects dari Supabase (user-specific) ─────────────────
  const { data: subjects = [] } = useGetSubjects()

  // ── Expand subjects: jika punya praktikum, buat 2 entries ──
  const expandedSubjects = useMemo(() => {
    const result: Array<{ id: string; name: string; displayName: string; isPracticum: boolean }> = []
    
    subjects.forEach((subject) => {
      // Tambah entry untuk teori (selalu ada)
      result.push({
        id: subject.id,
        name: subject.name,
        displayName: subject.name,
        isPracticum: false,
      })
      
      // Jika punya praktikum, tambah entry terpisah
      if (subject.hasPracticum) {
        result.push({
          id: `${subject.id}-practicum`,
          name: `${subject.name} (Praktikum)`,
          displayName: `${subject.name} (Praktikum)`,
          isPracticum: true,
        })
      }
    })
    
    return result
  }, [subjects])

  // ── Client-side filter + sort ─────────────────────────────
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterSubject !== "all" && task.subject !== filterSubject) return false
        if (filterStatus  !== "all" && task.status  !== filterStatus)  return false
        
        // Search filter (case-insensitive)
        if (searchQuery.trim()) {
          const query = searchQuery.toLowerCase()
          const matchesTitle = task.title.toLowerCase().includes(query)
          const matchesDescription = task.description?.toLowerCase().includes(query) ?? false
          if (!matchesTitle && !matchesDescription) return false
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

  // ── Filter subjects: untuk dropdown filter (include expanded) ──
  const filterSubjects = useMemo(() => {
    const expandedNames = expandedSubjects.map(s => s.name)
    const fromTasks = [...new Set(tasks.map((t) => t.subject).filter(Boolean))]
    const merged = [...new Set([...expandedNames, ...fromTasks])]
    return merged.sort()
  }, [expandedSubjects, tasks])

  // ── Handlers ──────────────────────────────────────────────
  const handleCreate = (data: CreateTaskInput) => {
    createTask.mutate(data, {
      onSuccess: () => {
        setIsAddDialogOpen(false)
        toast.success("Tugas berhasil ditambahkan!")
      },
      onError: (err) => toast.error(err.message),
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
    deleteTask.mutate(taskId, {
      onError: (err) => toast.error(err.message),
    })
  }

  const handleToggle = (taskId: string) => {
    const task = tasks.find(t => t.id === taskId)
    const isCompleting = task && task.status === "todo"

    toggleStatus.mutate(taskId, {
      onSuccess: () => {
        if (isCompleting) {
          // Trigger animations and notifications
          triggerTaskCompleteConfetti()
          
          if (user?.id) {
            createNotification(
              "Tugas Selesai! 🎉",
              `Kamu berhasil menyelesaikan "${task.title}".`,
              "task_complete",
              {
                url: "/dashboard/tasks",
                tag: `task-complete-${task.id}`
              }
            ).catch(console.error)
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

  const handlePermanentDelete = (taskId: string) => {
    if (!confirm("Hapus permanen? Tindakan ini tidak dapat dibatalkan!")) return
    permanentDelete.mutate(taskId, {
      onSuccess: () => toast.success("Tugas berhasil dihapus permanen!"),
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {showTrash ? "Trash - Tasks" : "Tasks"}
          </h1>
          <p className="text-muted-foreground">
            {showTrash ? "Tugas yang dihapus" : "Kelola tugas kuliah dan deadline kamu"}
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
                <CheckSquare className="h-4 w-4" />
                Lihat Tasks
              </>
            ) : (
              <>
                <Archive className="h-4 w-4" />
                Lihat Trash ({deletedTasks.length})
              </>
            )}
          </Button>
          {!showTrash && (
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah Tugas
                </Button>
              </DialogTrigger>
              <DialogContent>
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
          )}
        </div>
      </div>

      {/* Filters - Only show when not in trash view */}
      {!showTrash && (
        <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
        <Input
          type="text"
          placeholder="Cari..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full sm:w-[200px]"
        />
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-full sm:w-[160px]">
            <SelectValue placeholder="Mata Kuliah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
            {expandedSubjects.map((subject) => (
              <SelectItem key={subject.id} value={subject.name}>
                <div className="flex items-center gap-2">
                  <span>{subject.displayName}</span>
                  {subject.isPracticum && (
                    <span className="inline-flex items-center justify-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                      P
                    </span>
                  )}
                </div>
              </SelectItem>
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
        </div>
      )}

      {/* Show Trash View */}
      {showTrash ? (
        <>
          {loadingTrash ? (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Memuat trash...
            </div>
          ) : deletedTasks.length === 0 ? (
            <Card>
              <CardContent className="py-16">
                <Empty>
                  <EmptyMedia variant="icon"><Trash2 /></EmptyMedia>
                  <EmptyTitle>Trash kosong</EmptyTitle>
                  <EmptyDescription>Tidak ada tugas yang dihapus</EmptyDescription>
                </Empty>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row flex-wrap gap-2 sm:gap-3">
                <Input
                  type="text"
                  placeholder="Cari..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full sm:w-[200px]"
                />
              </div>
              <div className="space-y-2">
                {deletedTasks
                  .filter((task) => {
                    if (!searchQuery.trim()) return true
                    const query = searchQuery.toLowerCase()
                    const matchesTitle = task.title.toLowerCase().includes(query)
                    const matchesDescription = task.description?.toLowerCase().includes(query) ?? false
                    return matchesTitle || matchesDescription
                  })
                  .map((task) => (
                    <TrashTaskCard
                      key={task.id}
                      task={task}
                      onRestore={() => handleRestore(task.id)}
                      onPermanentDelete={() => handlePermanentDelete(task.id)}
                    />
                  ))}
              </div>
              {deletedTasks.filter((task) => {
                if (!searchQuery.trim()) return true
                const query = searchQuery.toLowerCase()
                const matchesTitle = task.title.toLowerCase().includes(query)
                const matchesDescription = task.description?.toLowerCase().includes(query) ?? false
                return matchesTitle || matchesDescription
              }).length === 0 && (
                <Card>
                  <CardContent className="py-16">
                    <Empty>
                      <EmptyMedia variant="icon"><Trash2 /></EmptyMedia>
                      <EmptyTitle>Tidak ada hasil</EmptyTitle>
                      <EmptyDescription>Tidak ada tugas yang dihapus sesuai pencarian "{searchQuery}"</EmptyDescription>
                    </Empty>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </>
      ) : (
        <>
          {/* Loading State */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 text-muted-foreground">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              Memuat tugas...
            </div>
          )}

          {/* Task Lists */}
          {!isLoading && (
        <div className="space-y-6">
          {/* To Do */}
          <div className="space-y-3">
            <h2 className="text-sm font-medium text-muted-foreground">
              To Do ({todoTasks.length})
            </h2>
            {todoTasks.length > 0 ? (
              <div className="space-y-2">
                {todoTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggle(task.id)}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <Empty>
                    <EmptyMedia variant="icon"><CheckSquare /></EmptyMedia>
                    <EmptyTitle>Tidak ada tugas pending</EmptyTitle>
                    <EmptyDescription>Semua tugas sudah selesai atau belum ada tugas.</EmptyDescription>
                  </Empty>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Done */}
          {doneTasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-medium text-muted-foreground">
                Selesai ({doneTasks.length})
              </h2>
              <div className="space-y-2">
                {doneTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onToggle={() => handleToggle(task.id)}
                    onEdit={() => setEditingTask(task)}
                    onDelete={() => handleDelete(task.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
        )}
      </>
      )}

      {/* Edit Dialog */}
      <Dialog
        open={!!editingTask}
        onOpenChange={(open) => !open && setEditingTask(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Tugas</DialogTitle>
          </DialogHeader>
          {editingTask && (
            <TaskForm
              key={editingTask.id}
              subjects={expandedSubjects}
              initialData={editingTask}
              isLoading={updateTask.isPending}
              onEdit={handleUpdate}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

// ── TaskCard Component ─────────────────────────────────────────
function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
}: {
  task: Task
  onToggle: () => void
  onEdit: () => void
  onDelete: () => void
}) {
  const dueDate  = new Date(task.dueDate)
  const isOverdue = isPast(dueDate) && task.status === "todo"

  const priorityColors: Record<TaskPriority, string> = {
    high:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }
  const priorityLabels: Record<TaskPriority, string> = {
    high: "Tinggi", medium: "Sedang", low: "Rendah",
  }

  return (
    <Card className={cn(
      "relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:scale-[1.01]",
      task.status === "done" ? "opacity-60" : "",
      isOverdue && "border-destructive/50"
    )}>
      {/* Gradient Background for Overdue */}
      {isOverdue && (
        <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-transparent" />
      )}
      
      <CardContent className="relative flex items-start gap-2 sm:gap-3 p-3 sm:p-4">
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={onToggle}
          className="mt-1 shrink-0"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`font-medium text-sm sm:text-base ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="mt-1 text-xs sm:text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-1.5 sm:gap-2">
                <Badge variant="secondary" className="text-[10px] sm:text-xs">{task.subject}</Badge>
                <Badge className={`text-[10px] sm:text-xs ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </Badge>
                {/* Realtime Countdown Badge */}
                <CountdownBadge 
                  deadline={task.dueDate} 
                  status={task.status}
                  variant="default"
                />
                {/* Detailed datetime info - hidden on mobile */}
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(dueDate, "d MMM yyyy", { locale: id })}
                </span>
                <span className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {format(dueDate, "HH:mm")}
                </span>
                {/* Mobile: compact date/time */}
                <span className="sm:hidden flex items-center gap-1 text-[10px] text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(dueDate, "d MMM, HH:mm", { locale: id })}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7 sm:h-8 sm:w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onEdit} className="gap-2">
                  <Pencil className="h-4 w-4" /> Edit
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="gap-2 text-destructive">
                  <Trash2 className="h-4 w-4" /> Hapus
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

// ── TaskForm Component ─────────────────────────────────────────
function TaskForm({
  subjects,
  initialData,
  isLoading,
  onAdd,
  onEdit,
}: {
  subjects: Array<{ id: string; name: string; displayName: string; isPracticum: boolean }>
  initialData?: Task
  isLoading?: boolean
  onAdd?: (data: CreateTaskInput) => void
  onEdit?: (data: UpdateTaskInput) => void
}) {
  const subjectNames = subjects.map(s => s.name)
  
  const [title,       setTitle]       = useState(initialData?.title       || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [priority,    setPriority]    = useState<TaskPriority>(initialData?.priority || "medium")
  const [status,      setStatus]      = useState<TaskStatus>(initialData?.status || "todo")
  const [dueDate,     setDueDate]     = useState(
    initialData?.dueDate
      ? extractDate(initialData.dueDate)
      : format(new Date(), "yyyy-MM-dd")
  )
  const [dueTime,     setDueTime]     = useState(
    initialData?.dueDate
      ? extractTime(initialData.dueDate)
      : "23:59"
  )
  const [subject, setSubject] = useState<string>(
    initialData?.subject && subjectNames.includes(initialData.subject)
      ? initialData.subject
      : subjectNames[0] ?? ""
  )

  // Stable callback reference to prevent TimePicker's useEffect from
  // re-running on every render (it depends on onChange in its dep array)
  const handleDueTimeChange = useCallback((time: string) => {
    setDueTime(time)
  }, [])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return
    if (!subject) {
      toast.error("Pilih mata kuliah terlebih dahulu")
      return
    }

    // Combine date and time into ISO datetime string
    const dueDatetime = combineDateTimeISO(dueDate, dueTime)

    if (initialData) {
      onEdit?.({
        title:       title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate:     dueDatetime,
        subject,
        status,
      })
    } else {
      onAdd?.({
        title:       title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate:     dueDatetime,
        subject,
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="task-title">Judul Tugas</Label>
        <Input
          id="task-title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Masukkan judul tugas"
          required
          disabled={isLoading}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="task-description">Deskripsi (Opsional)</Label>
        <Textarea
          id="task-description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Tambahkan deskripsi"
          rows={3}
          disabled={isLoading}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-subject">Mata Kuliah</Label>
          <Select 
            value={subject} 
            onValueChange={setSubject} 
            disabled={isLoading || subjects.length === 0}
          >
            <SelectTrigger id="task-subject">
              <SelectValue placeholder={subjects.length === 0 ? "Tidak ada mata kuliah" : "Pilih mata kuliah"} />
            </SelectTrigger>
            <SelectContent>
              {subjects.length > 0 ? (
                subjects.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    <div className="flex items-center gap-2">
                      <span>{s.displayName}</span>
                      {s.isPracticum && (
                        <span className="inline-flex items-center justify-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                          P
                        </span>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="placeholder" disabled>Tidak ada mata kuliah</SelectItem>
              )}
            </SelectContent>
          </Select>

        </div>
        <div className="space-y-2">
          <Label htmlFor="task-priority">Prioritas</Label>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)} disabled={isLoading}>
            <SelectTrigger id="task-priority">
              <SelectValue placeholder="Pilih prioritas" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Rendah</SelectItem>
              <SelectItem value="medium">Sedang</SelectItem>
              <SelectItem value="high">Tinggi</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="task-dueDate">Tanggal Deadline</Label>
          <Input
            id="task-dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <TimePicker
          id="task-dueTime"
          label="Waktu Deadline"
          value={dueTime}
          onChange={handleDueTimeChange}
          disabled={isLoading}
        />
      </div>
      {initialData && (
        <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)} disabled={isLoading}>
            <SelectTrigger id="task-status">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="done">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Simpan Perubahan" : "Tambah Tugas"}
      </Button>
    </form>
  )
}


// ── TrashTaskCard Component ────────────────────────────────────
function TrashTaskCard({
  task,
  onRestore,
  onPermanentDelete,
}: {
  task: Task
  onRestore: () => void
  onPermanentDelete: () => void
}) {
  const dueDate = new Date(task.dueDate)
  const deletedDate = task.deletedAt ? new Date(task.deletedAt) : null

  const priorityColors: Record<TaskPriority, string> = {
    high:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }
  const priorityLabels: Record<TaskPriority, string> = {
    high: "Tinggi", medium: "Sedang", low: "Rendah",
  }

  return (
    <Card className="opacity-60">
      <CardContent className="flex items-start gap-3 p-4">
        <Trash2 className="h-5 w-5 text-muted-foreground mt-1 shrink-0" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-medium line-through text-muted-foreground">
                {task.title}
              </p>
              {task.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">
                  {task.subject}
                </Badge>
                <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </Badge>
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3" />
                  {format(dueDate, "d MMM yyyy", { locale: id })}
                </span>
                {deletedDate && (
                  <span className="text-xs text-muted-foreground">
                    • Dihapus {format(deletedDate, "d MMM yyyy", { locale: id })}
                  </span>
                )}
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onRestore} className="gap-2">
                  <RotateCcw className="h-4 w-4" /> Kembalikan
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={onPermanentDelete}
                  className="gap-2 text-destructive"
                >
                  <Trash2 className="h-4 w-4" /> Hapus Permanen
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
