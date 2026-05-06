"use client"

import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"
import TextType from "@/components/ui/text-type"
import { Logo } from "@/components/logo"

const SPLASH_SHOWN_KEY = "flowday-splash-shown-session"

// Check if splash should be shown (once per session)
function shouldShowSplash(): boolean {
  if (typeof window === 'undefined') return false
  
  // Check sessionStorage instead of localStorage for per-session display
  const hasShown = sessionStorage.getItem(SPLASH_SHOWN_KEY)
  
  // Show splash if not shown in this session
  return !hasShown
}

// Mark splash as shown for this session
function markSplashShown(): void {
  if (typeof window === 'undefined') return
  sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true')
}

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(false)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // Check if we should show splash
    if (!shouldShowSplash()) {
      console.log('[SplashScreen] Already shown this session, skipping')
      setIsVisible(false)
      return
    }

    // Show splash and mark as shown
    console.log('[SplashScreen] First time this session, showing splash')
    setIsVisible(true)
    markSplashShown()

    // Show for 3s then fade out (longer to see typing animation)
    const fadeTimer = setTimeout(() => setIsFadingOut(true), 3000)
    const removeTimer = setTimeout(() => setIsVisible(false), 3600)

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
              "h-40 w-40 rounded-full",
              "bg-gradient-to-br from-foreground/5 to-foreground/10",
              "animate-splash-pulse"
            )}
          />
        </div>

        {/* Logo with Scale Animation */}
        <div className="animate-splash-scale">
          <Logo size={64} showText={false} />
        </div>

        {/* Welcome Text with Typing Animation */}
        <div className="flex flex-col items-center gap-2">
          <TextType
            text="Welcome to FlowDay"
            as="h1"
            typingSpeed={80}
            initialDelay={500}
            loop={false}
            showCursor={true}
            cursorCharacter="|"
            cursorBlinkDuration={0.5}
            className="text-3xl font-bold tracking-tight text-foreground"
          />
        </div>
      </div>
    </div>
  )
}
