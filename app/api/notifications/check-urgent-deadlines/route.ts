// app/api/notifications/check-urgent-deadlines/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"
import { sendNotification } from "@/lib/notifications/sendNotification"

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
      .select("id, title, due_date, user_id, subject")
      .eq("status", "todo")
      .is("deleted_at", null) // Use deleted_at instead of deleted
      .gte("due_date", nowISO) // Due date >= now
      .lte("due_date", twoHoursLaterISO) // Due date <= 2 hours from now

    if (tasksError) {
      console.error("Error fetching tasks:", tasksError)
      return NextResponse.json(
        { error: "Failed to fetch tasks" },
        { status: 500 }
      )
    }

    console.log(`Found ${tasks?.length || 0} tasks in 2-hour window`)

    if (!tasks || tasks.length === 0) {
      return NextResponse.json({
        message: "No urgent deadlines found",
        count: 0,
      })
    }

    // Filter tasks that are due within 2 hours
    const urgentTasks = tasks.filter((task) => {
      const dueDateTime = new Date(task.due_date)
      const timeDiff = dueDateTime.getTime() - now.getTime()
      const hoursUntilDue = timeDiff / (1000 * 60 * 60)

      console.log(`Task "${task.title}": ${hoursUntilDue.toFixed(2)} hours until deadline`)

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
    console.log(`Sending notifications for ${urgentTasks.length} urgent tasks...`)
    
    const notificationPromises = urgentTasks.map((task) =>
      sendUrgentDeadlineNotification(task)
    )

    const results = await Promise.allSettled(notificationPromises)
    
    const successCount = results.filter((r) => r.status === "fulfilled").length
    const failureCount = results.filter((r) => r.status === "rejected").length

    // Log detailed results
    results.forEach((result, index) => {
      if (result.status === "rejected") {
        console.error(`Notification ${index + 1} failed:`, result.reason)
      } else {
        console.log(`Notification ${index + 1} sent successfully:`, result.value)
      }
    })

    console.log(`✅ Success: ${successCount}, ❌ Failed: ${failureCount}`)

    return NextResponse.json({
      success: true,
      message: `Processed ${urgentTasks.length} urgent deadline(s)`,
      successCount,
      failureCount,
      tasks: urgentTasks.map((t) => ({ 
        id: t.id, 
        title: t.title, 
        due_date: t.due_date 
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
  // Format time for display (extract time from due_date TIMESTAMPTZ)
  const dueDateTime = new Date(task.due_date)
  const dueTime = dueDateTime.toLocaleTimeString('id-ID', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: false 
  })

  console.log(`📤 Sending notification for task "${task.title}" to user ${task.user_id}`)

  const result = await sendNotification({
    userId: task.user_id,
    title: "🚨 Deadline 2 Jam Lagi!",
    body: `Tugas "${task.title}" (${task.subject}) jatuh tempo jam ${dueTime}`,
    type: "urgent_deadline",
    data: {
      taskId: task.id,
      url: "/dashboard/tasks",
      tag: `urgent-deadline-${task.id}`,
      dueDate: task.due_date,
    },
  })

  console.log(`✅ Notification sent successfully for task ${task.id}:`, result)
  return result
}
