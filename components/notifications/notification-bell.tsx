// components/notifications/notification-bell.tsx
"use client"

import { useState } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { useUnreadCount } from "@/features/notifications"
import { NotificationList } from "./notification-list"

import { cn } from "@/lib/utils"

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const { data: unreadCount = 0 } = useUnreadCount()

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn("relative transition-all", unreadCount > 0 && "text-primary hover:bg-primary/10")}
          aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
        >
          <Bell className={cn("h-5 w-5", unreadCount > 0 && "fill-primary/20")} />
          {unreadCount > 0 && (
            <>
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-gradient-to-br from-orange-500 to-red-500 animate-ping opacity-75"></span>
              <Badge
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-[10px] shadow-sm border-background border-2 bg-gradient-to-br from-orange-500 to-red-500 text-white hover:from-orange-600 hover:to-red-600"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[calc(100vw-32px)] sm:w-[380px] p-0" align="end" sideOffset={8}>
        <NotificationList onClose={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  )
}
