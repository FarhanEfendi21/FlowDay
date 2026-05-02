"use client"

import { formatDistanceToNow, isToday, isYesterday } from "date-fns"
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

  const getIcon = (type: Notification["type"], isRead: boolean) => {
    const baseClass = "flex h-9 w-9 items-center justify-center rounded-full shrink-0 transition-colors";
    
    switch (type) {
      case "deadline":
        return (
          <div className={cn(baseClass, "bg-red-500/10 text-red-500", !isRead && "bg-red-500/20")}>
            <Calendar className="h-4 w-4" />
          </div>
        )
      case "habit_reminder":
        return (
          <div className={cn(baseClass, "bg-orange-500/10 text-orange-500", !isRead && "bg-orange-500/20")}>
            <Flame className="h-4 w-4" />
          </div>
        )
      case "streak_milestone":
        return (
          <div className={cn(baseClass, "bg-amber-500/10 text-amber-500", !isRead && "bg-amber-500/20")}>
            <Trophy className="h-4 w-4" />
          </div>
        )
      case "task_complete":
        return (
          <div className={cn(baseClass, "bg-green-500/10 text-green-500", !isRead && "bg-green-500/20")}>
            <CheckCircle2 className="h-4 w-4" />
          </div>
        )
      default:
        return (
          <div className={cn(baseClass, "bg-primary/10 text-primary", !isRead && "bg-primary/20")}>
            <Bell className="h-4 w-4" />
          </div>
        )
    }
  }

  // Group notifications by date
  const groupedNotifications = {
    today: [] as Notification[],
    yesterday: [] as Notification[],
    older: [] as Notification[],
  }

  notifications.forEach((notif) => {
    const dateStr = notif.createdAt || (notif as any).created_at
    const dateObj = dateStr ? new Date(dateStr) : new Date()
    const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj

    if (isToday(validDate)) {
      groupedNotifications.today.push(notif)
    } else if (isYesterday(validDate)) {
      groupedNotifications.yesterday.push(notif)
    } else {
      groupedNotifications.older.push(notif)
    }
  })

  const renderNotificationItem = (notification: Notification) => {
    const dateStr = notification.createdAt || (notification as any).created_at
    const dateObj = dateStr ? new Date(dateStr) : new Date()
    const validDate = isNaN(dateObj.getTime()) ? new Date() : dateObj

    return (
      <div
        key={notification.id}
        className={cn(
          "relative p-4 hover:bg-muted/60 transition-all duration-300 cursor-pointer group flex gap-3",
          !notification.read ? "bg-primary/[0.03]" : "opacity-80"
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
        {/* Unread Left Border Highlight */}
        {!notification.read && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-10 bg-primary rounded-r-full" />
        )}

        {getIcon(notification.type, notification.read)}

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className={cn(
                "text-sm truncate transition-colors",
                !notification.read ? "font-bold text-foreground" : "font-medium text-foreground/80"
              )}>
                {notification.title}
              </p>
              <p className={cn(
                "text-xs mt-0.5 line-clamp-2 transition-colors",
                !notification.read ? "text-muted-foreground" : "text-muted-foreground/70"
              )}>
                {notification.body}
              </p>
              <p className="text-[10px] text-muted-foreground/60 mt-1.5 font-medium">
                {formatDistanceToNow(validDate, {
                  addSuffix: true,
                  locale: id,
                })}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all hover:bg-destructive/10 hover:text-destructive shrink-0"
              onClick={(e) => {
                e.stopPropagation()
                handleDelete(notification.id)
              }}
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const renderGroup = (title: string, group: Notification[]) => {
    if (group.length === 0) return null
    return (
      <div className="mb-2">
        <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-2 px-4 border-b border-border/50">
          <h4 className="text-xs font-bold text-muted-foreground tracking-wider uppercase">
            {title}
          </h4>
        </div>
        <div className="divide-y border-b border-border/50">
          {group.map(renderNotificationItem)}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-[80vh] sm:h-[500px]">
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h3 className="font-semibold text-lg">Notifikasi</h3>
          </div>
          {notifications.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              disabled={markAllAsRead.isPending}
              className="h-8 text-xs hover:bg-primary/10 hover:text-primary transition-colors"
            >
              {markAllAsRead.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin mr-1" />
              ) : (
                <CheckCheck className="h-3 w-3 mr-1" />
              )}
              Tandai Dibaca
            </Button>
          )}
        </div>
      </div>

      {/* Notification List */}
      <ScrollArea className="flex-1 bg-muted/10">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 text-center px-4">
            <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="h-8 w-8 text-primary/60" />
            </div>
            <h4 className="font-semibold text-lg text-foreground/90">Semua Beres!</h4>
            <p className="text-sm text-muted-foreground mt-2 max-w-[220px] leading-relaxed">
              Bagus sekali, tidak ada tugas yang mendesak. Selamat beristirahat!
            </p>
          </div>
        ) : (
          <div className="pb-4">
            {renderGroup("Hari Ini", groupedNotifications.today)}
            {renderGroup("Kemarin", groupedNotifications.yesterday)}
            {renderGroup("Terdahulu", groupedNotifications.older)}
          </div>
        )}
      </ScrollArea>
      <div className="p-3 border-t mt-auto bg-background">
        <Button 
          variant="outline" 
          className="w-full text-xs font-semibold shadow-sm hover:bg-primary/5 hover:text-primary transition-colors" 
          onClick={handleTestNotification}
        >
          <Bell className="w-3.5 h-3.5 mr-2" /> Kirim Test Notifikasi
        </Button>
      </div>
    </div>
  )
}
