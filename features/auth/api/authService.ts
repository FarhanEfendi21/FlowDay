// ============================================================
// FlowDay – Auth Service
// Handles sign in, sign up, sign out, session management
// ============================================================

import { createClient } from '@/lib/supabase/client'
import { z } from 'zod'
import type { User, Session } from '@supabase/supabase-js'

// ─── Validation Schemas ───────────────────────────────────────
export const signInSchema = z.object({
  email:    z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export const signUpSchema = z.object({
  name:     z.string().min(2, 'Nama minimal 2 karakter').max(50),
  email:    z.string().email('Format email tidak valid'),
  password: z.string().min(6, 'Password minimal 6 karakter'),
})

export type SignInInput = z.infer<typeof signInSchema>
export type SignUpInput = z.infer<typeof signUpSchema>

// ─── Auth Result Types ────────────────────────────────────────
export interface AuthResult {
  user:    User
  session: Session
}

// ─── Error Helper ─────────────────────────────────────────────
class AuthError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'AuthError'
  }
}

// ─── signIn ──────────────────────────────────────────────────
export async function signIn(input: SignInInput): Promise<AuthResult> {
  const parsed = signInSchema.safeParse(input)
  if (!parsed.success) {
    throw new AuthError(parsed.error.errors[0].message)
  }

  const supabase = createClient()
  const { data, error } = await supabase.auth.signInWithPassword({
    email:    parsed.data.email,
    password: parsed.data.password,
  })

  if (error) throw new AuthError(error.message)
  if (!data.user || !data.session) throw new AuthError('Login gagal, coba lagi')

  return { user: data.user, session: data.session }
}

// ─── signUp ──────────────────────────────────────────────────
export async function signUp(input: SignUpInput): Promise<void> {
  const parsed = signUpSchema.safeParse(input)
  if (!parsed.success) {
    throw new AuthError(parsed.error.errors[0].message)
  }

  // Generate a unique avatar seed for this user
  // Using timestamp + random to ensure uniqueness
  const avatarSeed = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`

  const supabase = createClient()
  const { data, error } = await supabase.auth.signUp({
    email:    parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { 
        name: parsed.data.name,
        avatar_seed: avatarSeed, // Store unique seed for consistent avatar
      },
      // Disable auto-confirm to force email verification
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  })

  if (error) throw new AuthError(error.message)
  
  // Always sign out after registration to prevent auto-login
  await supabase.auth.signOut()
  
  // Don't return session - force user to login manually
  if (!data.user) throw new AuthError('Registrasi gagal, coba lagi')
}

// ─── clearClientCache ─────────────────────────────────────────
/**
 * Wipe ALL FlowDay-related data from localStorage + sessionStorage.
 *
 * Covers:
 *   - flowday-cache-*           (React Query per-user persisted cache, v3)
 *   - flowday-query-cache-*     (legacy key from v1/v2)
 *   - flowday-storage           (Zustand localStorage — legacy)
 * 
 * Preserves:
 *   - flowday-splash-shown-today (splash screen daily flag)
 */
export function clearClientCache(): void {
  if (typeof window === 'undefined') return

  // Clear localStorage (except splash flag)
  const remove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (
      k &&
      k !== 'flowday-splash-shown-today' &&
      (k.startsWith('flowday-cache') ||
        k.startsWith('flowday-query-cache') ||
        k.startsWith('flowday-splash') ||
        k === 'flowday-storage')
    ) {
      remove.push(k)
    }
  }
  remove.forEach((k) => localStorage.removeItem(k))

  // Clear sessionStorage completely
  try {
    sessionStorage.clear()
  } catch { /* ignore */ }
}

// ─── signOut ─────────────────────────────────────────────────
/**
 * Full logout procedure:
 *
 * 1. Wipe ALL local caches (React Query + Zustand legacy)
 * 2. Call Supabase signOut with scope: 'global'
 *    → revokes the refresh token on the server so it cannot be
 *      replayed from any other tab or device.
 *
 * The caller is responsible for the final hard redirect.
 * Even if step 2 fails, all client-side data is already gone.
 */
export async function signOut(): Promise<void> {
  // Step 1 — always runs first
  clearClientCache()

  // Step 2 — revoke server-side token
  const supabase = createClient()
  const { error } = await supabase.auth.signOut({ scope: 'global' })

  if (error) {
    console.warn('[signOut] Server-side signOut failed:', error.message)
  }
}

// ─── getSession ──────────────────────────────────────────────
export async function getSession(): Promise<Session | null> {
  const supabase = createClient()
  const { data, error } = await supabase.auth.getSession()
  if (error) throw new AuthError(error.message)
  return data.session
}

// ─── getCurrentUser ──────────────────────────────────────────
export async function getCurrentUser(): Promise<User | null> {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  return user
}
