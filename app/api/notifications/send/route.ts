// app/api/notifications/send/route.ts
import { NextRequest, NextResponse } from "next/server"
import { sendNotification } from "@/lib/notifications/sendNotification"

export const dynamic = "force-dynamic"

interface SendNotificationRequest {
  userId: string
  title: string
  body: string
  type: "deadline" | "urgent_deadline" | "habit_reminder" | "streak_milestone" | "task_complete"
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

    // Use shared notification function
    const result = await sendNotification({
      userId,
      title,
      body: notificationBody,
      type,
      data,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error sending notification:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
