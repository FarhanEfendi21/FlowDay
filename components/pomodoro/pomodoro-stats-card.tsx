"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Timer, Brain, Coffee, TrendingUp } from "lucide-react"
import { useGetPomodoroStats } from "@/features/pomodoro"
import { cn } from "@/lib/utils"

export function PomodoroStatsCard() {
  const { data: stats, isLoading } = useGetPomodoroStats(7)

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Pomodoro Stats</CardTitle>
          </div>
          <CardDescription>7 hari terakhir</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!stats) return null

  const avgWorkMinutesPerDay = stats.totalWorkMinutes / 7
  const completionRate = stats.totalSessions > 0 
    ? Math.round((stats.completedSessions / stats.totalSessions) * 100)
    : 0

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Timer className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-base font-medium">Pomodoro Stats</CardTitle>
        </div>
        <CardDescription>7 hari terakhir</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Stats Grid */}
        <div className="grid grid-cols-2 gap-4">
          <StatCard
            icon={Brain}
            label="Total Fokus"
            value={`${Math.floor(stats.totalWorkMinutes / 60)}h ${stats.totalWorkMinutes % 60}m`}
            color="text-red-500"
            bgColor="bg-red-500/10"
          />
          <StatCard
            icon={Coffee}
            label="Total Istirahat"
            value={`${stats.totalBreakMinutes}m`}
            color="text-green-500"
            bgColor="bg-green-500/10"
          />
          <StatCard
            icon={Timer}
            label="Sesi Selesai"
            value={stats.completedSessions.toString()}
            color="text-blue-500"
            bgColor="bg-blue-500/10"
          />
          <StatCard
            icon={TrendingUp}
            label="Completion Rate"
            value={`${completionRate}%`}
            color="text-purple-500"
            bgColor="bg-purple-500/10"
          />
        </div>

        {/* Daily Breakdown */}
        {stats.dailyBreakdown && stats.dailyBreakdown.length > 0 && (
          <div className="space-y-2 pt-2 border-t">
            <p className="text-sm font-medium text-muted-foreground">Rata-rata per hari</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all"
                  style={{ width: `${Math.min((avgWorkMinutesPerDay / 180) * 100, 100)}%` }}
                />
              </div>
              <span className="text-sm font-medium tabular-nums">
                {Math.round(avgWorkMinutesPerDay)}m
              </span>
            </div>
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-2 pt-2">
          {stats.completedSessions >= 20 && (
            <Badge variant="secondary" className="gap-1">
              🔥 Productive Week
            </Badge>
          )}
          {completionRate >= 80 && (
            <Badge variant="secondary" className="gap-1">
              ⭐ High Completion
            </Badge>
          )}
          {stats.totalWorkMinutes >= 300 && (
            <Badge variant="secondary" className="gap-1">
              💪 5+ Hours Focus
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

function StatCard({ icon: Icon, label, value, color, bgColor }: any) {
  return (
    <div className={cn("rounded-lg p-3 space-y-1", bgColor)}>
      <div className="flex items-center gap-2">
        <Icon className={cn("h-4 w-4", color)} />
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
      <p className="text-xl font-bold tabular-nums">{value}</p>
    </div>
  )
}
