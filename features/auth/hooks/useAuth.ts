// ============================================================
// FlowDay – useAuth Hook
// Subscribe to Supabase auth state changes reactively.
//
// Key design:
// • Uses getUser() (server round-trip) for initial check, NOT
//   getSession(), to reject stale/tampered JWTs in localStorage.
// • On SIGNED_OUT → immediately nullify all user state.
// • isLoading stays true until the server-validated check resolves,
//   preventing any component from rendering stale user info.
// ============================================================

'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { User, Session } from '@supabase/supabase-js'

interface AuthState {
  user:      User | null
  session:   Session | null
  isLoading: boolean
}

const LOADING_STATE: AuthState = { user: null, session: null, isLoading: true  }
const SIGNED_OUT:    AuthState = { user: null, session: null, isLoading: false }

export function useAuth(): AuthState {
  const [state, setState] = useState<AuthState>(LOADING_STATE)

  useEffect(() => {
    const supabase = createClient()
    let isMounted  = true   // prevent setState after unmount

    // ── 1. Server-validated initial check ────────────────────
    // getSession() trusts localStorage — don't use it for auth decisions.
    // getUser() always validates the JWT with the Supabase Auth server.
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!isMounted) return

      if (!user) {
        setState(SIGNED_OUT)
        return
      }

      // Grab session token for downstream use (e.g. RLS queries)
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!isMounted) return
        setState({ user, session, isLoading: false })
      })
    })

    // ── 2. Live auth-state listener ──────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isMounted) return

      if (event === 'SIGNED_OUT') {
        // Hard-null immediately — nothing of the old user survives
        setState(SIGNED_OUT)
        return
      }

      // SIGNED_IN, TOKEN_REFRESHED, USER_UPDATED …
      setState({
        user:      session?.user ?? null,
        session,
        isLoading: false,
      })
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [])

  return state
}
