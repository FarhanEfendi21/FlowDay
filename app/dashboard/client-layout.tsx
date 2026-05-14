"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { toggleThemeWithTransition } from "@/lib/theme-transition"
import { Button } from "@/components/ui/button"
import { UserAvatar } from "@/components/ui/user-avatar"
import { Logo } from "@/components/logo"
import { StaggeredMenu } from "@/components/ui/StaggeredMenu"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import {
  LayoutDashboard,
  CheckSquare,
  Flame,
  BarChart3,
  Settings,
  Moon,
  Sun,
  LogOut,
  User,
} from "lucide-react"
import { useTheme } from "next-themes"
import { OfflineIndicator } from "@/components/pwa/offline-indicator"
import { InstallPrompt } from "@/components/pwa/install-prompt"
import { useAuth, signOut } from "@/features/auth"
import { NotificationBell } from "@/components/notifications/notification-bell"
import { NotificationPermissionPrompt } from "@/components/notifications/notification-permission-prompt"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/dashboard/tasks", icon: CheckSquare },
  { name: "Habits", href: "/dashboard/habits", icon: Flame },
  { name: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()

  const { theme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Ensure existing users have avatar_seed (migration)
  useEffect(() => {
    if (user && !user.user_metadata?.avatar_seed) {
      // Import dynamically to avoid SSR issues
      import('@/lib/utils/avatar-seed').then(({ ensureAvatarSeed }) => {
        ensureAvatarSeed().catch(console.error)
      })
    }
  }, [user])

  // Derive display values from real Supabase user data
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User"
  const userEmail = user?.email || ""
  const avatarSeed = user?.user_metadata?.avatar_seed || null

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  const handleLogout = async () => {
    if (isLoggingOut) return   // prevent double-click
    setIsLoggingOut(true)
    try {
      // signOut() internally calls clearClientCache() first,
      // then revokes the refresh token server-side (scope: 'global').
      await signOut()
    } catch {
      // If server revoke fails, local data is already wiped — still safe to redirect.
    } finally {
      // replace() removes /dashboard from history so the back-button
      // cannot restore the old authenticated session.
      window.location.replace('/login')
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* PWA: Offline indicator banner */}
      <OfflineIndicator />

      {/* Sidebar - Persistent on tablet and desktop (md and above) */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-40 h-full w-64 border-r border-border bg-background transition-transform",
          "hidden md:block" // Visible on tablet and desktop
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-between border-b border-border px-6">
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size={32} showText={true} />
            </Link>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <div key={item.name}>
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </div>
              )
            })}
          </nav>

          {/* Bottom actions */}
          <div className="border-t border-border p-4 space-y-3">
            {/* Theme toggle and notifications */}
            <div className="grid grid-cols-2 gap-2">
              <NotificationBell className="w-full h-10" />
              {mounted && (
                <Button
                  variant="ghost"
                  onClick={(e) => toggleThemeWithTransition(theme === "dark" ? "light" : "dark", setTheme, e)}
                  className="w-full h-10"
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
            </div>

            {/* User section */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex w-full items-center gap-3 rounded-lg bg-muted/50 p-3 hover:bg-muted transition-colors">
                  <UserAvatar 
                    name={userName || "User"} 
                    seed={avatarSeed}
                    size={36}
                    className="h-9 w-9"
                  />
                  <div className="flex-1 truncate text-left">
                    <p className="text-sm font-medium">{userName}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {userEmail}
                    </p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/profile" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profil Saya
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings#notifications" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Pengaturan
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setIsLogoutDialogOpen(true)
                  }}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="md:pl-64 pb-16 md:pb-0">
        {/* Mobile Navigation & Header (Replaces topbar and bottom nav) */}
        <StaggeredMenu
          className="md:hidden"
          isFixed={true}
          position="right"
          colors={['var(--primary)', 'color-mix(in oklch, var(--primary), transparent 50%)']}
          currentPath={pathname}
          displayItemNumbering={true}
          items={navigation.map(n => ({ 
            label: n.name, 
            link: n.href, 
            icon: <n.icon className="w-5 h-5" /> 
          }))}
          headerLeft={
            <Link href="/dashboard" className="flex items-center gap-2 pl-2">
              <Logo size={28} showText={false} />
            </Link>
          }
          headerRight={
            <>
              <NotificationBell />
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="mr-1"
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                >
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                  <span className="sr-only">Toggle theme</span>
                </Button>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <UserAvatar 
                      name={userName || "User"} 
                      seed={avatarSeed}
                      size={32}
                      className="h-8 w-8"
                    />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/profile" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profil Saya
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings#notifications" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Pengaturan
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      setIsLogoutDialogOpen(true)
                    }}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          }
        />

        {/* Placeholder for fixed header on mobile */}
        <div className="h-[60px] md:hidden border-b border-border bg-background/80 backdrop-blur-xl sticky top-0 z-10" aria-hidden="true" />

        {/* Page content */}
        <main className="p-6 md:p-8 max-w-[1400px] mx-auto min-h-[calc(100vh-4rem)]">{children}</main>
      </div>

      {/* Notifications */}
      <NotificationPermissionPrompt />

      {/* PWA: Install prompt */}
      <InstallPrompt />

      {/* Logout Confirmation */}
      <AlertDialog open={isLogoutDialogOpen} onOpenChange={setIsLogoutDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Logout</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah kamu yakin ingin keluar dari akun FlowDay?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoggingOut}>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                handleLogout()
              }}
              disabled={isLoggingOut}
              className="bg-destructive text-white hover:bg-destructive/90 dark:text-destructive-foreground"
            >
              {isLoggingOut ? 'Keluar...' : 'Ya, Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
