import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Settings | FlowDay",
  description: "Atur profil, preferensi, dan notifikasi akun kamu.",
}

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
