"use client"

import * as React from "react"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import {
  CheckCircle2,
  Flame,
  TrendingUp,
  ArrowRight,
  Sparkles,
} from "lucide-react"

interface OnboardingModalProps {
  open: boolean
  onComplete: () => void
}

const ONBOARDING_SLIDES = [
  {
    id: "welcome",
    title: "Selamat Datang! 👋",
    description: "FlowDay membantu kamu mengatur tugas kuliah dan membangun kebiasaan produktif",
    icon: Sparkles,
    gradient: "from-purple-500 to-pink-500",
  },
  {
    id: "tasks",
    title: "Kelola Tugas Kuliah",
    description: "Catat semua tugas, set deadline, dan jangan pernah lupa lagi",
    icon: CheckCircle2,
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    id: "habits",
    title: "Bangun Kebiasaan Baik",
    description: "Track kebiasaan harianmu dan lihat progress streak kamu",
    icon: Flame,
    gradient: "from-orange-500 to-red-500",
  },
  {
    id: "ready",
    title: "Siap Produktif! 🚀",
    description: "Yuk mulai perjalanan produktivitasmu bersama FlowDay",
    icon: TrendingUp,
    gradient: "from-green-500 to-emerald-500",
  },
]

export function OnboardingModal({ open, onComplete }: OnboardingModalProps) {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const slide = ONBOARDING_SLIDES[currentSlide]
  const progress = ((currentSlide + 1) / ONBOARDING_SLIDES.length) * 100
  const isLastSlide = currentSlide === ONBOARDING_SLIDES.length - 1

  const handleNext = () => {
    if (isLastSlide) {
      onComplete()
    } else {
      setCurrentSlide(currentSlide + 1)
    }
  }

  const Icon = slide.icon

  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent 
        className="max-w-md p-0 gap-0 overflow-hidden border-0"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Hidden title for accessibility */}
        <DialogTitle className="sr-only">
          Onboarding FlowDay - {slide.title}
        </DialogTitle>

        {/* Gradient Header */}
        <div className={cn(
          "relative h-48 bg-gradient-to-br flex items-center justify-center",
          slide.gradient
        )}>
          <div className="absolute inset-0 bg-black/10" />
          <div className="relative">
            <div className="flex items-center justify-center w-24 h-24 rounded-full bg-white/20 backdrop-blur-sm">
              <Icon className="w-12 h-12 text-white" />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          {/* Title & Description */}
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold tracking-tight">
              {slide.title}
            </h2>
            <p className="text-muted-foreground text-base leading-relaxed">
              {slide.description}
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <Progress value={progress} className="h-1.5" />
            <div className="flex justify-center gap-1.5">
              {ONBOARDING_SLIDES.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  aria-label={`Go to slide ${index + 1}`}
                  className={cn(
                    "h-1.5 rounded-full transition-all duration-300",
                    index === currentSlide
                      ? "w-8 bg-primary"
                      : "w-1.5 bg-muted hover:bg-muted-foreground/30"
                  )}
                />
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div className="flex gap-3">
            {currentSlide > 0 && (
              <Button
                variant="outline"
                onClick={() => setCurrentSlide(currentSlide - 1)}
                className="flex-1"
              >
                Kembali
              </Button>
            )}
            <Button
              onClick={handleNext}
              className={cn(
                "gap-2",
                currentSlide === 0 ? "w-full" : "flex-1"
              )}
            >
              {isLastSlide ? (
                <>
                  Mulai Sekarang
                  <Sparkles className="w-4 h-4" />
                </>
              ) : (
                <>
                  Lanjut
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </div>

          {/* Skip Button */}
          {!isLastSlide && (
            <button
              onClick={onComplete}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Lewati
            </button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
