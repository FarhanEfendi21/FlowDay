'use client'

import { useEffect, useState } from 'react'
import { WifiOff, Wifi } from 'lucide-react'

/**
 * Floating offline/online indicator.
 * - Muncul dengan slide-down animation saat offline
 * - Auto-dismiss setelah 3 detik saat kembali online
 * - Tidak tampil saat online normal (tidak mengganggu UX)
 */
export function OfflineIndicator() {
  const [isOnline, setIsOnline]     = useState(true)
  const [showBanner, setShowBanner] = useState(false)
  const [justReconnected, setJustReconnected] = useState(false)

  useEffect(() => {
    // Initialize from actual browser state
    setIsOnline(navigator.onLine)
    if (!navigator.onLine) setShowBanner(true)

    function handleOnline() {
      setIsOnline(true)
      setJustReconnected(true)
      // Show "back online" briefly then hide
      setTimeout(() => {
        setShowBanner(false)
        setJustReconnected(false)
      }, 3000)
    }

    function handleOffline() {
      setIsOnline(false)
      setShowBanner(true)
      setJustReconnected(false)
    }

    window.addEventListener('online',  handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online',  handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  if (!showBanner) return null

  return (
    <div
      className={`
        fixed top-0 left-0 right-0 z-[100]
        flex items-center justify-center gap-2
        px-4 py-2 text-sm font-medium
        transition-all duration-300 ease-out
        ${isOnline && justReconnected
          ? 'bg-green-600 text-white translate-y-0'
          : !isOnline
            ? 'bg-amber-500 text-white translate-y-0'
            : '-translate-y-full'
        }
      `}
      role="status"
      aria-live="polite"
    >
      {isOnline && justReconnected ? (
        <>
          <Wifi className="h-4 w-4" />
          <span>Kembali online</span>
        </>
      ) : (
        <>
          <WifiOff className="h-4 w-4" />
          <span>Mode offline — menampilkan data tersimpan</span>
        </>
      )}
    </div>
  )
}
