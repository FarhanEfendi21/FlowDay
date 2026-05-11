"use client"

import { useEffect, useState, useRef } from "react"
import dynamic from "next/dynamic"
import Image from "next/image"
import Link from "next/link"
import { useTheme } from "next-themes"
import { motion, useInView, useScroll, useTransform } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import CarouselSteps from "@/components/ui/carousel-steps"

// Removed heavy 3D backgrounds to reduce bundle size
const LogoLoop = dynamic(() => import("@/components/ui/logo-loop"), {
  ssr: false,
  loading: () => null,
})
import { 
  CheckCircle2, 
  Calendar, 
  BarChart3, 
  Flame,
  ArrowRight,
  BookOpen,
  Clock,
  Target,
  ChevronDown,
  Plus,
  Eye,
  TrendingUp
} from "lucide-react"
import { 
  SiReact, 
  SiNextdotjs, 
  SiTypescript, 
  SiTailwindcss,
  SiSupabase,
  SiVercel,
  SiFramer,
  SiFirebase
} from 'react-icons/si'

export default function LandingPage() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const galaxyOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0])
  
  // Wait for client-side mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])
  
  const carouselSteps = [
    {
      id: 1,
      title: "Tambah Tugas",
      description: "Input tugas kuliah beserta deadline dan prioritasnya. Atur kategori berdasarkan mata kuliah.",
      icon: <Plus className="carousel-icon" />
    },
    {
      id: 2,
      title: "Atur Habit",
      description: "Tentukan kebiasaan harian yang ingin kamu bangun. Track progress dan streak harianmu.",
      icon: <Eye className="carousel-icon" />
    },
    {
      id: 3,
      title: "Pantau Progress",
      description: "Lihat statistik dan tetap konsisten setiap hari. Analisis produktivitasmu dengan visualisasi data.",
      icon: <TrendingUp className="carousel-icon" />
    }
  ]
  
  const techStack = [
    { node: <SiReact className="w-12 h-12" />, title: "React", href: "https://react.dev" },
    { node: <SiNextdotjs className="w-12 h-12" />, title: "Next.js", href: "https://nextjs.org" },
    { node: <SiTypescript className="w-12 h-12" />, title: "TypeScript", href: "https://www.typescriptlang.org" },
    { node: <SiTailwindcss className="w-12 h-12" />, title: "Tailwind CSS", href: "https://tailwindcss.com" },
    { node: <SiSupabase className="w-12 h-12" />, title: "Supabase", href: "https://supabase.com" },
    { node: <SiVercel className="w-12 h-12" />, title: "Vercel", href: "https://vercel.com" },
    { node: <SiFramer className="w-12 h-12" />, title: "Framer Motion", href: "https://www.framer.com/motion" },
    { node: <SiFirebase className="w-12 h-12" />, title: "Firebase", href: "https://firebase.google.com" },
  ]
  
  return (
    <div className="relative min-h-screen bg-background overflow-hidden">
      {/* Background - Fallback static gradient instead of heavy 3D */}
      <div className="fixed inset-0 z-0 pointer-events-none bg-gradient-to-br from-background via-background to-primary/5 opacity-50" />

      {/* Content */}
      <div className="relative z-10">
      {/* Navigation with Liquid Glass Effect */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="relative">
          {/* Glass morphism background */}
          <div className="absolute inset-0 bg-gradient-to-r from-background/60 via-background/40 to-background/60 backdrop-blur-2xl border-b border-white/10 shadow-[0_8px_32px_0_rgba(0,0,0,0.1)]" />
          
          {/* Animated liquid gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-purple-500/5 to-pink-500/5 animate-liquid-flow opacity-50" />
          
          {/* Content */}
          <div className="relative mx-auto max-w-6xl px-6">
            <div className="flex h-16 items-center justify-between">
              <Logo size={32} showText={false} />
              <div className="flex items-center gap-3">
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="hover:bg-white/10 transition-all duration-300">
                    Masuk
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm">
                    Daftar Gratis
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Full Height */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <motion.div 
            className="mx-auto max-w-3xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <motion.div 
              className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Dirancang khusus untuk mahasiswa</span>
            </motion.div>
            
            <motion.h1 
              className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
            >
              Kelola Tugas Kuliah
              <span className="block text-muted-foreground">Lebih Mudah</span>
            </motion.h1>
            
            <motion.p 
              className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.8 }}
            >
              FlowDay membantu mahasiswa mengatur deadline, membangun kebiasaan produktif, 
              dan memantau progress belajar dalam satu tempat.
            </motion.p>
            
            <motion.div 
              className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.8 }}
            >
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Mulai Sekarang
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sudah punya akun
                </Button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
        
        {/* Scroll Indicator */}
        <motion.div 
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1, duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
        >
          <ChevronDown className="h-6 w-6 text-muted-foreground" />
        </motion.div>
      </section>

      {/* Features Section with MagicBento */}
      <section className="border-t border-border/40 bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader 
            title="Semua yang kamu butuhkan"
            description="Fitur lengkap untuk membantu produktivitas belajarmu"
          />
          
          {/* Bento Grid */}
          <div className="mt-16 grid gap-4 md:grid-cols-2 lg:grid-cols-4 lg:grid-rows-3">
            <BentoCard
              image="/assets/px-1.jpg"
              title="Task Management"
              description="Kelola tugas kuliah dengan prioritas, deadline, dan kategori mata kuliah."
              label="Produktif"
              index={0}
              className="lg:col-span-1 lg:row-span-1"
            />
            <BentoCard
              image="/assets/px-2.jpg"
              title="Habit Tracker"
              description="Bangun kebiasaan produktif dan pantau streak harianmu."
              label="Konsisten"
              index={1}
              className="lg:col-span-1 lg:row-span-1"
            />
            <BentoCard
              image="/assets/px-3.jpg"
              title="Analytics"
              description="Lihat progress mingguan dan konsistensi belajarmu dengan visualisasi data yang jelas."
              label="Insight"
              index={2}
              className="lg:col-span-2 lg:row-span-2"
            />
            <BentoCard
              image="/assets/px-4.jpg"
              title="Deadline Reminder"
              description="Jangan pernah lupa deadline dengan notifikasi dan tampilan yang jelas."
              label="Tepat Waktu"
              index={3}
              className="lg:col-span-2 lg:row-span-2"
            />
            <BentoCard
              image="/assets/px-5.jpg"
              title="Per Mata Kuliah"
              description="Organisir tugas berdasarkan mata kuliah yang kamu ambil."
              label="Terorganisir"
              index={4}
              className="lg:col-span-1 lg:row-span-1"
            />
            <BentoCard
              image="/assets/px-6.jpg"
              title="Progress Tracking"
              description="Pantau berapa banyak tugas yang sudah kamu selesaikan."
              label="Target"
              index={5}
              className="lg:col-span-1 lg:row-span-1"
            />
          </div>
        </div>
      </section>

      {/* How it Works with Carousel */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <SectionHeader 
            title="Cara Kerja FlowDay"
            description="Tiga langkah sederhana untuk produktivitas maksimal"
          />
          <div className="mt-16 sm:mt-20 flex justify-center">
            <CarouselSteps
              items={carouselSteps}
              baseWidth={420}
              autoplay={true}
              autoplayDelay={4000}
              pauseOnHover={true}
              loop={true}
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <CTASection />
        </div>
      </section>

      {/* Tech Stack Section */}
      <section className="border-t border-border/40 bg-muted/30 py-16">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-semibold tracking-tight">
              Dibangun dengan teknologi modern
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Tech stack yang kami gunakan
            </p>
          </div>
          <div className="h-24 overflow-hidden">
            {mounted && (
              <LogoLoop
                logos={techStack}
                speed={40}
                direction="left"
                logoHeight={48}
                gap={64}
                hoverSpeed={10}
                scaleOnHover
                fadeOut
                fadeOutColor={theme === "dark" ? "#0b0b0b" : "#ffffff"}
                ariaLabel="Technology stack"
              />
            )}
          </div>
        </div>
      </section>
      </div>
    </div>
  )
}

