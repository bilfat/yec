import { Metadata } from "next"
import { JudgeDashboard } from "@/components/judge/dashboard/JudgeDashboard"

export const metadata: Metadata = {
  title: "Dashboard Juri | Young Entrepreneur Camp",
  description: "Dashboard Penilaian Juri YEC",
}

export default function JuriDashboardPage() {
  return <JudgeDashboard />
}
