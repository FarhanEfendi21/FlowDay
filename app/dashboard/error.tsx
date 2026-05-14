'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { AlertTriangle, RotateCcw, Home } from 'lucide-react'
import Link from 'next/link'

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log error to an analytics service
    console.error('[Dashboard Error Boundary]', error)
  }, [error])

  return (
    <div className="flex min-h-[400px] flex-col items-center justify-center p-6 text-center animate-in fade-in zoom-in duration-300">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-destructive/10 text-destructive">
        <AlertTriangle className="h-10 w-10" />
      </div>
      <h2 className="mb-2 text-2xl font-bold tracking-tight">Waduh, ada masalah!</h2>
      <p className="mb-8 max-w-md text-muted-foreground">
        Sepertinya terjadi kesalahan saat memuat data dashboard. Jangan khawatir, kamu bisa mencoba memuat ulang halaman ini.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button onClick={() => reset()} className="gap-2">
          <RotateCcw className="h-4 w-4" />
          Coba Lagi
        </Button>
        <Button variant="outline" asChild className="gap-2">
          <Link href="/dashboard">
            <Home className="h-4 w-4" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
      {process.env.NODE_ENV === 'development' && (
        <div className="mt-8 max-w-full overflow-auto rounded-lg bg-muted p-4 text-left text-xs text-muted-foreground font-mono">
          <p className="font-bold text-destructive mb-1">Debug Info:</p>
          {error.message}
          {error.stack && <pre className="mt-2 opacity-50">{error.stack}</pre>}
        </div>
      )}
    </div>
  )
}
