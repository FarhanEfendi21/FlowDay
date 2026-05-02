"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"

export function useOnboarding() {
  const [showOnboarding, setShowOnboarding] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    checkOnboardingStatus()
  }, [])

  const checkOnboardingStatus = async () => {
    try {
      const supabase = createClient()
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        setIsLoading(false)
        return
      }

      setUserId(user.id)

      // Check if user has completed onboarding
      const { data: profile } = await supabase
        .from("profiles")
        .select("onboarding_completed")
        .eq("id", user.id)
        .single()

      if (profile && !profile.onboarding_completed) {
        setShowOnboarding(true)
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const completeOnboarding = async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      
      // Update database
      await supabase
        .from("profiles")
        .update({ onboarding_completed: true })
        .eq("id", userId)

      setShowOnboarding(false)
    } catch (error) {
      console.error("Error completing onboarding:", error)
    }
  }

  const resetOnboarding = async () => {
    if (!userId) return

    try {
      const supabase = createClient()
      
      // Reset in database
      await supabase
        .from("profiles")
        .update({ onboarding_completed: false })
        .eq("id", userId)

      setShowOnboarding(true)
    } catch (error) {
      console.error("Error resetting onboarding:", error)
    }
  }

  return {
    showOnboarding,
    isLoading,
    completeOnboarding,
    resetOnboarding,
  }
}
