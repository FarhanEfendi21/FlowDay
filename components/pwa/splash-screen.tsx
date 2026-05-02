"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

const SPLASH_SHOWN_KEY = "flowday-splash-shown-today"

// Check if splash should be shown (once per day)
function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false
  
  const lastShown = localStorage.getItem(SPLASH_SHOWN_KEY)
  const today = new Date().toDateString()
  
  // Show splash if never shown or shown on different day
  return lastShown !== today
}

// Mark splash as shown for today
function markSplashShown(): void {
  if (typeof window === 'undefined') return
  const today = new Date().toDateString()
  localStorage.setItem(SPLASH_SHOWN_KEY, today)
}

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Check if we should show splash
    if (!shouldShowSplash()) {
      console.log('[SplashScreen] Already shown today, skipping')
      setIsVisible(false)
      return
    }

    // Show splash and mark as shown
    console.log('[SplashScreen] First time today, showing splash')
    setIsVisible(true)
    markSplashShown()

    // Show for 1.2s then fade out
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 1200)
    const removeTimer = setTimeout(() => setIsVisible(false), 1800)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center",
        "bg-gradient-to-br from-background via-background to-muted/20",
        isFadingOut ? "animate-splash-fade-out" : "animate-splash-fade-in"
      )}
    >
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated Circle Background */}
        <div className="absolute inset-0 -z-10 flex items-center justify-center">
          <div 
            className={cn(
              "h-32 w-32 rounded-full",
              "bg-gradient-to-br from-foreground/5 to-foreground/10",
              "animate-splash-pulse"
            )}
          />
        </div>

        {/* FlowDay Text with Scale Animation */}
        <div className="animate-splash-scale">
          <div className="relative">
            {/* Glow Effect */}
            <div 
              className={cn(
                "absolute inset-0 -z-10 blur-2xl opacity-30",
                "bg-gradient-to-br from-foreground/20 to-foreground/5",
                "animate-splash-glow"
              )}
            />
            <h1 className="text-5xl font-bold tracking-tight text-foreground drop-shadow-2xl">
              FlowDay
            </h1>
          </div>
        </div>

        {/* Loading Dots - Modern Style */}
        <div className="flex items-center gap-2">
          <div 
            className={cn(
              "h-2 w-2 rounded-full bg-foreground",
              "animate-splash-dot-1"
            )}
          />
          <div 
            className={cn(
              "h-2 w-2 rounded-full bg-foreground",
              "animate-splash-dot-2"
            )}
          />
          <div 
            className={cn(
              "h-2 w-2 rounded-full bg-foreground",
              "animate-splash-dot-3"
            )}
          />
        </div>
      </div>
    </div>
  )
}
