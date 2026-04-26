"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Check if splash has already been shown in this session
    const hasShownSplash = sessionStorage.getItem("flowday-splash-shown")
    
    if (hasShownSplash) {
      setIsVisible(false)
      return
    }

    // If not shown, show it and set the flag
    setIsVisible(true)
    sessionStorage.setItem("flowday-splash-shown", "true")

    // Show for 0.6s then fade out (reduced from 1.5s for better performance)
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 600)
    const removeTimer = setTimeout(() => setIsVisible(false), 900)

    return () => {
      clearTimeout(fadeTimer)
      clearTimeout(removeTimer)
    }
  }, [])

  if (!isVisible) return null

  return (
    <div
      className={cn(
        "fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background",
        isFadingOut ? "animate-splash-out" : "animate-splash-in"
      )}
    >
      <div className="flex flex-col items-center gap-6">
        {/* Logo */}
        <Logo size={64} showText={false} />
        
        {/* App Name */}
        <h1 className="text-2xl font-bold tracking-tight text-foreground">
          FlowDay
        </h1>

        {/* Loading Bar - Filling Version */}
        <div className="h-1 w-24 overflow-hidden rounded-full bg-muted">
          <div className="animate-loading-fill h-full w-full origin-left bg-foreground" />
        </div>
      </div>
    </div>
  )
}
