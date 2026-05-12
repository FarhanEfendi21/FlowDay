"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Play,
  Pause,
  RotateCcw,
  X,
  Coffee,
  Brain,
  Timer,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { toast } from "sonner"
import {
  useCreatePomodoroSession,
  useUpdatePomodoroSession,
  useGetPomodoroSettings,
  type PomodoroType,
} from "@/features/pomodoro"
import { createNotification } from "@/features/notifications/api/notificationService"
import type { Task } from "@/features/tasks"

interface PomodoroTimerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  tasks?: Task[]
  initialTaskId?: string | null
}

export function PomodoroTimer({ open, onOpenChange, tasks = [], initialTaskId }: PomodoroTimerProps) {
  const { data: settings, refetch: refetchSettings } = useGetPomodoroSettings()
  const createSession = useCreatePomodoroSession()
  const updateSession = useUpdatePomodoroSession()

  // ── Timer State ────────────────────────────────────────────
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [type, setType] = useState<PomodoroType>("work")
  const [remainingSeconds, setRemainingSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(initialTaskId || null)
  const [completedWorkSessions, setCompletedWorkSessions] = useState(0)
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // ── Refetch settings when dialog opens ────────────────────
  useEffect(() => {
    if (open) {
      refetchSettings()
    }
  }, [open, refetchSettings])

  // ── Initialize audio ───────────────────────────────────────
  useEffect(() => {
    if (typeof window !== "undefined") {
      audioRef.current = new Audio("/sounds/timer-complete.mp3")
      audioRef.current.volume = 0.5
    }
  }, [])

  // ── Get duration based on type ─────────────────────────────
  const getDuration = useCallback((sessionType: PomodoroType) => {
    if (!settings) return sessionType === "work" ? 25 : sessionType === "short_break" ? 5 : 15
    
    switch (sessionType) {
      case "work":
        return settings.workDuration
      case "short_break":
        return settings.shortBreak
      case "long_break":
        return settings.longBreak
      default:
        return 25
    }
  }, [settings])

  // ── Initialize timer when type changes ────────────────────
  useEffect(() => {
    // Only reset timer when type changes
    setRemainingSeconds(getDuration(type) * 60)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [type]) // Only depend on type, not getDuration
  
  // ── Reset timer when settings change (if not running) ─────
  useEffect(() => {
    if (!isRunning && settings && !sessionId) {
      // Only reset if not in middle of a session
      setRemainingSeconds(getDuration(type) * 60)
    }
  }, [settings, type, getDuration, isRunning, sessionId])

  // ── Timer countdown logic ──────────────────────────────────
  useEffect(() => {
    if (isRunning && remainingSeconds > 0) {
      intervalRef.current = setInterval(() => {
        setRemainingSeconds((prev) => {
          if (prev <= 1) {
            handleTimerComplete()
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isRunning, remainingSeconds])

  // ── Start timer ────────────────────────────────────────────
  const handleStart = async () => {
    if (!sessionId) {
      // Create new session
      try {
        const session = await createSession.mutateAsync({
          type,
          durationMinutes: getDuration(type),
          taskId: selectedTaskId,
        })
        setSessionId(session.id)
        setIsRunning(true)
        toast.success(`${type === "work" ? "Fokus" : "Istirahat"} dimulai! 🍅`)
      } catch (error) {
        toast.error("Gagal memulai sesi")
      }
    } else {
      setIsRunning(true)
    }
  }

  // ── Pause timer ────────────────────────────────────────────
  const handlePause = () => {
    setIsRunning(false)
  }

  // ── Reset timer ────────────────────────────────────────────
  const handleReset = async () => {
    setIsRunning(false)
    
    if (sessionId) {
      // Mark session as cancelled
      try {
        await updateSession.mutateAsync({
          sessionId,
          input: {
            status: "cancelled",
            completedMinutes: Math.floor((getDuration(type) * 60 - remainingSeconds) / 60),
          },
        })
      } catch (error) {
        console.error("Failed to update session:", error)
      }
      setSessionId(null)
    }
    
    // Reset timer to current type's duration (don't change type)
    setRemainingSeconds(getDuration(type) * 60)
  }

  // ── Timer complete ─────────────────────────────────────────
  const handleTimerComplete = async () => {
    setIsRunning(false)
    
    // Play sound
    if (settings?.soundEnabled && audioRef.current) {
      try {
        await audioRef.current.play()
      } catch (error) {
        console.error("Failed to play sound:", error)
      }
    }

    // Update session
    if (sessionId) {
      try {
        await updateSession.mutateAsync({
          sessionId,
          input: {
            status: "completed",
            completedMinutes: getDuration(type),
            completedAt: new Date().toISOString(),
          },
        })
      } catch (error) {
        console.error("Failed to update session:", error)
      }
    }

    // Send notification
    const messages = {
      work: "Sesi fokus selesai! Waktunya istirahat 🎉",
      short_break: "Istirahat selesai! Siap fokus lagi? 💪",
      long_break: "Istirahat panjang selesai! Semangat! 🚀",
    }
    
    toast.success(messages[type])
    
    try {
      await createNotification(
        "Pomodoro Selesai! 🍅",
        messages[type],
        "task_complete"
      )
    } catch (error) {
      // Ignore notification errors
    }

    // Auto-advance logic
    if (type === "work") {
      const newCount = completedWorkSessions + 1
      setCompletedWorkSessions(newCount)
      
      const shouldLongBreak = newCount % (settings?.sessionsUntilLongBreak || 4) === 0
      const nextType = shouldLongBreak ? "long_break" : "short_break"
      
      setType(nextType)
      setSessionId(null)
      
      if (settings?.autoStartBreaks) {
        // Auto-start break after 3 seconds
        setTimeout(() => {
          setRemainingSeconds(getDuration(nextType) * 60)
          handleStart()
        }, 3000)
      }
    } else {
      setType("work")
      setSessionId(null)
      
      if (settings?.autoStartWork) {
        // Auto-start work after 3 seconds
        setTimeout(() => {
          setRemainingSeconds(getDuration("work") * 60)
          handleStart()
        }, 3000)
      }
    }
  }

  // ── Skip to next phase ─────────────────────────────────────
  const handleSkip = async () => {
    if (sessionId) {
      try {
        await updateSession.mutateAsync({
          sessionId,
          input: {
            status: "cancelled",
            completedMinutes: Math.floor((getDuration(type) * 60 - remainingSeconds) / 60),
          },
        })
      } catch (error) {
        console.error("Failed to update session:", error)
      }
    }
    
    setIsRunning(false)
    setSessionId(null)
    
    // Determine next type
    const nextType = type === "work" ? "short_break" : "work"
    setType(nextType)
    
    // IMPORTANT: Reset timer to new duration
    setRemainingSeconds(getDuration(nextType) * 60)
  }

  // ── Format time ────────────────────────────────────────────
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // ── Calculate progress ─────────────────────────────────────
  const totalSeconds = getDuration(type) * 60
  const progress = ((totalSeconds - remainingSeconds) / totalSeconds) * 100

  // ── Get type config ────────────────────────────────────────
  const typeConfig = {
    work: {
      label: "Fokus",
      icon: Brain,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    short_break: {
      label: "Istirahat Pendek",
      icon: Coffee,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      borderColor: "border-green-500/20",
    },
    long_break: {
      label: "Istirahat Panjang",
      icon: Coffee,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
  }

  const config = typeConfig[type]
  const Icon = config.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden">
        <div className={cn("p-6 border-b", config.bgColor, config.borderColor)}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon className={cn("h-5 w-5", config.color)} />
              Pomodoro Timer
            </DialogTitle>
          </DialogHeader>
        </div>

        <div className="p-6 space-y-6">
          {/* Type Selector */}
          <div className="flex gap-2">
            {(["work", "short_break", "long_break"] as PomodoroType[]).map((t) => (
              <Button
                key={t}
                variant={type === t ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  if (!isRunning) {
                    setType(t)
                    setSessionId(null)
                  }
                }}
                disabled={isRunning}
                className="flex-1"
              >
                {typeConfig[t].label}
              </Button>
            ))}
          </div>

          {/* Timer Display */}
          <div className="relative">
            <div className={cn(
              "rounded-2xl p-8 text-center space-y-4 border-2",
              config.bgColor,
              config.borderColor
            )}>
              <Badge variant="outline" className={cn("text-xs", config.color)}>
                {config.label}
              </Badge>
              
              <motion.div
                key={remainingSeconds}
                initial={{ scale: 1 }}
                animate={{ scale: isRunning ? [1, 1.02, 1] : 1 }}
                transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
                className="text-6xl font-bold tabular-nums"
              >
                {formatTime(remainingSeconds)}
              </motion.div>

              <Progress value={progress} className="h-2" />

              {/* Session Counter */}
              {type === "work" && (
                <div className="flex items-center justify-center gap-1 text-sm text-muted-foreground">
                  {Array.from({ length: settings?.sessionsUntilLongBreak || 4 }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        "h-2 w-2 rounded-full",
                        i < completedWorkSessions % (settings?.sessionsUntilLongBreak || 4)
                          ? "bg-primary"
                          : "bg-muted"
                      )}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Task Selector */}
          {type === "work" && tasks.length > 0 && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Tugas (opsional)</label>
              <Select
                value={selectedTaskId || "none"}
                onValueChange={(value) => setSelectedTaskId(value === "none" ? null : value)}
                disabled={isRunning}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih tugas..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Tanpa tugas</SelectItem>
                  {tasks
                    .filter((t) => t.status === "todo")
                    .map((task) => (
                      <SelectItem key={task.id} value={task.id}>
                        {task.title}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Controls */}
          <div className="flex gap-2">
            {!isRunning ? (
              <Button
                onClick={handleStart}
                className="flex-1 gap-2"
                size="lg"
              >
                <Play className="h-4 w-4" />
                {sessionId ? "Lanjutkan" : "Mulai"}
              </Button>
            ) : (
              <Button
                onClick={handlePause}
                variant="secondary"
                className="flex-1 gap-2"
                size="lg"
              >
                <Pause className="h-4 w-4" />
                Jeda
              </Button>
            )}
            
            <Button
              onClick={handleReset}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-4 w-4" />
            </Button>

            {sessionId && (
              <Button
                onClick={handleSkip}
                variant="ghost"
                size="lg"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-4 border-t">
            <div className="text-center">
              <div className="text-2xl font-bold">{completedWorkSessions}</div>
              <div className="text-xs text-muted-foreground">Sesi Hari Ini</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{getDuration(type)}</div>
              <div className="text-xs text-muted-foreground">Menit</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">
                {Math.floor((completedWorkSessions * (settings?.workDuration || 25)) / 60)}h
              </div>
              <div className="text-xs text-muted-foreground">Total Fokus</div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