function SectionHeader({ title, description }: { title: string; description: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div 
      ref={ref}
      className="mx-auto max-w-2xl text-center"
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6 }}
    >
      <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-pretty text-muted-foreground">
        {description}
      </p>
    </motion.div>
  )
}

function CTASection() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div 
      ref={ref}
      className="mx-auto max-w-2xl text-center"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.6 }}
    >
      <Clock className="mx-auto h-10 w-10 text-muted-foreground" />
      <h2 className="mt-6 text-balance text-3xl font-semibold tracking-tight md:text-4xl">
        Jangan biarkan deadline mengejarmu
      </h2>
      <p className="mt-4 text-pretty text-muted-foreground">
        Mulai kelola tugas dan kebiasaanmu hari ini. Gratis selamanya.
      </p>
      <div className="mt-8">
        <Link href="/register">
          <Button size="lg" className="gap-2">
            Daftar Sekarang
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </motion.div>
  )
}

function BentoCard({
  image,
  title,
  description,
  label,
  index = 0,
  className = ''
}: {
  image: string
  title: string
  description: string
  label: string
  index?: number
  className?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  const [glowPosition, setGlowPosition] = useState({ x: 50, y: 50 })
  const [glowIntensity, setGlowIntensity] = useState(0)

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return
    const rect = ref.current.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setGlowPosition({ x, y })
    setGlowIntensity(1)
  }

  const handleMouseLeave = () => {
    setGlowIntensity(0)
  }

  return (
    <motion.div
      ref={ref}
      className={`group relative rounded-2xl border border-border/60 bg-background overflow-hidden transition-all duration-300 hover:border-foreground/20 hover:shadow-lg ${className}`}
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Image Container */}
      <div className="relative w-full aspect-[4/3] overflow-hidden">
        <Image
          src={image}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
        />
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-60" />
        
        {/* Label Badge */}
        <div className="absolute top-4 right-4">
          <span className="text-xs font-medium text-foreground bg-background/90 backdrop-blur-sm px-3 py-1.5 rounded-full border border-border/50">
            {label}
          </span>
        </div>
      </div>
      
      {/* Content */}
      <div className="relative p-6">
        <h3 className="font-semibold text-lg mb-2 text-foreground">{title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {description}
        </p>
      </div>
    </motion.div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description,
  index = 0
}: { 
  icon: React.ReactNode
  title: string
  description: string
  index?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div 
      ref={ref}
      className="rounded-xl border border-border/60 bg-background p-6 transition-colors hover:border-border"
      initial={{ opacity: 0, y: 50 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </motion.div>
  )
}

function StepCard({
  number,
  title,
  description,
  index = 0
}: {
  number: string
  title: string
  description: string
  index?: number
}) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: "-100px" })
  
  return (
    <motion.div 
      ref={ref}
      className="text-center"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
      transition={{ duration: 0.5, delay: index * 0.2 }}
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-lg font-semibold text-background">
        {number}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </motion.div>
  )
}
