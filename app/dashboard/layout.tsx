"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Logo } from "@/components/logo"
import { PillNav } from "@/components/ui/pill-nav"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
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

  // Derive display values from real Supabase user data
  const userName = user?.user_metadata?.name || user?.email?.split("@")[0] || "User"
  const userEmail = user?.email || ""
  const userInitial = userName.charAt(0).toUpperCase()

  const [isLoggingOut, setIsLoggingOut] = useState(false)

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

  return (
    <div className="min-h-screen bg-background">
      {/* PWA: Offline indicator banner */}
      <OfflineIndicator />

      {/* Desktop: PillNav with actions (≥1024px) */}
      <div className="hidden lg:block sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border">
        <div className="pill-nav-wrapper">
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
          />
          <div className="flex items-center gap-2">
            <NotificationBell />
            {mounted && (
              <Button
                variant="ghost"
                size="icon"
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
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-foreground text-background text-sm">
                      {userInitial}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/settings" className="flex items-center gap-2">
                    <Settings className="h-4 w-4" />
                    Settings
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="flex items-center gap-2 text-destructive cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  {isLoggingOut ? 'Keluar...' : 'Logout'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : "-100%",
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 border-r border-border bg-background lg:translate-x-0"
        )}
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: sidebarOpen ? 1 : 0, y: sidebarOpen ? 0 : -20 }}
            transition={{ delay: 0.1, duration: 0.3 }}
            className="flex h-16 items-center justify-between border-b border-border px-6"
          >
            <Link href="/dashboard" className="flex items-center gap-2">
              <Logo size={32} showText={false} />
            </Link>
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </motion.div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item, index) => {
              const isActive = pathname === item.href
              return (
                <motion.div
                  key={item.name}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{
                    opacity: sidebarOpen ? 1 : 0,
                    x: sidebarOpen ? 0 : -20,
                  }}
                  transition={{
                    delay: sidebarOpen ? 0.1 + index * 0.05 : 0,
                    duration: 0.3,
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                  }}
                >
                  <Link
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                      isActive
                        ? "bg-muted text-foreground"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.name}
                  </Link>
                </motion.div>
              )
            })}
          </nav>

          {/* User section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: sidebarOpen ? 1 : 0, y: sidebarOpen ? 0 : 20 }}
            transition={{ delay: 0.4, duration: 0.3 }}
            className="border-t border-border p-4"
          >
            <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
              <Avatar className="h-9 w-9">
                <AvatarFallback className="bg-foreground text-background text-sm">
                  {userInitial}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 truncate">
                <p className="text-sm font-medium">{userName}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {userEmail}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.aside>

      {/* Main content */}
      <div className="lg:pl-0">
        {/* Topbar - Mobile only */}
        <header className="sticky top-0 z-30 border-b border-border bg-background/80 backdrop-blur-xl lg:hidden">
          <div className="flex h-16 items-center justify-between gap-4 px-4 md:px-6">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <NotificationBell />
              {mounted && (
                <Button
                  variant="ghost"
                  size="icon"
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
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="bg-foreground text-background text-sm">
                        {userInitial}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard/settings" className="flex items-center gap-2">
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="flex items-center gap-2 text-destructive cursor-pointer"
                  >
                    <LogOut className="h-4 w-4" />
                    {isLoggingOut ? 'Keluar...' : 'Logout'}
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6 max-w-[1400px] mx-auto">{children}</main>
      </div>

      {/* Notifications */}
      <NotificationPermissionPrompt />

      {/* PWA: Install prompt */}
      <InstallPrompt />
    </div>
  )
}
