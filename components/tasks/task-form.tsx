"use client"

import { useState, useCallback, useMemo } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { 
  Plus, 
  Loader2, 
  BookOpen, 
  Calendar, 
  CheckSquare 
} from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
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
} from "@/components/ui/dialog"
import { TimePicker } from "@/components/ui/time-picker"

import { 
  type Task, 
  type TaskPriority, 
  type TaskStatus, 
  type CreateTaskInput, 
  type UpdateTaskInput,
  extractDate,
  extractTime,
  combineDateTimeISO
} from "@/features/tasks"
import { useAddSubject } from "@/features/subjects"

// ── Zod schema for task form validation ───────────────────────
export const taskFormSchema = z.object({
  title: z
    .string()
    .min(1, "Judul tidak boleh kosong")
    .max(255, "Judul maksimal 255 karakter")
    .trim(),
  description: z
    .string()
    .max(2000, "Deskripsi maksimal 2000 karakter")
    .optional()
    .or(z.literal("")),
  subject: z.string().min(1, "Pilih mata kuliah terlebih dahulu"),
  priority: z.enum(["low", "medium", "high"]),
  dueDate: z.string().min(1, "Tanggal deadline wajib diisi"),
  dueTime: z.string().regex(/^\d{2}:\d{2}$/, "Format waktu tidak valid"),
})

export type TaskFormValues = z.infer<typeof taskFormSchema>

interface TaskFormProps {
  subjects: Array<{ id: string; name: string; displayName: string; isPracticum: boolean }>
  initialData?: Task
  isLoading?: boolean
  onAdd?: (data: CreateTaskInput) => void
  onEdit?: (data: UpdateTaskInput) => void
}

