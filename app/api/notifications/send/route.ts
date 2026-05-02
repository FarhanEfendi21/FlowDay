// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// Support both Legacy and HTTP v1 API
const firebaseServerKey = process.env.FIREBASE_SERVER_KEY
const firebaseServiceAccount = process.env.FIREBASE_SERVICE_ACCOUNT

const supabase = createClient(supabaseUrl, supabaseServiceKey)

interface SendNotificationRequest {
  userId: string
  title: string
  body: string
  type: "deadline" | "habit_reminder" | "streak_milestone" | "task_complete"
  data?: Record<string, any>
}

export async function POST(request: NextRequest) {
  try {
    const body: SendNotificationRequest = await request.json()
    const { userId, title, body: notificationBody, type, data = {} } = body

    // Validate input
    if (!userId || !title || !notificationBody || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Get user's FCM tokens
    const { data: tokens, error: tokensError } = await supabase
      .from("fcm_tokens")
      .select("token")
      .eq("user_id", userId)

    if (tokensError) {
      console.error("Error fetching FCM tokens:", tokensError)
      return NextResponse.json(
        { error: "Failed to fetch FCM tokens" },
        { status: 500 }
      )
    }

    if (!tokens || tokens.length === 0) {
      return NextResponse.json(
        { message: "No FCM tokens found for user" },
        { status: 200 }
      )
    }

    // Save notification to database
    const { error: notificationError } = await supabase
      .from("notifications")
      .insert({
        user_id: userId,
        title,
        body: notificationBody,
        type,
        data,
      })

    if (notificationError) {
      console.error("Error saving notification:", notificationError)
    }

    // Send FCM notification to all user's devices
    const fcmPromises = tokens.map((tokenData) =>
      sendFCMNotification(tokenData.token, title, notificationBody, data)
    )

    const results = await Promise.allSettled(fcmPromises)
    
    const successCount = results.filter((r) => r.status === "fulfilled").length
    const failureCount = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      success: true,
      message: `Notification sent to ${successCount} device(s)`,
      successCount,
      failureCount,
    })
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function sendFCMNotification(
  token: string,
  title: string,
  body: string,
  data: Record<string, any>
) {
  // Use Legacy API if server key is available
  if (firebaseServerKey) {
    return sendFCMLegacy(token, title, body, data)
  }
  
  // Otherwise use HTTP v1 API
  if (firebaseServiceAccount) {
    return sendFCMv1(token, title, body, data)
  }
  
  throw new Error("No Firebase credentials configured")
}

// Legacy API (deprecated, but still works)
async function sendFCMLegacy(
  token: string,
  title: string,
  body: string,
  data: Record<string, any>
) {
  const fcmEndpoint = "https://fcm.googleapis.com/fcm/send"

  const payload = {
    to: token,
    notification: {
      title,
      body,
      icon: "/icons/white-logo.png",
      badge: "/icons/white-logo.png",
      click_action: data.url || "/dashboard",
    },
    data: {
      ...data,
      url: data.url || "/dashboard",
    },
  }

  const response = await fetch(fcmEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `key=${firebaseServerKey}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`FCM Legacy request failed: ${error}`)
  }

  return response.json()
}

// HTTP v1 API (recommended)
async function sendFCMv1(
  token: string,
  title: string,
  body: string,
  data: Record<string, any>
) {
  // Parse service account
  const serviceAccount = JSON.parse(firebaseServiceAccount!)
  const projectId = serviceAccount.project_id

  // Get OAuth 2.0 access token
  const accessToken = await getAccessToken(serviceAccount)

  const fcmEndpoint = `https://fcm.googleapis.com/v1/projects/${projectId}/messages:send`

  const payload = {
    message: {
      token,
      notification: {
        title,
        body,
      },
      data: {
        ...data,
        url: data.url || "/dashboard",
      },
      webpush: {
        notification: {
          icon: "/icons/white-logo.png",
          badge: "/icons/white-logo.png",
        },
        fcm_options: {
          link: data.url || "/dashboard",
        },
      },
    },
  }

  const response = await fetch(fcmEndpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`FCM v1 request failed: ${error}`)
  }

  return response.json()
}

// Get OAuth 2.0 access token for HTTP v1 API
async function getAccessToken(serviceAccount: any) {
  const { GoogleAuth } = await import("google-auth-library")
  
  const auth = new GoogleAuth({
    credentials: serviceAccount,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  })

  const client = await auth.getClient()
  const accessToken = await client.getAccessToken()

  return accessToken.token
}
