"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw } from "lucide-react"

export default function ErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Dashboard error caught by boundary:", error)
  }, [error])

  return (
    <div className="flex h-[70vh] flex-col items-center justify-center gap-4 text-center px-4">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-8 w-8 text-destructive" />
      </div>
      <div className="space-y-2">
        <h2 className="text-2xl font-bold tracking-tight">Terjadi Kesalahan</h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Maaf, terjadi kesalahan saat memuat halaman ini. Silakan coba muat ulang halaman.
        </p>
      </div>
      <Button onClick={() => reset()} className="gap-2 mt-4">
        <RotateCcw className="h-4 w-4" />
        Muat Ulang
      </Button>
    </div>
  )
}
