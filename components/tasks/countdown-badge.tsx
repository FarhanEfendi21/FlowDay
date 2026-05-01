"use client"

import * as React from "react"
import { Badge } from "@/components/ui/badge"
import { Clock, AlertCircle } from "lucide-react"
import { calculateCountdown } from "@/features/tasks/types"

interface CountdownBadgeProps {
  deadline: string // ISO datetime string
  status?: "todo" | "done"
  variant?: "default" | "compact" | "detailed"
}

export function CountdownBadge({
  deadline,
  status = "todo",
  variant = "default",
}: CountdownBadgeProps) {
  const [countdown, setCountdown] = React.useState(() =>
    calculateCountdown(deadline)
  )

  // Update countdown every second for realtime display
  React.useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(calculateCountdown(deadline))
    }, 1000)

    return () => clearInterval(interval)
  }, [deadline])

  // Don't show countdown for completed tasks
  if (status === "done") {
    return (
      <Badge variant="secondary" className="gap-1 text-xs">
        <Clock className="h-3 w-3" />
        Selesai
      </Badge>
    )
  }

  const { isOverdue, days, hours, minutes, seconds, totalHours } = countdown

  // Overdue badge
  if (isOverdue) {
    return (
      <Badge variant="destructive" className="gap-1 text-xs">
        <AlertCircle className="h-3 w-3" />
        {variant === "compact" ? "Overdue" : `Terlambat ${days}h ${hours}j`}
      </Badge>
    )
  }

  // Urgent (< 1 hour)
  if (totalHours < 1) {
    return (
      <Badge
        variant="destructive"
        className="gap-1 text-xs animate-pulse"
      >
        <Clock className="h-3 w-3" />
        {variant === "detailed"
          ? `${minutes}m ${seconds}d lagi`
          : `${minutes}m lagi`}
      </Badge>
    )
  }

  // Critical (< 6 hours)
  if (totalHours < 6) {
    return (
      <Badge
        variant="destructive"
        className="gap-1 text-xs bg-orange-500 hover:bg-orange-600"
      >
        <Clock className="h-3 w-3" />
        {variant === "detailed"
          ? `${hours}j ${minutes}m lagi`
          : `${hours}j lagi`}
      </Badge>
    )
  }

  // Warning (< 24 hours)
  if (days < 1) {
    return (
      <Badge
        variant="secondary"
        className="gap-1 text-xs bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"
      >
        <Clock className="h-3 w-3" />
        {variant === "detailed"
          ? `${hours}j ${minutes}m lagi`
          : `${hours}j lagi`}
      </Badge>
    )
  }

  // Normal (> 24 hours)
  return (
    <Badge variant="secondary" className="gap-1 text-xs">
      <Clock className="h-3 w-3" />
      {variant === "compact"
        ? `${days}h`
        : variant === "detailed"
        ? `${days}h ${hours}j ${minutes}m lagi`
        : `${days}h ${hours}j lagi`}
    </Badge>
  )
}
