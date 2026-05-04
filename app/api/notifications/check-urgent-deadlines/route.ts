// app/api/notifications/check-urgent-deadlines/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * Cron job endpoint to check for urgent deadlines (2 hours before due)
 * Should be called every hour
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      console.warn("Supabase credentials not found. Skipping execution.")
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get current time and 2 hours from now
    const now = new Date()
    const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000)

    // Format for PostgreSQL timestamp comparison
    const nowISO = now.toISOString()
    const twoHoursLaterISO = twoHoursLater.toISOString()

    console.log("Checking urgent deadlines between:", nowISO, "and", twoHoursLaterISO)

    // Get tasks due within 2 hours
    const { data: tasks, error: tasksError } = await supabase
      .from("tasks")
      .select("id, title, due_date, due_time, user_id, subject")
      .eq("status", "todo")
      .eq("deleted", false)
      .not("due_time", "is", null) // Only tasks with specific time
      .gte("due_date", now.toISOString().split("T")[0]) // Today or later
      .lte("due_date", twoHoursLater.toISOString().split("T")[0]) // Not too far in future

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError)
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      )
    }

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        message: "No urgent deadlines found",
        count: 0,
      })
    }

    // Filter tasks that are due within 2 hours
    const urgentTasks = tasks.filter((task) => {
      if (!task.due_time) return false

      // Combine date and time
      const dueDateTime = new Date(`${task.due_date}T${task.due_time}`)
      const timeDiff = dueDateTime.getTime() - now.getTime()
      const hoursUntilDue = timeDiff / (1000 * 60 * 60)

      // Check if between 1.5 and 2.5 hours (to avoid duplicate notifications)
      return hoursUntilDue > 1.5 && hoursUntilDue <= 2.5
    })

    console.log(`Found ${urgentTasks.length} urgent tasks out of ${tasks.length} total`)

    if (urgentTasks.length === 0) {
      return NextResponse.json({
        message: "No tasks due within 2 hours",
        count: 0,
        totalChecked: tasks.length,
      })
    }

    // Send notification for each urgent task
    const notificationPromises = urgentTasks.map((task) =>
      sendUrgentDeadlineNotification(task)
    )

    const results = await Promise.allSettled(notificationPromises)
    
    const successCount = results.filter((r) => r.status === "fulfilled").length
    const failureCount = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      success: true,
      message: `Processed ${urgentTasks.length} urgent deadline(s)`,
      successCount,
      failureCount,
      tasks: urgentTasks.map((t) => ({ 
        id: t.id, 
        title: t.title, 
        due_time: t.due_time 
      })),
    })
  } catch (error) {
    console.error("Error in check-urgent-deadlines cron:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function sendUrgentDeadlineNotification(task: any) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

  // Format time for display
  const dueTime = task.due_time ? task.due_time.substring(0, 5) : ""

  const response = await fetch(`${apiUrl}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId: task.user_id,
      title: "🚨 Deadline 2 Jam Lagi!",
      body: `Tugas "${task.title}" (${task.subject}) jatuh tempo jam ${dueTime}`,
      type: "urgent_deadline",
      data: {
        taskId: task.id,
        url: "/dashboard/tasks",
        tag: `urgent-deadline-${task.id}`,
        dueTime: task.due_time,
      },
    }),
  })

  if (!response.ok) {
    const error = await response.text()
    console.error(`Failed to send notification for task ${task.id}:`, error)
    throw new Error(`Failed to send notification for task ${task.id}`)
  }

  return response.json()
}
