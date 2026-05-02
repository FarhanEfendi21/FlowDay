// app/api/notifications/check-deadlines/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { addDays, startOfDay, endOfDay } from "date-fns"

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

const supabase = createClient(supabaseUrl, supabaseServiceKey)

/**
 * Cron job endpoint to check for upcoming deadlines and send notifications
 * Should be called daily (e.g., via Vercel Cron or external scheduler)
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get tasks due tomorrow (H-1)
    const tomorrow = addDays(new Date(), 1)
    const tomorrowStart = startOfDay(tomorrow).toISOString()
    const tomorrowEnd = endOfDay(tomorrow).toISOString()

    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, due_date, user_id, subject")
      .eq("status", "todo")
      .eq("deleted", false)
      .gte("due_date", tomorrowStart)
      .lte("due_date", tomorrowEnd)

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError)
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      )
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        message: "No tasks due tomorrow",
        count: 0,
      })
    }

    // Send notification for each task
    const notificationPromises = tasks.map((task) =>
      sendDeadlineNotification(task)
    )

    const results = await Promise.allSettled(notificationPromises)
    
    const successCount = results.filter((r) => r.status === "fulfilled").length
    const failureCount = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      success: true,
      message: `Processed ${tasks.length} deadline(s)`,
      successCount,
      failureCount,
      tasks: tasks.map((t) => ({ id: t.id, title: t.title })),
    })
  } catch (error) {
    console.error("Error in check-deadlines cron:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function sendDeadlineNotification(task: any) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  const response = await fetch(`${apiUrl}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: task.user_id,
      title: "⏰ Deadline Besok!",
      body: `Tugas "${task.title}" (${task.subject}) jatuh tempo besok`,
      type: "deadline",
      data: {
        taskId: task.id,
        url: "/dashboard/tasks",
        tag: `deadline-${task.id}`,
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send notification for task ${task.id}`)
  }

  return response.json()
}
