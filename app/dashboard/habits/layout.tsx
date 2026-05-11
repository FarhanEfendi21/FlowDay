import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Habits | FlowDay",
  description: "Lacak kebiasaan harian dan bangun rutinitas yang baik.",
}

export default function HabitsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
