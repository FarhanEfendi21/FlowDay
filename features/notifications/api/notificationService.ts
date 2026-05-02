// features/notifications/api/notificationService.ts
import { createClient } from "@/lib/supabase/client"

const supabase = createClient()

export interface Notification {
  id: string
  userId: string
  title: string
  body: string
  type: "deadline" | "habit_reminder" | "streak_milestone" | "task_complete"
  data: Record<string, any>
  read: boolean
  createdAt: string
}

export interface FCMToken {
  id: string
  userId: string
  token: string
  deviceInfo: Record<string, any>
  createdAt: string
  updatedAt: string
  lastUsedAt: string
}

/**
 * Save FCM token to database
 */
export async function saveFCMToken(token: string, deviceInfo?: Record<string, any>) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("fcm_tokens")
    .upsert(
      {
        user_id: user.id,
        token,
        device_info: deviceInfo || {},
        last_used_at: new Date().toISOString(),
      },
      {
        onConflict: "token",
      }
    )
    .select()
    .single()

  if (error) throw error
  return data as FCMToken
}

/**
 * Delete FCM token from database
 */
export async function deleteFCMToken(token: string) {
  const { error } = await supabase
    .from("fcm_tokens")
    .delete()
    .eq("token", token)

  if (error) throw error
}

/**
 * Get all notifications for current user
 */
export async function getNotifications(limit = 50) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data, error } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(limit)

  if (error) throw error
  return data as Notification[]
}

/**
 * Get unread notification count
 */
export async function getUnreadCount() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    return 0
  }

  const { data, error } = await supabase.rpc("get_unread_notification_count", {
    p_user_id: user.id,
  })

  if (error) {
    console.error("Error getting unread count:", error)
    return 0
  }

  return data as number
}

/**
 * Mark notification as read
 */
export async function markAsRead(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("id", notificationId)

  if (error) throw error
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead() {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { error } = await supabase
    .from("notifications")
    .update({ read: true })
    .eq("user_id", user.id)
    .eq("read", false)

  if (error) throw error
}

/**
 * Delete notification
 */
export async function deleteNotification(notificationId: string) {
  const { error } = await supabase
    .from("notifications")
    .delete()
    .eq("id", notificationId)

  if (error) throw error
}

/**
 * Create notification (for testing or manual creation)
 */
export async function createNotification(
  title: string,
  body: string,
  type: Notification["type"],
  data?: Record<string, any>
) {
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("User not authenticated")
  }

  const { data: notification, error } = await supabase
    .from("notifications")
    .insert({
      user_id: user.id,
      title,
      body,
      type,
      data: data || {},
    })
    .select()
    .single()

  if (error) throw error
  return notification as Notification
}
