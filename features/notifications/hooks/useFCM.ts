// features/notifications/hooks/useFCM.ts
import { useEffect, useState, useCallback } from "react"
import { toast } from "sonner"
import {
  requestNotificationPermission,
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermission,
} from "@/lib/firebase/messaging"
import { saveFCMToken } from "../api/notificationService"
import { useQueryClient } from "@tanstack/react-query"

export function useFCM() {
  const [token, setToken] = useState<string | null>(null)
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [isSupported, setIsSupported] = useState(false)
  const queryClient = useQueryClient()

  useEffect(() => {
    // Check if notifications are supported
    setIsSupported(isNotificationSupported())
    const currentPerm = getNotificationPermission()
    setPermission(currentPerm)

    // Auto-sync token if permission is already granted
    if (currentPerm === "granted") {
      requestNotificationPermission().then((fcmToken) => {
        if (fcmToken) {
          setToken(fcmToken)
          saveFCMToken(fcmToken, {
            userAgent: navigator.userAgent,
            platform: navigator.platform,
            timestamp: new Date().toISOString(),
          }).catch(console.error)
        }
      })
    }

    // Listen for foreground messages
    const unsubscribe = onForegroundMessage((payload) => {
      console.log("Foreground message received:", payload)

      // Show toast notification
      if (payload.notification) {
        toast(payload.notification.title || "Notification", {
          description: payload.notification.body,
          action: payload.data?.url
            ? {
                label: "Lihat",
                onClick: () => {
                  window.location.href = payload.data.url
                },
              }
            : undefined,
        })
      }

      // Invalidate notifications query to refresh badge count
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    })

    return () => {
      if (typeof unsubscribe === "function") {
        unsubscribe()
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Empty dependency array - only run once on mount

  /**
   * Request notification permission and get FCM token
   */
  const requestPermission = useCallback(async () => {
    try {
      const fcmToken = await requestNotificationPermission()

      if (fcmToken) {
        setToken(fcmToken)
        setPermission("granted")

        // Save token to database
        await saveFCMToken(fcmToken, {
          userAgent: navigator.userAgent,
          platform: navigator.platform,
          timestamp: new Date().toISOString(),
        })

        toast.success("Notifikasi berhasil diaktifkan!")
        return fcmToken
      } else {
        setPermission(getNotificationPermission())
        toast.error("Gagal mengaktifkan notifikasi")
        return null
      }
    } catch (error) {
      console.error("Error requesting permission:", error)
      toast.error("Terjadi kesalahan saat mengaktifkan notifikasi")
      return null
    }
  }, [])

  return {
    token,
    permission,
    isSupported,
    requestPermission,
  }
}
