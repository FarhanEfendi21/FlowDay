/**
 * useRateLimit — client-side rate limiting for mutation actions.
 *
 * Prevents users from spamming create/delete operations by enforcing
 * a minimum interval between successive calls of the same action.
 *
 * Usage:
 *   const { guard } = useRateLimit("create-task", 2000) // 2s cooldown
 *   const handleCreate = () => guard(() => createTask.mutate(data))
 */
import { useRef, useCallback } from "react"
import { toast } from "sonner"

interface UseRateLimitOptions {
  /** Cooldown in milliseconds between allowed calls. Default: 1500ms */
  cooldownMs?: number
  /** Toast message shown when rate limited. */
  message?: string
}

export function useRateLimit(
  key: string,
  { cooldownMs = 1500, message = "Terlalu cepat, coba lagi sebentar." }: UseRateLimitOptions = {}
) {
  const lastCallRef = useRef<number>(0)

  const guard = useCallback(
    <T>(fn: () => T): T | undefined => {
      const now = Date.now()
      const elapsed = now - lastCallRef.current

      if (elapsed < cooldownMs) {
        toast.warning(message, { id: `rate-limit-${key}` })
        return undefined
      }

      lastCallRef.current = now
      return fn()
    },
    [cooldownMs, key, message]
  )

  return { guard }
}
