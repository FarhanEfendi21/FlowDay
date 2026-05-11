"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertCircle, RotateCcw } from "lucide-react"
import Link from "next/link"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Global error caught by boundary:", error)
  }, [error])

  return (
    <html>
      <body>
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 text-center px-4 bg-background text-foreground">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">Terjadi Kesalahan Kritis</h2>
            <p className="text-muted-foreground max-w-md mx-auto">
              Aplikasi mengalami masalah yang tidak terduga.
            </p>
          </div>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => reset()} className="gap-2">
              <RotateCcw className="h-4 w-4" />
              Coba Lagi
            </Button>
            <Link href="/">
              <Button variant="outline">Kembali ke Beranda</Button>
            </Link>
          </div>
        </div>
      </body>
    </html>
  )
}
