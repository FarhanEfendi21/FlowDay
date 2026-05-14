"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface TextTypeProps {
  text: string
  as?: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "span" | "div"
  typingSpeed?: number
  initialDelay?: number
  loop?: boolean
  showCursor?: boolean
  cursorCharacter?: string
  cursorBlinkDuration?: number
  className?: string
}

export default function TextType({
  text,
  as: Component = "span",
  typingSpeed = 50,
  initialDelay = 0,
  loop = false,
  showCursor = true,
  cursorCharacter = "|",
  cursorBlinkDuration = 0.5,
  className,
}: TextTypeProps) {
  const [displayedText, setDisplayedText] = useState("")
  const [isTypingComplete, setIsTypingComplete] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  useEffect(() => {
    let currentIndex = 0
    let isMounted = true

    const type = () => {
      if (!isMounted) return

      if (currentIndex <= text.length) {
        setDisplayedText(text.slice(0, currentIndex))
        currentIndex++
        timeoutRef.current = setTimeout(type, typingSpeed)
      } else {
        setIsTypingComplete(true)
        if (loop) {
          timeoutRef.current = setTimeout(() => {
            currentIndex = 0
            setIsTypingComplete(false)
            type()
          }, 2000) // Wait before looping
        }
      }
    }

    const startTyping = () => {
      timeoutRef.current = setTimeout(type, initialDelay)
    }

    startTyping()

    return () => {
      isMounted = false
      if (timeoutRef.current) clearTimeout(timeoutRef.current)
    }
  }, [text, typingSpeed, initialDelay, loop])

  return (
    <Component className={cn("inline-flex items-center", className)}>
      {displayedText}
      {showCursor && (!isTypingComplete || loop) && (
        <span
          className="ml-0.5"
          style={{
            animation: `blink ${cursorBlinkDuration}s step-end infinite`,
          }}
        >
          {cursorCharacter}
        </span>
      )}
      <style jsx>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0; }
        }
      `}</style>
    </Component>
  )
}
