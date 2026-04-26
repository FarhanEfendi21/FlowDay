'use client'

import { useState, useEffect, useRef, useMemo, type ReactNode } from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { createSyncStoragePersister } from '@tanstack/query-sync-storage-persister'
import { createClient } from '@/lib/supabase/client'

interface QueryProviderProps {
  children: ReactNode
}

// ─── Cache key factory — includes user ID for isolation ────────
function getCacheKey(userId: string | null): string {
  return userId ? `flowday-cache-${userId}` : 'flowday-cache-anon'
}

// ─── Wipe ALL flowday caches from localStorage ─────────────────
function purgeAllCaches(): void {
  if (typeof window === 'undefined') return
  const remove: string[] = []
  for (let i = 0; i < localStorage.length; i++) {
    const k = localStorage.key(i)
    if (k && (k.startsWith('flowday-cache') || k.startsWith('flowday-query-cache') || k === 'flowday-storage')) {
      remove.push(k)
    }
  }
  remove.forEach((k) => localStorage.removeItem(k))
  // Also nuke sessionStorage just in case
  try { sessionStorage.clear() } catch { /* ignore */ }
}

// ─── Build a fresh QueryClient ────────────────────────────────
function buildQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime:            1000 * 10,           // 10s (reduced from 30s for faster updates)
        gcTime:               1000 * 60 * 60 * 24, // 24 h (PWA offline)
        retry:                1,
        refetchOnWindowFocus: false,
        networkMode:          'offlineFirst',
      },
      mutations: {
        retry:       0,
        networkMode: 'offlineFirst',
      },
    },
  })
}

/**
 * React Query provider with strict per-user cache isolation.
 *
 * Design:
 * • Cache key = "flowday-cache-{userId}" → users never share a persisted cache.
 * • On SIGNED_OUT  → purge ALL caches, fresh QueryClient, userId = null.
 * • On SIGNED_IN   → if userId changed, purge previous user's cache first.
 * • `key` prop on PersistQueryClientProvider forces full remount on user switch,
 *   so NO React state, NO subscriptions, NO stale closures survive.
 * • persister is memoised on userId → stable reference per session.
 * 
 * PERFORMANCE: Don't block render while auth resolves - show loading state instead
 */
export function QueryProvider({ children }: QueryProviderProps) {
  // null  = unauthenticated
  // ''    = loading (not yet determined)
  const [userId, setUserId] = useState<string | '' | null>('')
  const [queryClient, setQueryClient] = useState(buildQueryClient)
  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    const supabase = createClient()

    // ── 1. Resolve initial user synchronously-ish ─────────────
    supabase.auth.getUser().then(({ data: { user } }) => {
      const uid = user?.id ?? null
      prevUserIdRef.current = uid
      setUserId(uid)
    })

    // ── 2. React to auth state changes ────────────────────────
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      const newUserId = session?.user?.id ?? null

      if (event === 'SIGNED_OUT') {
        // Wipe everything — in-memory + persisted
        queryClient.clear()
        purgeAllCaches()

        // Fresh client so no stale subscriptions survive
        setQueryClient(buildQueryClient())
        prevUserIdRef.current = null
        setUserId(null)
        return
      }

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        const prevId = prevUserIdRef.current

        // User switched accounts → purge previous user's data
        if (prevId && prevId !== newUserId) {
          queryClient.clear()
          if (typeof window !== 'undefined') {
            localStorage.removeItem(getCacheKey(prevId))
            localStorage.removeItem('flowday-storage')
          }
          // Fresh client for incoming user
          setQueryClient(buildQueryClient())
        }

        prevUserIdRef.current = newUserId
        setUserId(newUserId)
      }
    })

    return () => subscription.unsubscribe()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── Render immediately with loading state - don't block! ─────
  // This prevents blank screen while auth resolves
  return (
    <Inner
      key={userId === '' ? 'loading' : (userId ?? 'anon')}
      userId={userId === '' ? null : userId}
      queryClient={queryClient}
      isLoading={userId === ''}
    >
      {children}
    </Inner>
  )
}

// ─── Inner — stable persister via useMemo ─────────────────────
function Inner({
  children,
  userId,
  queryClient,
  isLoading,
}: {
  children: ReactNode
  userId: string | null
  queryClient: QueryClient
  isLoading?: boolean
}) {
  const persister = useMemo(
    () =>
      createSyncStoragePersister({
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        key: getCacheKey(userId),
      }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [userId],
  )

  // Show loading state while auth resolves - don't block render
  if (isLoading) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{
        persister,
        maxAge:  1000 * 60 * 60 * 24, // 24 h
        buster:  'v3',                  // bump to invalidate old shared caches
        dehydrateOptions: {
          shouldDehydrateQuery: (q) => q.state.status === 'success',
        },
      }}
    >
      {children}
    </PersistQueryClientProvider>
  )
}
