"use client"

import Image from "next/image"
import { useTheme } from "next-themes"
import { useEffect, useState } from "react"

interface LogoProps {
  size?: number
  className?: string
  showText?: boolean
  textClassName?: string
}

export function Logo({ 
  size = 32, 
  className = "", 
  showText = true,
  textClassName = "text-lg font-semibold tracking-tight"
}: LogoProps) {
  const { theme, systemTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Determine current theme
  const currentTheme = theme === "system" ? systemTheme : theme
  const isDark = currentTheme === "dark"

  // Show placeholder during SSR to prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <div 
          className={`flex items-center justify-center rounded-lg bg-muted ${className}`}
          style={{ width: size, height: size }}
        />
        {showText && (
          <span className={textClassName}>FlowDay</span>
        )}
      </>
    )
  }

  return (
    <>
      <Image
        src={isDark ? "/icons/white-logo.png" : "/icons/black-logo.png"}
        alt="FlowDay Logo"
        width={size}
        height={size}
        className={`object-contain ${className}`}
        priority
      />
      {showText && (
        <span className={textClassName}>FlowDay</span>
      )}
    </>
  )
}
