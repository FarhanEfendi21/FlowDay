import type { Metadata } from "next"
import ClientLayout from "./client-layout"

export const metadata: Metadata = {
  title: "Dashboard | FlowDay",
  description: "Ringkasan produktivitas, tugas mendatang, dan progres habit harianmu.",
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <ClientLayout>{children}</ClientLayout>
}
