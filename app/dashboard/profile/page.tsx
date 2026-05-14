"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/features/auth"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Save, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { toast } from "sonner"

export default function ProfilePage() {
  const { user } = useAuth()
  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || ""
  const userEmail = user?.email || ""
  const avatarSeed = user?.user_metadata?.avatar_seed || null

  const handleSaveProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const newName = formData.get("name") as string

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { name: newName },
      })

      if (error) throw error
      toast.success("Profil berhasil diperbarui!")
    } catch (err: any) {
      toast.error(err.message || "Gagal menyimpan profil")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild className="rounded-full">
          <Link href="/dashboard/settings">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Profil Saya</h1>
          <p className="text-muted-foreground">
            Kelola informasi identitas akun FlowDay kamu
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        {/* Avatar Card */}
        <Card className="h-fit">
          <CardContent className="pt-6 flex flex-col items-center text-center">
            <UserAvatar 
              name={userName || "User"} 
              seed={avatarSeed}
              size={120}
              className="h-32 w-32 mb-4 ring-4 ring-primary/10"
            />
            <h3 className="font-bold text-xl">{userName}</h3>
            <p className="text-sm text-muted-foreground">{userEmail}</p>
          </CardContent>
        </Card>

        {/* Edit Form Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Detail Profil
            </CardTitle>
            <CardDescription>
              Ubah nama tampilan yang akan dilihat oleh sistem.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveProfile} className="space-y-6">
              <div className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nama Lengkap</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input 
                      id="name" 
                      name="name" 
                      defaultValue={userName} 
                      className="pl-10"
                      placeholder="Masukkan nama lengkap"
                      required
                    />
                  </div>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="email">Alamat Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      defaultValue={userEmail}
                      disabled
                      className="pl-10 opacity-60 bg-muted"
                    />
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    Email tidak dapat diubah untuk saat ini.
                  </p>
                </div>
              </div>

              <Separator />

              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving} className="gap-2 px-8">
                  {isSaving ? (
                    "Menyimpan..."
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      Simpan Perubahan
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
