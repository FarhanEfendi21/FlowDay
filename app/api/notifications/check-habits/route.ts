// app/api/notifications/check-habits/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * Cron job endpoint to check for incomplete habits and send reminders
 * Should be called in the evening (e.g., 8 PM daily)
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

    const today = new Date().toISOString().split("T")[0]

    // Get all active habits
    const { data: habits, error: habitsError } = await supabase
      .from("habits")
      .select(`
        id,
        title,
        user_id,
        habit_logs!left (
          id,
          log_date,
          completed
        )
      `)
      .eq("deleted", false)

    if (habitsError) {
      console.error("Error fetching habits:", habitsError)
      return NextResponse.json(
        { error: "Failed to fetch habits" },
        { status: 500 }
      )
    }

    if (!habits || habits.length === 0) {
      return NextResponse.json({
        message: "No habits found",
        count: 0,
      })
    }

    // Filter habits that are not completed today
    const incompleteHabits = habits.filter((habit: any) => {
      const todayLog = habit.habit_logs?.find(
        (log: any) => log.log_date === today
      )
      return !todayLog || !todayLog.completed
    })

    if (incompleteHabits.length === 0) {
      return NextResponse.json({
        message: "All habits completed today",
        count: 0,
      })
    }

    // Group by user to send one notification per user
    const habitsByUser = incompleteHabits.reduce((acc: any, habit: any) => {
      if (!acc[habit.user_id]) {
        acc[habit.user_id] = []
      }
      acc[habit.user_id].push(habit)
      return acc
    }, {})

    // Send notification for each user
    const notificationPromises = Object.entries(habitsByUser).map(
      ([userId, userHabits]: [string, any]) =>
        sendHabitReminderNotification(userId, userHabits)
    )

    const results = await Promise.allSettled(notificationPromises)
    
    const successCount = results.filter((r) => r.status === "fulfilled").length
    const failureCount = results.filter((r) => r.status === "rejected").length

    return NextResponse.json({
      success: true,
      message: `Sent reminders to ${successCount} user(s)`,
      successCount,
      failureCount,
      totalIncompleteHabits: incompleteHabits.length,
    })
  } catch (error) {
    console.error("Error in check-habits cron:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

async function sendHabitReminderNotification(userId: string, habits: any[]) {
  const apiUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
  
  const habitCount = habits.length
  const habitTitles = habits.map((h) => h.title).join(", ")

  const response = await fetch(`${apiUrl}/api/notifications/send`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      userId,
      title: "🔥 Jangan Putus Streak!",
      body:
        habitCount === 1
          ? `Habit "${habits[0].title}" belum selesai hari ini`
          : `${habitCount} habit belum selesai: ${habitTitles}`,
      type: "habit_reminder",
      data: {
        url: "/dashboard/habits",
        tag: "habit-reminder",
      },
    }),
  })

  if (!response.ok) {
    throw new Error(`Failed to send habit reminder for user ${userId}`)
  }

  return response.json()
}
