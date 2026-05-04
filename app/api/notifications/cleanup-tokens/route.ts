// app/api/notifications/cleanup-tokens/route.ts
import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export const dynamic = "force-dynamic"

/**
 * Cron job to cleanup stale FCM tokens
 * Run weekly to remove tokens not used in 30+ days
 */
export async function GET(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json({ error: "Configuration missing" }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Delete tokens not used in 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    const { data, error } = await supabase
      .from("fcm_tokens")
      .delete()
      .lt("last_used_at", thirtyDaysAgo.toISOString())
      .select()

    if (error) {
      console.error("Error cleaning up tokens:", error)
      return NextResponse.json({ error: "Cleanup failed" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Cleaned up ${data?.length || 0} stale token(s)`,
      deletedCount: data?.length || 0,
    })
  } catch (error) {
    console.error("Error in cleanup-tokens cron:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
