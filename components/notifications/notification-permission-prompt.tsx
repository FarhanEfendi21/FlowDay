// components/notifications/notification-permission-prompt.tsx
"use client"

import { useState, useEffect } from "react"
import { Bell, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { useFCM } from "@/features/notifications"

export function NotificationPermissionPrompt() {
  const [show, setShow] = useState(false)
  const { permission, isSupported, requestPermission } = useFCM()

  const [isDismissed, setIsDismissed] = useState(true) // Default true to prevent hydration mismatch

  useEffect(() => {
    // Check session storage on mount
    const dismissed = sessionStorage.getItem("notification-prompt-dismissed") === "true"
    setIsDismissed(dismissed)

    // Show prompt if notifications are supported but not granted and not dismissed
    if (!dismissed && isSupported && permission === "default") {
      // Show after 5 seconds delay
      const timer = setTimeout(() => {
        setShow(true)
      }, 5000)

      return () => clearTimeout(timer)
    }
  }, [isSupported, permission])

  const handleEnable = async () => {
    await requestPermission()
    setShow(false)
  }

  const handleDismiss = () => {
    setShow(false)
    // Don't show again for this session
    sessionStorage.setItem("notification-prompt-dismissed", "true")
    setIsDismissed(true)
  }

  if (isDismissed || !show || !isSupported || permission !== "default") {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm animate-in slide-in-from-bottom-5">
      <Card className="border-primary/50 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
              <Bell className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold">Aktifkan Notifikasi</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Dapatkan reminder untuk deadline dan habit kamu
              </p>
              <div className="flex gap-2 mt-3">
                <Button size="sm" onClick={handleEnable} className="h-8 text-xs">
                  Aktifkan
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleDismiss}
                  className="h-8 text-xs"
                >
                  Nanti
                </Button>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6 shrink-0"
              onClick={handleDismiss}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
