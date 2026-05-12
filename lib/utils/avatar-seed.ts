/**
 * Avatar Seed Utilities
 * 
 * Handles generation and migration of avatar seeds for users
 */

import { createClient } from '@/lib/supabase/client'

/**
 * Generate a unique avatar seed
 * Format: timestamp-random
 */
export function generateAvatarSeed(): string {
  return `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
}

/**
 * Ensure current user has an avatar_seed
 * If not, generate one and update user metadata
 * 
 * This is useful for existing users who registered before avatar_seed was added
 */
export async function ensureAvatarSeed(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    // Check if user already has avatar_seed
    const existingSeed = user.user_metadata?.avatar_seed
    if (existingSeed) {
      return existingSeed
    }
    
    // Generate new seed for existing user
    const newSeed = generateAvatarSeed()
    
    // Update user metadata
    const { error } = await supabase.auth.updateUser({
      data: {
        ...user.user_metadata,
        avatar_seed: newSeed
      }
    })
    
    if (error) {
      console.error('Failed to update avatar_seed:', error)
      return null
    }
    
    console.log('✅ Avatar seed generated for existing user:', newSeed)
    return newSeed
  } catch (error) {
    console.error('Error ensuring avatar seed:', error)
    return null
  }
}

/**
 * Get avatar seed for current user
 * Returns seed if exists, null otherwise
 */
export async function getAvatarSeed(): Promise<string | null> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) return null
    
    return user.user_metadata?.avatar_seed || null
  } catch (error) {
    console.error('Error getting avatar seed:', error)
    return null
  }
}
