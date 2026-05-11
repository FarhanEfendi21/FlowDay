"use client"

import { useState } from "react"
import {
  useDeletedTasks,
  useRestoreTask,
  usePermanentDeleteTask,
  type Task,
} from "@/features/tasks"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import {
  Trash2,
  RotateCcw,
  Loader2,
  Calendar,
  MoreHorizontal,
  AlertTriangle,
} from "lucide-react"
import { format } from "date-fns"
import { id } from "date-fns/locale"
import { toast } from "sonner"

export default function TrashPage() {
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  // ── React Query hooks ─────────────────────────────────────
  const { data: deletedTasks = [], isLoading } = useDeletedTasks()
  const restoreTask = useRestoreTask()
  const permanentDelete = usePermanentDeleteTask()

  // ── Handlers ──────────────────────────────────────────────
  const handleRestore = (id: string) => {
    restoreTask.mutate(id, {
      onSuccess: () => toast.success("Tugas berhasil dikembalikan!"),
      onError: (err) => toast.error(err.message),
    })
  }

  const handlePermanentDelete = () => {
    if (!taskToDelete) return
    permanentDelete.mutate(taskToDelete, {
      onSuccess: () => {
        toast.success("Tugas berhasil dihapus permanen!")
        setTaskToDelete(null)
      },
      onError: (err) => toast.error(err.message),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Trash</h1>
          <p className="text-muted-foreground">
            Tugas yang dihapus akan tersimpan di sini
          </p>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-16 text-muted-foreground">
          <Loader2 className="h-5 w-5 animate-spin mr-2" />
          Memuat trash...
        </div>
      )}

      {/* Empty State */}
      {!isLoading && deletedTasks.length === 0 && (
        <Card>
          <CardContent className="py-16">
            <Empty>
              <EmptyMedia variant="icon">
                <Trash2 />
              </EmptyMedia>
              <EmptyTitle>Trash kosong</EmptyTitle>
              <EmptyDescription>
                Tidak ada tugas yang dihapus
              </EmptyDescription>
            </Empty>
          </CardContent>
        </Card>
      )}

      {/* Deleted Tasks List */}
      {!isLoading && deletedTasks.length > 0 && (
        <div className="space-y-2">
          {deletedTasks.map((task) => (
            <TrashCard
              key={task.id}
              task={task}
              onRestore={() => handleRestore(task.id)}
              onPermanentDelete={() => setTaskToDelete(task.id)}
            />
          ))}
        </div>
      )}

      {/* Confirm Permanent Delete Dialog */}
      <AlertDialog
        open={!!taskToDelete}
        onOpenChange={(open) => !open && setTaskToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Hapus Permanen?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Tugas akan dihapus permanen dari
              database dan tidak bisa dikembalikan lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handlePermanentDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Hapus Permanen
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ── TrashCard Component ────────────────────────────────────────
function TrashCard({
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

  const priorityColors = {
    high: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
    medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
    low: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  }
  const priorityLabels = {
    high: "Tinggi",
    medium: "Sedang",
    low: "Rendah",
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
