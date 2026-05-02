// components/notifications/notification-list.tsx
"use client"

import { formatDistanceToNow } from "date-fns"
import { id } from "date-fns/locale"
import {
  Bell,
  CheckCircle2,
  Flame,
  Calendar,
  Trophy,
  Trash2,
  CheckCheck,
  Loader2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Empty, EmptyMedia, EmptyTitle, EmptyDescription } from "@/components/ui/empty"
import { useAuth } from "@/features/auth"
import { toast } from "sonner"
import {
  useNotifications,
  useMarkAsRead,
  useMarkAllAsRead,
  useDeleteNotification,
  type Notification,
} from "@/features/notifications"
import { cn } from "@/lib/utils"

interface NotificationListProps {
  onClose?: () => void
}

export function NotificationList({ onClose }: NotificationListProps) {
  const { user } = useAuth()
  const { data: notifications = [], isLoading } = useNotifications(50)
  const markAsRead = useMarkAsRead()
  const markAllAsRead = useMarkAllAsRead()
  const deleteNotification = useDeleteNotification()

  const handleTestNotification = async () => {
    if (!user) return
    try {
      toast.loading("Mengirim test notifikasi...", { id: "test-notif" })
      const res = await fetch("/api/notifications/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id,
          title: "Test Notifikasi!",
          body: "Ini adalah notifikasi percobaan dari Flowday.",
          type: "task_complete",
          data: { url: "/dashboard" }
        })
      })
      if (!res.ok) throw new Error("Gagal kirim")
      toast.success("Notifikasi terkirim!", { id: "test-notif" })
    } catch (e) {
      toast.error("Gagal mengirim", { id: "test-notif" })
    }
  }

  const handleMarkAsRead = (id: string) => {
    markAsRead.mutate(id)
  }

  const handleMarkAllAsRead = () => {
    markAllAsRead.mutate()
  }

  const handleDelete = (id: string) => {
    deleteNotification.mutate(id)
  }

  const getIcon = (type: Notification["type"]) => {
    switch (type) {
      case "deadline":
        return <Calendar className="h-4 w-4 text-red-500" />
      case "habit_reminder":
        return <Flame className="h-4 w-4 text-orange-500" />
      case "streak_milestone":
        return <Trophy className="h-4 w-4 text-yellow-500" />
      case "task_complete":
        return <CheckCircle2 className="h-4 w-4 text-green-500" />
      default:
        return <Bell className="h-4 w-4 text-muted-foreground" />
    }
  }

  return (
    <div className="flex flex-col h-[80vh] sm:h-[500px]">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold">Notifikasi</h3>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="h-8 text-xs"
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Tandai Semua Dibaca
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="flex-1">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="py-16">
            <Empty>
              <EmptyMedia variant="icon">
                <Bell />
              </EmptyMedia>
              <EmptyTitle>Tidak ada notifikasi</EmptyTitle>
              <EmptyDescription>
                Notifikasi akan muncul di sini
              </EmptyDescription>
            </Empty>
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className={cn(
                  "p-4 hover:bg-muted/50 transition-colors cursor-pointer group",
                  !notification.read && "bg-primary/5"
                )}
                onClick={() => {
                  if (!notification.read) {
                    handleMarkAsRead(notification.id)
                  }
                  if (notification.data?.url) {
                    window.location.href = notification.data.url
                    onClose?.()
                  }
                }}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-1">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {notification.title}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {notification.body}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-2">
                          {(() => {
                            const dateStr = notification.createdAt || (notification as any).created_at
                            const dateObj = dateStr ? new Date(dateStr) : new Date()
                            const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj
                            return formatDistanceToNow(validDate, {
                              addSuffix: true,
                              locale: id,
                            })
                          })()}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(notification.id)
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    {!notification.read && (
                      <div className="mt-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </ScrollArea>
      <div className="p-4 border-t mt-auto">
        <Button 
          variant="outline" 
          className="w-full text-xs" 
          onClick={handleTestNotification}
        >
          <Bell className="w-3 h-3 mr-2" /> Kirim Test Notifikasi
        </Button>
      </div>
    </div>
  )
}
