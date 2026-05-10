"use client"

import { useState, useEffect } from "react"
import { useGetSubjects, useRemoveSubject } from "@/features/subjects"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  User,
  Moon,
  Sun,
  Palette,
  BookOpen,
  X,
  LogOut,
  RotateCcw,
  Bell,
} from "lucide-react"
import { useAuth, signOut, clearClientCache } from "@/features/auth"
import { createClient } from "@/lib/supabase/client"
import { useOnboarding } from "@/hooks/use-onboarding"
import { useFCM } from "@/features/notifications/hooks/useFCM"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // ── Subjects dari Supabase (user-specific, isolated) ──────
  const { data: subjects = [], isLoading: loadingSubjects } = useGetSubjects()
  const removeSubjectMutation = useRemoveSubject()
  const { user } = useAuth()
  const { resetOnboarding } = useOnboarding()
  const { permission, isSupported, requestPermission } = useFCM()
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Derive display values from real user data
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || ""
  const userEmail = user?.email || ""
  const userInitial = userName.charAt(0).toUpperCase()

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)
    setSaveMessage(null)

    const formData = new FormData(e.currentTarget)
    const newName = formData.get("name") as string

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { name: newName },
      })

      if (error) throw error
      setSaveMessage("Profil berhasil disimpan!")
    } catch {
      setSaveMessage("Gagal menyimpan profil")
    } finally {
      setIsSaving(false)
    }
  }

  const handleLogout = async () => {
    // 1. Clear all local cache immediately
    clearClientCache()
    try {
      // 2. Revoke session server-side
      await signOut()
    } catch {
      // Continue — local data already cleared
    }
    window.location.href = "/login"
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Kelola profil dan preferensi aplikasi
        </p>
      </div>

      {/* Profile Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <User className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Profile</CardTitle>
          </div>
          <CardDescription>Informasi profil kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-foreground text-background text-xl">
                {userInitial}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{userName}</p>
              <p className="text-sm text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <Separator />
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" name="name" defaultValue={userName} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  defaultValue={userEmail}
                  disabled
                  className="opacity-60"
                />
              </div>
            </div>
            {saveMessage && (
              <p className={`text-sm ${saveMessage.includes("berhasil") ? "text-green-600 dark:text-green-400" : "text-destructive"}`}>
                {saveMessage}
              </p>
            )}
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Appearance Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Palette className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Tampilan</CardTitle>
          </div>
          <CardDescription>Kustomisasi tampilan aplikasi</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                {mounted ? (
                  theme === "dark" ? (
                    <Moon className="h-5 w-5" />
                  ) : (
                    <Sun className="h-5 w-5" />
                  )
                ) : (
                  <div className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Aktifkan mode gelap untuk kenyamanan mata
                </p>
              </div>
            </div>
            {mounted && (
              <Switch
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
              />
            )}
          </div>
        </CardContent>
      </Card>

      {/* Notifications Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Notifikasi</CardTitle>
          </div>
          <CardDescription>Kelola izin notifikasi pengingat tugas dan habit</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-muted">
                <Bell className={cn("h-5 w-5", permission === "granted" ? "text-primary" : "text-muted-foreground")} />
              </div>
              <div>
                <p className="font-medium">Push Notifications</p>
                <p className="text-sm text-muted-foreground">
                  {isSupported 
                    ? permission === "granted" 
                      ? "Notifikasi telah diaktifkan." 
                      : permission === "denied"
                        ? "Akses notifikasi diblokir. Harap izinkan melalui pengaturan browser Anda."
                        : "Dapatkan pengingat untuk deadline dan habit Anda."
                    : "Browser Anda tidak mendukung push notifications."}
                </p>
              </div>
            </div>
            {isSupported && permission !== "granted" && (
              <Button 
                onClick={requestPermission} 
                disabled={permission === "denied"}
                variant={permission === "denied" ? "outline" : "default"}
              >
                {permission === "denied" ? "Diblokir" : "Aktifkan"}
              </Button>
            )}
            {isSupported && permission === "granted" && (
              <Badge variant="default" className="bg-green-500 hover:bg-green-600 sm:self-center">
                Aktif
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Subjects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Mata Kuliah</CardTitle>
          </div>
          <CardDescription>
            Daftar mata kuliah yang kamu ambil semester ini. 
            <span className="block mt-1 text-xs">
              💡 Tambah mata kuliah baru dari halaman <strong>Tasks</strong> saat membuat tugas.
            </span>
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingSubjects ? (
            <div className="flex flex-wrap gap-2">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-7 w-24 rounded-full bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {subjects.map((subject) => (
                <Badge
                  key={subject.id}
                  variant="secondary"
                  className="gap-1 py-1.5 pl-3 pr-1.5"
                >
                  <span className="flex items-center gap-1.5">
                    {subject.name}
                    {subject.hasPracticum && (
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/20 px-1.5 py-0.5 text-[10px] font-medium text-primary">
                        P
                      </span>
                    )}
                  </span>
                  <button
                    onClick={() => removeSubjectMutation.mutate(subject.id)}
                    disabled={removeSubjectMutation.isPending}
                    className="ml-1 rounded-full p-0.5 hover:bg-muted-foreground/20 disabled:opacity-50"
                  >
                    <X className="h-3 w-3" />
                    <span className="sr-only">Hapus {subject.name}</span>
                  </button>
                </Badge>
              ))}
              {subjects.length === 0 && (
                <div className="rounded-lg border border-dashed border-muted-foreground/25 p-4 text-center">
                  <BookOpen className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2" />
                  <p className="text-sm font-medium text-muted-foreground mb-1">
                    Belum ada mata kuliah
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Buat tugas pertamamu di halaman Tasks untuk menambah mata kuliah
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <LogOut className="h-5 w-5 text-muted-foreground" />
            <CardTitle className="text-base font-medium">Akun</CardTitle>
          </div>
          <CardDescription>Kelola akun FlowDay kamu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reset Onboarding</p>
              <p className="text-sm text-muted-foreground">
                Tampilkan tutorial awal lagi
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={resetOnboarding}
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Logout</p>
              <p className="text-sm text-muted-foreground">
                Keluar dari akun FlowDay
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
