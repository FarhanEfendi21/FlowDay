import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Tasks | FlowDay",
  description: "Kelola daftar tugas dan deadline kamu dengan mudah.",
}

export default function TasksLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
