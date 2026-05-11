import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Analytics | FlowDay",
  description: "Lihat statistik dan progress belajarmu secara detail.",
}

export default function AnalyticsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
