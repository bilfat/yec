"use client"

import * as React from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import {
  Users, FileCheck, Award, Clock, ArrowUpRight,
  PlusCircle, Download, FileText, CheckCircle2, AlertCircle
} from "lucide-react"
import { fetchApi } from "@/lib/api"

interface DashboardSummary {
  stats: {
    totalTeams: number
    bmcSubmitted: number
    passedPitching: number
    pendingEvaluation: number
  }
  recentActivities: {
    team: string
    action: string
    time: string
    type: "success" | "info" | "warning"
  }[]
  stages: {
    bmcSubmission: string
    bmcEvaluation: string
    pitching: string
    pitchingEvaluation?: string
  }
}

export default function AdminDashboardPage() {
  const [data, setData] = React.useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)

  React.useEffect(() => {
    async function loadData() {
      const res = await fetchApi<DashboardSummary>('/dashboard/summary')
      if (res.success && res.data) {
        setData(res.data)
      }
      setIsLoading(false)
    }
    loadData()
  }, [])

  if (isLoading || !data) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-yec-amber border-t-transparent" />
      </div>
    )
  }

  const STATS = [
    { title: "Total Tim Terdaftar", value: data.stats.totalTeams, desc: "Tim terdaftar dari PIN", icon: <Users className="h-6 w-6 text-yec-amber" />, bg: "bg-yec-amber/10" },
    { title: "Karya BMC Submit", value: data.stats.bmcSubmitted, desc: "PDF BMC sudah diunggah", icon: <FileCheck className="h-6 w-6 text-success" />, bg: "bg-success/10" },
    { title: "Lolos ke Pitching", value: data.stats.passedPitching, desc: "Tim lolos seleksi BMC", icon: <Award className="h-6 w-6 text-info" />, bg: "bg-info/10" },
    { title: "Evaluasi Pending", value: data.stats.pendingEvaluation, desc: "Menunggu penilaian juri", icon: <Clock className="h-6 w-6 text-warning" />, bg: "bg-warning/10" },
  ]

  const getBadgeVariant = (status: string) => {
    if (status === "OPEN") return "success"
    if (status === "IN_PROGRESS") return "warning"
    return "default"
  }

  const getStatusLabel = (status: string) => {
    if (status === "OPEN") return "TERBUKA"
    if (status === "IN_PROGRESS") return "BERLANGSUNG"
    return "TERKUNCI"
  }

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-[28px] border border-[#DDD3C7] bg-yec-white p-6 md:p-8 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6"
      >
        <div>
          <span className="inline-block rounded-full bg-yec-amber/15 px-3 py-1 text-xs font-bold text-yec-amber uppercase tracking-wider mb-2">
            Ikhtisar Kompetisi
          </span>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-yec-brown mb-2">
            Selamat Datang di Command Center YEC 2026
          </h2>
          <p className="text-sm text-yec-text-secondary max-w-2xl leading-relaxed">
            Kelola tahapan kompetisi, tim peserta, juri penilai, serta pantau progres evaluasi secara real-time dari satu tempat.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 shrink-0">
          <Link href="/admin/teams">
            <Button variant="primary" size="sm" className="gap-2">
              <PlusCircle className="h-4 w-4" /> Kelola Tim
            </Button>
          </Link>
          <Link href="/admin/settings">
            <Button variant="outline" size="sm" className="gap-2">
              Atur Tahapan
            </Button>
          </Link>
        </div>
      </motion.div>

      {/* Metrics Grid (2x2 on mobile, 4 columns on desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        {STATS.map((s, index) => (
          <motion.div
            key={s.title}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="p-3.5 sm:p-5 h-full flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-2.5 sm:mb-4">
                <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-yec-text-muted line-clamp-1">{s.title}</span>
                <div className={`flex h-7 w-7 sm:h-9 sm:w-9 shrink-0 items-center justify-center rounded-lg sm:rounded-xl ${s.bg}`}>
                  {React.cloneElement(s.icon as React.ReactElement<any>, { className: "h-3.5 w-3.5 sm:h-5 sm:w-5" })}
                </div>
              </div>
              <div>
                <div className="font-display font-bold text-2xl sm:text-3xl text-yec-brown mb-0.5 sm:mb-1">{s.value}</div>
                <p className="text-[10px] sm:text-xs text-yec-text-secondary line-clamp-1">{s.desc}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Main Sections Grid */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Recent Activity */}
        <Card className="lg:col-span-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="font-display font-bold text-xl text-yec-brown">Aktivitas Terkini</h3>
              <p className="text-xs text-yec-text-secondary mt-0.5">Pembaruan terkini dari peserta dan juri</p>
            </div>
            <Badge variant="info">LIVE FEED</Badge>
          </div>

          <div className="space-y-4">
            {data.recentActivities.map((act, idx) => (
              <div key={idx} className="flex items-start gap-4 p-3.5 rounded-xl bg-yec-paper border border-[#DDD3C7]/60">
                <div className="mt-0.5 shrink-0">
                  {act.type === "success" && <CheckCircle2 className="h-5 w-5 text-success" />}
                  {act.type === "info" && <FileText className="h-5 w-5 text-info" />}
                  {act.type === "warning" && <AlertCircle className="h-5 w-5 text-warning" />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-yec-brown truncate">{act.team}</p>
                  <p className="text-xs text-yec-text-secondary mt-0.5">{act.action}</p>
                </div>
                <span className="text-[11px] font-medium text-yec-text-muted shrink-0">{act.time}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions & Stage Status */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="p-6">
            <h3 className="font-display font-bold text-lg text-yec-brown mb-4">Aksi Cepat Admin</h3>
            <div className="space-y-3">
              <Link href="/admin/teams" className="flex items-center justify-between p-3 rounded-xl border border-[#DDD3C7] hover:bg-yec-amber/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <Download className="h-4 w-4 text-yec-amber" />
                  <span className="text-sm font-medium text-yec-text">Export PIN Akses Tim</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-yec-text-muted group-hover:text-yec-amber transition-colors" />
              </Link>

              <Link href="/admin/evaluations/templates" className="flex items-center justify-between p-3 rounded-xl border border-[#DDD3C7] hover:bg-yec-amber/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <FileText className="h-4 w-4 text-yec-amber" />
                  <span className="text-sm font-medium text-yec-text">Buat Template Penilaian</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-yec-text-muted group-hover:text-yec-amber transition-colors" />
              </Link>

              <Link href="/admin/evaluations/bmc" className="flex items-center justify-between p-3 rounded-xl border border-[#DDD3C7] hover:bg-yec-amber/5 transition-colors group">
                <div className="flex items-center gap-3">
                  <Award className="h-4 w-4 text-yec-amber" />
                  <span className="text-sm font-medium text-yec-text">Penetapan Pass/Fail BMC</span>
                </div>
                <ArrowUpRight className="h-4 w-4 text-yec-text-muted group-hover:text-yec-amber transition-colors" />
              </Link>
            </div>
          </Card>

          <Card className="p-6 bg-yec-forest text-white">
            <h3 className="font-display font-bold text-lg text-white mb-2">Status Tahapan Aktif</h3>
            <p className="text-xs text-white/80 mb-4">Tahapan saat ini diatur terbuka untuk BMC Submission.</p>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span>BMC Submission</span>
                <Badge variant={getBadgeVariant(data.stages.bmcSubmission) as any}>{getStatusLabel(data.stages.bmcSubmission)}</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span>Evaluasi Juri BMC</span>
                <Badge variant={getBadgeVariant(data.stages.bmcEvaluation) as any}>{getStatusLabel(data.stages.bmcEvaluation)}</Badge>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-white/10">
                <span>Submisi Pitching</span>
                <Badge variant={getBadgeVariant(data.stages.pitching) as any}>{getStatusLabel(data.stages.pitching)}</Badge>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>Evaluasi Juri Pitching</span>
                <Badge variant={getBadgeVariant(data.stages.pitchingEvaluation || "CLOSED") as any}>{getStatusLabel(data.stages.pitchingEvaluation || "CLOSED")}</Badge>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
