"use client"

import { useState } from "react"
import { useGetSubjects, useAddSubject, useRemoveSubject } from "@/features/subjects"
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  User,
  Moon,
  Sun,
  Palette,
  BookOpen,
  Plus,
  X,
  LogOut,
  RotateCcw,
} from "lucide-react"
import { useAuth, signOut, clearClientCache } from "@/features/auth"
import { createClient } from "@/lib/supabase/client"
import { useOnboarding } from "@/hooks/use-onboarding"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  // ── Subjects dari Supabase (user-specific, isolated) ──────
  const { data: subjects = [], isLoading: loadingSubjects } = useGetSubjects()
  const addSubjectMutation    = useAddSubject()
  const removeSubjectMutation = useRemoveSubject()
  const { user } = useAuth()
  const { resetOnboarding } = useOnboarding()
  const [newSubject, setNewSubject] = useState("")
  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveMessage, setSaveMessage] = useState<string | null>(null)

  // Derive display values from real user data
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || ""
  const userEmail = user?.email || ""
  const userInitial = userName.charAt(0).toUpperCase()

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newSubject.trim()) return
    addSubjectMutation.mutate(newSubject.trim(), {
      onSuccess: () => {
        setNewSubject("")
        setIsAddSubjectOpen(false)
      },
    })
  }

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
                {theme === "dark" ? (
                  <Moon className="h-5 w-5" />
                ) : (
                  <Sun className="h-5 w-5" />
                )}
              </div>
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  Aktifkan mode gelap untuk kenyamanan mata
                </p>
              </div>
            </div>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subjects Section */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-muted-foreground" />
              <CardTitle className="text-base font-medium">Mata Kuliah</CardTitle>
            </div>
            <Dialog open={isAddSubjectOpen} onOpenChange={setIsAddSubjectOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Tambah
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Tambah Mata Kuliah</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleAddSubject} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject">Nama Mata Kuliah</Label>
                    <Input
                      id="subject"
                      value={newSubject}
                      onChange={(e) => setNewSubject(e.target.value)}
                      placeholder="Contoh: Pemrograman Web"
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Tambah Mata Kuliah
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <CardDescription>Daftar mata kuliah yang kamu ambil semester ini</CardDescription>
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
                  {subject.name}
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
                <p className="text-sm text-muted-foreground">
                  Belum ada mata kuliah. Tambah mata kuliah pertamamu!
                </p>
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
