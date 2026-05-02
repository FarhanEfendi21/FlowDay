// lib/firebase/messaging.ts
import { getToken, onMessage, MessagePayload } from "firebase/messaging"
import { getMessagingInstance, vapidKey } from "./config"

/**
 * Request notification permission and get FCM token
 */
export async function requestNotificationPermission(): Promise<string | null> {
  try {
    // Get messaging instance
    const messaging = await getMessagingInstance()
    
    // Check if messaging is supported
    if (!messaging) {
      console.warn("Firebase Messaging is not supported in this browser")
      return null
    }

    // Request permission
    const permission = await Notification.requestPermission()
    
    if (permission === "granted") {
      console.log("Notification permission granted")
      
      // Get FCM token
      const token = await getToken(messaging, { vapidKey })
      console.log("FCM Token:", token)
      
      return token
    } else {
      console.log("Notification permission denied")
      return null
    }
  } catch (error) {
    console.error("Error getting notification permission:", error)
    return null
  }
}

/**
 * Listen for foreground messages
 */
export function onForegroundMessage(callback: (payload: MessagePayload) => void) {
  // Return async function that sets up listener
  let unsubscribe: (() => void) | null = null
  
  getMessagingInstance().then((messaging) => {
    if (!messaging) {
      console.warn("Firebase Messaging is not supported")
      return
    }

    unsubscribe = onMessage(messaging, callback)
  }).catch((error) => {
    console.error("Error setting up foreground message listener:", error)
  })

  // Return cleanup function
  return () => {
    if (unsubscribe) {
      unsubscribe()
    }
  }
}

/**
 * Check if notifications are supported
 */
export function isNotificationSupported(): boolean {
  return (
    typeof window !== "undefined" &&
    "Notification" in window &&
    "serviceWorker" in navigator
  )
}

/**
 * Get current notification permission status
 */
export function getNotificationPermission(): NotificationPermission {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return "default"
  }
  return Notification.permission
}
