import Link from "next/link"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  Calendar, 
  BarChart3, 
  Flame,
  ArrowRight,
  BookOpen,
  Clock,
  Target
} from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-foreground">
                <span className="text-sm font-bold text-background">F</span>
              </div>
              <span className="text-lg font-semibold tracking-tight">FlowDay</span>
            </div>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">
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
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-32">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-muted/50 px-4 py-1.5 text-sm text-muted-foreground">
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Dirancang khusus untuk mahasiswa</span>
            </div>
            <h1 className="text-balance text-4xl font-bold tracking-tight md:text-5xl lg:text-6xl">
              Kelola Tugas Kuliah
              <span className="block text-muted-foreground">Lebih Mudah</span>
            </h1>
            <p className="mx-auto mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              FlowDay membantu mahasiswa mengatur deadline, membangun kebiasaan produktif, 
              dan memantau progress belajar dalam satu tempat.
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
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
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="border-t border-border/40 bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Semua yang kamu butuhkan
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Fitur lengkap untuk membantu produktivitas belajarmu
            </p>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <FeatureCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              title="Task Management"
              description="Kelola tugas kuliah dengan prioritas, deadline, dan kategori mata kuliah."
            />
            <FeatureCard
              icon={<Flame className="h-5 w-5" />}
              title="Habit Tracker"
              description="Bangun kebiasaan produktif dan pantau streak harianmu."
            />
            <FeatureCard
              icon={<BarChart3 className="h-5 w-5" />}
              title="Analytics"
              description="Lihat progress mingguan dan konsistensi belajarmu."
            />
            <FeatureCard
              icon={<Calendar className="h-5 w-5" />}
              title="Deadline Reminder"
              description="Jangan pernah lupa deadline dengan tampilan yang jelas."
            />
            <FeatureCard
              icon={<BookOpen className="h-5 w-5" />}
              title="Per Mata Kuliah"
              description="Organisir tugas berdasarkan mata kuliah yang kamu ambil."
            />
            <FeatureCard
              icon={<Target className="h-5 w-5" />}
              title="Progress Tracking"
              description="Pantau berapa banyak tugas yang sudah kamu selesaikan."
            />
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-balance text-3xl font-semibold tracking-tight md:text-4xl">
              Cara Kerja FlowDay
            </h2>
            <p className="mt-4 text-pretty text-muted-foreground">
              Tiga langkah sederhana untuk produktivitas maksimal
            </p>
          </div>
          <div className="mt-16 grid gap-8 md:grid-cols-3">
            <StepCard
              number="01"
              title="Tambah Tugas"
              description="Input tugas kuliah beserta deadline dan prioritasnya."
            />
            <StepCard
              number="02"
              title="Atur Habit"
              description="Tentukan kebiasaan harian yang ingin kamu bangun."
            />
            <StepCard
              number="03"
              title="Pantau Progress"
              description="Lihat statistik dan tetap konsisten setiap hari."
            />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t border-border/40 bg-muted/30 py-20 md:py-28">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-2xl text-center">
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
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-foreground">
                <span className="text-xs font-bold text-background">F</span>
              </div>
              <span className="text-sm font-medium">FlowDay</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Dibuat untuk mahasiswa Indonesia
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ 
  icon, 
  title, 
  description 
}: { 
  icon: React.ReactNode
  title: string
  description: string 
}) {
  return (
    <div className="rounded-xl border border-border/60 bg-background p-6 transition-colors hover:border-border">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}

function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <div className="text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-foreground text-lg font-semibold text-background">
        {number}
      </div>
      <h3 className="mt-4 font-semibold">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
        {description}
      </p>
    </div>
  )
}
