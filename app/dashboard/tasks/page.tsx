"use client"

import { useState, useMemo } from "react"
import {
  useGetTasks,
  useCreateTask,
  useUpdateTask,
  useDeleteTask,
  useToggleTaskStatus,
  type Task,
  type TaskPriority,
  type TaskStatus,
  type CreateTaskInput,
  type UpdateTaskInput,
} from "@/features/tasks"
import { useGetSubjectNames } from "@/features/subjects"
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
import {
  Plus,
  MoreHorizontal,
  Pencil,
  Trash2,
  Calendar,
  CheckSquare,
  Loader2,
} from "lucide-react"
import { format, isPast, isToday, isTomorrow } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"


export default function TasksPage() {
  const [filterSubject, setFilterSubject] = useState<string>("all")
  const [filterStatus, setFilterStatus]   = useState<string>("all")
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [editingTask, setEditingTask]     = useState<Task | null>(null)

  // ── React Query hooks ─────────────────────────────────────
  const { data: tasks = [], isLoading } = useGetTasks()
  const createTask   = useCreateTask()
  const updateTask   = useUpdateTask()
  const deleteTask   = useDeleteTask()
  const toggleStatus = useToggleTaskStatus()

  // ── Subjects dari Supabase (user-specific) ─────────────────
  const { data: subjects = [] } = useGetSubjectNames()

  // ── Client-side filter + sort ─────────────────────────────
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((task) => {
        if (filterSubject !== "all" && task.subject !== filterSubject) return false
        if (filterStatus  !== "all" && task.status  !== filterStatus)  return false
        return true
      })
      .sort((a, b) => {
        if (a.status !== b.status) return a.status === "todo" ? -1 : 1
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime()
      })
  }, [tasks, filterSubject, filterStatus])

  const todoTasks = filteredTasks.filter((t) => t.status === "todo")
  const doneTasks = filteredTasks.filter((t) => t.status === "done")

  // ── Filter subjects: dari DB + yang ada di tasks (fallback)
  const filterSubjects = useMemo(() => {
    const fromTasks = [...new Set(tasks.map((t) => t.subject).filter(Boolean))]
    const merged    = [...new Set([...subjects, ...fromTasks])]
    return merged.sort()
  }, [subjects, tasks])

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

  const handleDelete = (id: string) => {
    deleteTask.mutate(id, {
      onError: (err) => toast.error(err.message),
    })
  }

  const handleToggle = (id: string) => {
    toggleStatus.mutate(id, {
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">Kelola tugas kuliah dan deadline kamu</p>
        </div>
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
              subjects={filterSubjects}
              isLoading={createTask.isPending}
              onAdd={handleCreate}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <Select value={filterSubject} onValueChange={setFilterSubject}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Mata Kuliah" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Mata Kuliah</SelectItem>
            {filterSubjects.map((subject) => (
              <SelectItem key={subject} value={subject}>
                {subject}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="todo">To Do</SelectItem>
            <SelectItem value="done">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

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
              subjects={filterSubjects}
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
  const isOverdue = isPast(dueDate) && !isToday(dueDate) && task.status === "todo"

  const priorityColors: Record<TaskPriority, string> = {
    high:   "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low:    "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }
  const priorityLabels: Record<TaskPriority, string> = {
    high: "Tinggi", medium: "Sedang", low: "Rendah",
  }

  let deadlineText = format(dueDate, "d MMM yyyy", { locale: id })
  if (isToday(dueDate))    deadlineText = "Hari ini"
  if (isTomorrow(dueDate)) deadlineText = "Besok"

  return (
    <Card className={task.status === "done" ? "opacity-60" : ""}>
      <CardContent className="flex items-start gap-3 p-4">
        <Checkbox
          checked={task.status === "done"}
          onCheckedChange={onToggle}
          className="mt-1"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={`font-medium ${task.status === "done" ? "line-through text-muted-foreground" : ""}`}>
                {task.title}
              </p>
              {task.description && (
                <p className="mt-1 text-sm text-muted-foreground line-clamp-2">
                  {task.description}
                </p>
              )}
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant="secondary" className="text-xs">{task.subject}</Badge>
                <Badge className={`text-xs ${priorityColors[task.priority]}`}>
                  {priorityLabels[task.priority]}
                </Badge>
                <span className={`flex items-center gap-1 text-xs ${isOverdue ? "text-destructive" : "text-muted-foreground"}`}>
                  <Calendar className="h-3 w-3" />
                  {deadlineText}
                </span>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
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
  subjects: string[]
  initialData?: Task
  isLoading?: boolean
  onAdd?: (data: CreateTaskInput) => void
  onEdit?: (data: UpdateTaskInput) => void
}) {
  const [title,       setTitle]       = useState(initialData?.title       || "")
  const [description, setDescription] = useState(initialData?.description || "")
  const [priority,    setPriority]    = useState<TaskPriority>(initialData?.priority || "medium")
  const [status,      setStatus]      = useState<TaskStatus>(initialData?.status || "todo")
  const [dueDate,     setDueDate]     = useState(
    initialData?.dueDate
      ? format(new Date(initialData.dueDate), "yyyy-MM-dd")
      : format(new Date(), "yyyy-MM-dd")
  )
  const [subject, setSubject] = useState(initialData?.subject || subjects[0] || "")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    if (initialData) {
      onEdit?.({
        title:       title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate,
        subject,
        status,
      })
    } else {
      onAdd?.({
        title:       title.trim(),
        description: description.trim() || undefined,
        priority,
        dueDate,
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-subject">Mata Kuliah</Label>
          <Select value={subject} onValueChange={setSubject} disabled={isLoading}>
            <SelectTrigger id="task-subject">
              <SelectValue placeholder="Pilih mata kuliah" />
            </SelectTrigger>
            <SelectContent>
              {subjects.map((s) => (
                <SelectItem key={s} value={s}>{s}</SelectItem>
              ))}
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
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="task-dueDate">Deadline</Label>
          <Input
            id="task-dueDate"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
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
      </div>
      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {initialData ? "Simpan Perubahan" : "Tambah Tugas"}
      </Button>
    </form>
  )
}