export function TaskForm({
  subjects,
  initialData,
  isLoading,
  onAdd,
  onEdit,
}: TaskFormProps) {
  const subjectNames = useMemo(() => (subjects || []).map(s => s.name), [subjects])
  
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
  
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
  const [newSubjectName, setNewSubjectName] = useState("")
  const [newSubjectHasPracticum, setNewSubjectHasPracticum] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addSubjectMutation = useAddSubject()
  
  const handleDueTimeChange = useCallback((time: string) => {
    setDueTime(time)
  }, [])
  
  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubjectName.trim()) return
    
    addSubjectMutation.mutate(
      { name: newSubjectName.trim(), hasPracticum: newSubjectHasPracticum },
      {
        onSuccess: () => {
          const newSubjectDisplayName = newSubjectHasPracticum 
            ? `${newSubjectName.trim()} (Praktikum)` 
            : newSubjectName.trim()
          setSubject(newSubjectDisplayName)
          setNewSubjectName("")
          setNewSubjectHasPracticum(false)
          setIsAddSubjectOpen(false)
          toast.success("Mata kuliah berhasil ditambahkan!")
        },
        onError: (err: Error) => {
          toast.error(err.message || "Gagal menambahkan mata kuliah")
        },
      }
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const dueDatetime = combineDateTimeISO(dueDate, dueTime)

    try {
      taskFormSchema.parse({
        title: title.trim(),
        description: description.trim() || "",
        subject,
        priority,
        dueDate,
        dueTime
      })
    } catch (error) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err) => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message
          }
        })
        setErrors(newErrors)
        toast.error("Mohon periksa kembali isian form")
        return
      }
    }

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
          className={errors.title ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors.title && <p className="text-xs font-medium text-destructive">{errors.title}</p>}
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
          className={errors.description ? "border-destructive focus-visible:ring-destructive" : ""}
        />
        {errors.description && <p className="text-xs font-medium text-destructive">{errors.description}</p>}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <div className="flex items-center justify-between h-7">
            <Label htmlFor="task-subject" className="text-sm font-medium">
              Mata Kuliah
            </Label>
            <Button 
              type="button" 
              variant="link" 
              size="sm" 
              className="h-auto p-0 text-xs font-normal text-primary hover:text-primary/80"
              onClick={() => setIsAddSubjectOpen(true)}
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Baru
            </Button>
          </div>
          <Select 
            value={subject} 
            onValueChange={setSubject} 
            disabled={isLoading || subjects.length === 0}
          >
            <SelectTrigger id="task-subject" className="h-10 w-full overflow-hidden">
              <SelectValue 
                placeholder={subjects.length === 0 ? "Tambah dulu" : "Pilih mata kuliah"} 
                className="truncate"
              />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              {subjects.length > 0 ? (
                subjects.map((s) => (
                  <SelectItem key={s.id} value={s.name}>
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{s.displayName}</span>
                      {s.isPracticum && (
                        <Badge variant="secondary" className="h-4 px-1 text-[9px] font-medium">
                          Praktikum
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="placeholder" disabled>
                  <span className="text-muted-foreground">Belum ada mata kuliah</span>
                </SelectItem>
              )}
            </SelectContent>
          </Select>
          {errors.subject && <p className="text-xs font-medium text-destructive">{errors.subject}</p>}
        </div>

        <div className="space-y-2">
          <div className="flex items-center h-7">
            <Label htmlFor="task-priority">Prioritas</Label>
          </div>
          <Select value={priority} onValueChange={(v) => setPriority(v as TaskPriority)} disabled={isLoading}>
            <SelectTrigger id="task-priority">
              <SelectValue placeholder="Pilih prioritas" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
              <SelectItem value="low">Rendah</SelectItem>
              <SelectItem value="medium">Sedang</SelectItem>
              <SelectItem value="high">Tinggi</SelectItem>
            </SelectContent>
          </Select>
          {errors.priority && <p className="text-xs font-medium text-destructive">{errors.priority}</p>}
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
            className={errors.dueDate ? "border-destructive focus-visible:ring-destructive" : ""}
          />
          {errors.dueDate && <p className="text-xs font-medium text-destructive">{errors.dueDate}</p>}
        </div>
        <div className="space-y-2">
          <TimePicker
            id="task-dueTime"
            label="Waktu Deadline"
            value={dueTime}
            onChange={handleDueTimeChange}
            disabled={isLoading}
          />
          {errors.dueTime && <p className="text-xs font-medium text-destructive">{errors.dueTime}</p>}
        </div>
      </div>

      {initialData && (
        <div className="space-y-2">
          <Label htmlFor="task-status">Status</Label>
          <Select value={status} onValueChange={(v) => setStatus(v as TaskStatus)} disabled={isLoading}>
            <SelectTrigger id="task-status">
              <SelectValue placeholder="Pilih status" />
            </SelectTrigger>
            <SelectContent position="popper" sideOffset={4}>
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

      {/* Nested Add Subject Dialog */}
      <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <BookOpen className="h-5 w-5 text-primary" />
              </div>
              <div>
                <DialogTitle className="text-lg">Tambah Mata Kuliah</DialogTitle>
              </div>
            </div>
          </DialogHeader>
          
          <form onSubmit={handleAddSubject} className="space-y-5 pt-2">
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="new-subject" className="text-sm font-medium">
                  Nama Mata Kuliah <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="new-subject"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  placeholder="Contoh: Pemrograman Web"
                  required
                  disabled={addSubjectMutation.isPending}
                  autoFocus
                />
              </div>
              
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 space-y-1">
                    <Label htmlFor="new-practicum" className="text-sm font-medium cursor-pointer">
                      Memiliki Praktikum
                    </Label>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      Aktifkan jika mata kuliah ini memiliki sesi praktikum
                    </p>
                  </div>
                  <Switch
                    id="new-practicum"
                    checked={newSubjectHasPracticum}
                    onCheckedChange={setNewSubjectHasPracticum}
                    disabled={addSubjectMutation.isPending}
                  />
                </div>
              </div>
            </div>

            <Separator />

            <div className="flex gap-3">
              <Button 
                type="button" 
                variant="outline" 
                className="flex-1 h-10"
                onClick={() => setIsAddSubjectOpen(false)}
                disabled={addSubjectMutation.isPending}
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                className="flex-1 h-10 gap-2"
                disabled={addSubjectMutation.isPending || !newSubjectName.trim()}
              >
                {addSubjectMutation.isPending ? "Menambahkan..." : "Tambah"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </form>
  )
}
