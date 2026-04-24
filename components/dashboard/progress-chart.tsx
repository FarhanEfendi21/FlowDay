"use client"

import { useMemo } from "react"
import {
  Bar,
  BarChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
} from "recharts"
import { Task } from "@/lib/store"
import { format, subDays, startOfDay, endOfDay, isWithinInterval } from "date-fns"
import { id } from "date-fns/locale"

interface ProgressChartProps {
  tasks: Task[]
}

export function ProgressChart({ tasks }: ProgressChartProps) {
  const data = useMemo(() => {
    const days = []
    for (let i = 6; i >= 0; i--) {
      const date = subDays(new Date(), i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)

      const completedCount = tasks.filter((task) => {
        if (task.status !== "done") return false
        const taskDate = new Date(task.createdAt)
        return isWithinInterval(taskDate, { start: dayStart, end: dayEnd })
      }).length

      const createdCount = tasks.filter((task) => {
        const taskDate = new Date(task.createdAt)
        return isWithinInterval(taskDate, { start: dayStart, end: dayEnd })
      }).length

      days.push({
        name: format(date, "EEE", { locale: id }),
        completed: completedCount,
        created: createdCount,
      })
    }
    return days
  }, [tasks])

  return (
    <div className="h-[200px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4}>
          <XAxis
            dataKey="name"
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            stroke="var(--muted-foreground)"
            fontSize={12}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="rounded-lg border bg-background p-2 shadow-sm">
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">
                      Selesai: {payload[0]?.value}
                    </p>
                  </div>
                )
              }
              return null
            }}
          />
          <Bar
            dataKey="completed"
            fill="var(--primary)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
