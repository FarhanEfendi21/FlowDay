"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn, generateAvatarGradient } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { PillNav } from "@/components/ui/pill-nav"
import { useScrollDirection } from "@/hooks/use-scroll-direction"
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
  Menu,
  X,
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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile sidebar on route change (e.g. hardware back button or link click)
  useEffect(() => {
    setSidebarOpen(false)
  }, [pathname])

  // Derive display values from real Supabase user data
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User"
  const userEmail = user?.email || ""
  const userInitial = userName.charAt(0).toUpperCase()

  const [isLoggingOut, setIsLoggingOut] = useState(false)
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false)

  // PillNav items
  const pillNavItems = navigation.map(item => ({
    label: item.name,
    href: item.href,
    ariaLabel: item.name
  }))

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

  const { scrollDirection, scrollY } = useScrollDirection()
  const isHidden = scrollDirection === "down" && scrollY > 80

  return (
    <div className="min-h-screen bg-background">
      {/* PWA: Offline indicator banner */}
      <OfflineIndicator />

      {/* Unified Floating Pill Navbar (Premium UX with Smart Auto-Hide) */}
      <motion.div
        initial={{ y: 0 }}
        animate={{ y: isHidden ? -100 : 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="fixed top-0 left-0 right-0 z-[9999] pointer-events-none"
      >
        <PillNav
        logo={mounted && theme === "dark" ? "/icons/white-logo.png" : "/icons/black-logo.png"}
        logoAlt="FlowDay Logo"
        items={pillNavItems}
        activeHref={pathname}
        baseColor="hsl(var(--background))"
        pillColor="hsl(var(--foreground))"
        hoveredPillTextColor="hsl(var(--background))"
        pillTextColor="hsl(var(--background))"
        initialLoadAnimation={true}
        actions={
          <div className="flex items-center gap-1 md:gap-2">
            <NotificationBell />
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
                className="rounded-full h-8 w-8 md:h-10 md:w-10"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full h-8 w-8 md:h-10 md:w-10 overflow-hidden ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                  <Avatar className="h-7 w-7 md:h-8 md:w-8">
                    <AvatarFallback 
                      className="text-white text-[10px] md:text-xs border shadow-sm"
                      style={{ background: generateAvatarGradient(userName || "") }}
                    >
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 mt-2 p-1.5 rounded-xl shadow-2xl border-muted/50 backdrop-blur-xl">
                <div className="px-2 py-1.5 mb-1">
                  <p className="text-sm font-semibold truncate">{userName}</p>
                  <p className="text-xs text-muted-foreground truncate">{userEmail}</p>
                </div>
                <DropdownMenuSeparator className="bg-muted/50" />
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/dashboard/settings" className="flex items-center gap-3 py-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span>Profil Saya</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-lg cursor-pointer">
                  <Link href="/dashboard/settings#notifications" className="flex items-center gap-3 py-2">
                    <Settings className="h-4 w-4 text-muted-foreground" />
                    <span>Pengaturan</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-muted/50" />
                <DropdownMenuItem
                  onSelect={(e) => {
                    e.preventDefault()
                    setIsLogoutDialogOpen(true)
                  }}
                  className="rounded-lg flex items-center gap-3 py-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        }
      />
      </motion.div>



      <div className="flex-1">
        {/* Page content */}
        <main className="p-4 md:p-8 pt-20 md:pt-24 max-w-[1400px] mx-auto min-h-screen">
          {children}
        </main>
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
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoggingOut ? 'Keluar...' : 'Ya, Logout'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
