"use client"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Image from "next/image"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { FormField } from "@/components/ui/FormField"
import { Card } from "@/components/ui/Card"
import { Badge } from "@/components/ui/Badge"
import { FileDropzone } from "@/components/ui/FileDropzone"
import {
  LogIn, Target, UploadCloud, Users, Trophy,
  CheckCircle2, Clock, LogOut, FileText, AlertCircle
} from "lucide-react"

// ── Types ────────────────────────────────────────────────────────────────────
type PortalState = "READY" | "SUBMITTED" | "WAITING_RESULT" | "PASSED" | "FAILED" | "PITCHING_SUBMITTED"

interface SubthemeOption {
  id: string
  name: string
  description?: string
}

interface PortalData {
  team: {
    id: string
    name: string
    subtheme_id?: string
    subtheme_name?: string
  }
  state: PortalState
  settings: {
    competition_name: string
    announcements: string | null
    participant_support_phone: string
    bmc_submission_open: boolean
    bmc_evaluation_open: boolean
    pitching_submission_open: boolean
    pitching_evaluation_open: boolean
  }
  submissions: {
    bmc: {
      id: string
      original_filename: string
      file_size: number
      created_at: string
      subtheme_id?: string
    } | null
    pitching: {
      id: string
      original_filename: string
      file_size: number
      created_at: string
    } | null
  }
  results: {
    bmc: {
      final_score: number | null
      result_status: string | null
      locked_at: string | null
    } | null
    pitching: {
      final_score: number | null
      result_status: string | null
      locked_at: string | null
    } | null
  }
  activeSubthemes: SubthemeOption[]
}

// ── Helper format file size ──────────────────────────────────────────────────
function formatBytes(bytes: number) {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

// ── Announcement Banner ──────────────────────────────────────────────────────
function AnnouncementBanner({ state, announcement }: { state: PortalState; announcement?: string | null }) {
  return (
    <div className="space-y-4">
      {announcement && (
        <div className="rounded-2xl border border-yec-amber/30 bg-yec-amber/5 p-5 flex items-start gap-4">
          <span className="text-xl mt-0.5">📢</span>
          <div>
            <h4 className="font-bold text-yec-brown mb-1">Pengumuman Panitia</h4>
            <p className="text-sm text-yec-text-secondary leading-relaxed">{announcement}</p>
          </div>
        </div>
      )}

      {state === "WAITING_RESULT" && (
        <div className="rounded-2xl border border-info/30 bg-info/5 p-5 flex items-start gap-4">
          <Clock className="h-5 w-5 text-info mt-0.5 shrink-0" />
          <div>
            <h4 className="font-semibold text-info mb-1">Karya Sedang Dievaluasi</h4>
            <p className="text-sm text-info/80">Karyamu sudah masuk! Tim juri sedang menilai. Pengumuman akan dikirimkan segera.</p>
          </div>
        </div>
      )}

      {(state === "PASSED" || state === "PITCHING_SUBMITTED") && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative overflow-hidden rounded-2xl border-2 border-success bg-success/5 p-6"
        >
          <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-success/10" />
          <div className="absolute -right-2 -bottom-8 h-32 w-32 rounded-full bg-success/5" />
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-success/15 text-2xl">🎉</div>
            <div>
              <h4 className="text-lg font-bold text-success mb-1">Selamat! Tim Kamu Lolos ke Babak Pitching!</h4>
              <p className="text-sm text-success/80 leading-relaxed">
                Ide bisnismu dinilai sangat potensial oleh dewan juri. Sekarang persiapkan presentasimu dengan sebaik-baiknya dan unggah file pitching di bawah ini.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {state === "FAILED" && (
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="rounded-2xl border border-[#DDD3C7] bg-yec-paper p-6 flex items-start gap-4"
        >
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-yec-text-muted/10 text-2xl">💪</div>
          <div>
            <h4 className="text-lg font-bold text-yec-brown mb-1">Tetap Semangat!</h4>
            <p className="text-sm text-yec-text-secondary leading-relaxed">
              Perjalanan timmu luar biasa. Kali ini belum berhasil melaju ke babak berikutnya, namun jangan patah semangat. Setiap pengalaman adalah bahan bakar untuk tumbuh lebih baik. Terima kasih sudah berpartisipasi di Young Entrepreneur Camp!
            </p>
          </div>
        </motion.div>
      )}
    </div>
  )
}

// ── Submit BMC Section ───────────────────────────────────────────────────────
function BmcSection({
  portalData,
  onUploadSuccess,
}: {
  portalData: PortalData
  onUploadSuccess?: () => void
}) {
  const bmcSub = portalData.submissions.bmc
  const isSubmitted = !!bmcSub
  const [file, setFile] = useState<File | null>(null)
  const [subthemeId, setSubthemeId] = useState(portalData.team.subtheme_id || "")
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const subthemeOptions = [
    { value: "", label: "Pilih Sub-tema Bisnis Anda..." },
    ...portalData.activeSubthemes.map((s) => ({ value: s.id, label: s.name })),
  ]

  const handleUpload = async () => {
    if (!file) {
      setError("Silakan pilih file PDF terlebih dahulu.")
      return
    }
    if (!subthemeId) {
      setError("Silakan pilih sub-tema bisnis.")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("stage", "BMC")
      formData.append("subtheme_id", subthemeId)

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        setFile(null)
        onUploadSuccess?.()
      } else {
        setError(data.error || "Gagal mengunggah file.")
      }
    } catch {
      setError("Terjadi kesalahan jaringan.")
    } finally {
      setIsUploading(false)
    }
  }

  const isOpen = portalData.settings.bmc_submission_open

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-yec-brown">Business Model Canvas (BMC)</h3>
          <p className="text-sm text-yec-text-secondary mt-1">Unggah file proposal BMC dalam format PDF, maksimal 10 MB.</p>
        </div>
        <Badge variant={isSubmitted ? "success" : isOpen ? "warning" : "danger"}>
          {isSubmitted ? "SUBMITTED" : isOpen ? "READY" : "CLOSED"}
        </Badge>
      </div>

      {!isSubmitted ? (
        <div className="space-y-5">
          {!isOpen && (
            <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 text-sm text-danger flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Pengumpulan BMC saat ini sedang ditutup oleh panitia.</span>
            </div>
          )}

          <FormField label="Pilih Sub-tema Bisnis" htmlFor="subtheme">
            <Select
              id="subtheme"
              value={subthemeId}
              onChange={(e) => setSubthemeId(e.target.value)}
              options={subthemeOptions}
              disabled={!isOpen}
            />
          </FormField>

          {subthemeId && (
            <div className="p-3.5 rounded-xl bg-yec-amber/10 border border-yec-amber/20 text-xs text-yec-brown flex items-start gap-2.5">
              <span className="text-base mt-0.5">💡</span>
              <div>
                <span className="font-bold block text-yec-brown mb-0.5">Penjelasan Sub-tema:</span>
                <p className="text-yec-text-secondary leading-relaxed">
                  {portalData.activeSubthemes.find((s) => s.id === subthemeId)?.description || "Inovasi sub-tema bisnis pemuda Young Entrepreneur Camp 2026."}
                </p>
              </div>
            </div>
          )}

          <FileDropzone onFileSelect={setFile} accept="application/pdf" maxSizeMB={10} />

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <Button
            className="w-full h-12"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!isOpen || !file}
          >
            <UploadCloud className="mr-2 h-4 w-4" /> Submit Karya BMC
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-success/30 bg-success/5 p-4">
            <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
            <div className="flex-1">
              <p className="font-semibold text-success">Karya BMC Berhasil Disubmit</p>
              <p className="text-xs text-success/80 mt-0.5">
                Sub-tema: {portalData.team.subtheme_name || "Telah dipilih"}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-yec-paper border border-[#DDD3C7] p-4 text-xs">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-yec-amber shrink-0" />
              <div>
                <span className="font-semibold text-yec-brown block">{bmcSub.original_filename}</span>
                <span className="text-yec-text-muted">{formatBytes(bmcSub.file_size)} • Diunggah {new Date(bmcSub.created_at).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Submit Pitching Section ──────────────────────────────────────────────────
function PitchingSection({
  portalData,
  onUploadSuccess,
}: {
  portalData: PortalData
  onUploadSuccess?: () => void
}) {
  const pitchingSub = portalData.submissions.pitching
  const isSubmitted = !!pitchingSub
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState("")

  const isOpen = portalData.settings.pitching_submission_open

  const handleUpload = async () => {
    if (!file) {
      setError("Silakan pilih file presentasi terlebih dahulu.")
      return
    }

    setIsUploading(true)
    setError("")

    try {
      const formData = new FormData()
      formData.append("file", file)
      formData.append("stage", "PITCHING")

      const res = await fetch("/api/submissions", {
        method: "POST",
        body: formData,
      })
      const data = await res.json()

      if (data.success) {
        setFile(null)
        onUploadSuccess?.()
      } else {
        setError(data.error || "Gagal mengunggah file.")
      }
    } catch {
      setError("Terjadi kesalahan jaringan.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="p-6">
      <div className="flex items-start justify-between mb-6">
        <div>
          <h3 className="font-display text-2xl font-bold text-yec-brown">Presentasi Pitching</h3>
          <p className="text-sm text-yec-text-secondary mt-1">Unggah file presentasi (PDF / PPT / PPTX), maksimal 10 MB.</p>
        </div>
        <Badge variant={isSubmitted ? "success" : isOpen ? "warning" : "danger"}>
          {isSubmitted ? "SUBMITTED" : isOpen ? "READY" : "CLOSED"}
        </Badge>
      </div>

      {!isSubmitted ? (
        <div className="space-y-4">
          {!isOpen && (
            <div className="p-4 rounded-xl bg-danger/5 border border-danger/20 text-sm text-danger flex items-center gap-3">
              <AlertCircle className="h-5 w-5 shrink-0" />
              <span>Pengumpulan file Pitching saat ini belum dibuka oleh panitia.</span>
            </div>
          )}

          <FileDropzone
            onFileSelect={setFile}
            accept="application/pdf,application/vnd.ms-powerpoint,application/vnd.openxmlformats-officedocument.presentationml.presentation"
            maxSizeMB={10}
          />

          {error && <p className="text-sm font-medium text-danger">{error}</p>}

          <Button
            className="w-full h-12"
            onClick={handleUpload}
            isLoading={isUploading}
            disabled={!isOpen || !file}
          >
            <UploadCloud className="mr-2 h-4 w-4" /> Submit Presentasi Pitching
          </Button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-xl border border-success/30 bg-success/5 p-4">
            <CheckCircle2 className="h-6 w-6 text-success shrink-0" />
            <div>
              <p className="font-semibold text-success">File Pitching Berhasil Disubmit</p>
              <p className="text-xs text-success/80 mt-0.5">Sudah tersimpan di sistem.</p>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-yec-paper border border-[#DDD3C7] p-4 text-xs">
            <div className="flex items-center gap-3">
              <FileText className="h-5 w-5 text-yec-amber shrink-0" />
              <div>
                <span className="font-semibold text-yec-brown block">{pitchingSub.original_filename}</span>
                <span className="text-yec-text-muted">{formatBytes(pitchingSub.file_size)} • Diunggah {new Date(pitchingSub.created_at).toLocaleString('id-ID')}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </Card>
  )
}

// ── Score Detail Card ────────────────────────────────────────────────────────
function ScoreDetailCard({ portalData }: { portalData: PortalData }) {
  const result = portalData.results.bmc
  if (!result || result.final_score === null) return null

  const isPassed = result.result_status === "PASSED"

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between mb-5 pb-4 border-b border-[#DDD3C7]">
        <div>
          <h3 className="font-display text-xl font-bold text-yec-brown">Hasil Evaluasi & Skor Resmi</h3>
          <p className="text-xs text-yec-text-secondary mt-0.5">Penilaian resmi dari dewan juri YEC 2026</p>
        </div>
        <div className="text-right">
          <span className="text-[10px] font-bold uppercase tracking-wider text-yec-text-muted block">Skor Akhir BMC</span>
          <span className={`font-display text-2xl font-bold ${isPassed ? "text-success" : "text-yec-brown"}`}>
            {result.final_score} <span className="text-xs font-normal text-yec-text-muted">/ 100</span>
          </span>
        </div>
      </div>

      <div className="p-4 rounded-xl bg-yec-amber/5 border border-yec-amber/20 text-xs">
        <span className="font-bold text-yec-brown block mb-1">Status Kelulusan Tahap BMC:</span>
        <Badge variant={isPassed ? "success" : "danger"}>
          {isPassed ? "LOLOS KE PITCHING" : "TIDAK LOLOS"}
        </Badge>
      </div>
    </Card>
  )
}

// ── Portal Dashboard ─────────────────────────────────────────────────────────
function PortalDashboard({
  portalData,
  displayState,
  onLogout,
  onRefresh,
}: {
  portalData: PortalData
  displayState: PortalState
  onLogout: () => void
  onRefresh: () => void
}) {
  const supportPhone = portalData.settings.participant_support_phone || "6281219843922"

  return (
    <div className="container mx-auto px-4 pb-24 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* Header Tim */}
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl bg-yec-white border border-[#DDD3C7] px-6 py-5 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-yec-text-muted mb-1">Tim Terverifikasi</p>
            <h2 className="font-display text-2xl font-bold text-yec-brown">{portalData.team.name}</h2>
            {portalData.team.subtheme_name && (
              <p className="text-xs text-yec-amber font-medium mt-0.5">Sub-tema: {portalData.team.subtheme_name}</p>
            )}
          </div>
          <Button variant="outline" size="sm" onClick={onLogout} className="gap-2 self-start sm:self-center text-danger border-danger/30 hover:bg-danger/5">
            <LogOut className="h-4 w-4" /> Keluar / Ganti Tim
          </Button>
        </div>

        <div className="grid gap-6 lg:grid-cols-12">
          <div className="lg:col-span-8 space-y-6">
            {/* Pengumuman */}
            <AnnouncementBanner state={displayState} announcement={portalData.settings.announcements} />

            {/* Skor & Breakdown Nilai jika ada */}
            <ScoreDetailCard portalData={portalData} />

            {/* Form Upload BMC */}
            {displayState !== "FAILED" && (
              <BmcSection portalData={portalData} onUploadSuccess={onRefresh} />
            )}

            {/* Form Upload Pitching */}
            {(displayState === "PASSED" || displayState === "PITCHING_SUBMITTED") && (
              <PitchingSection portalData={portalData} onUploadSuccess={onRefresh} />
            )}
          </div>

          {/* Sidebar Status & Support */}
          <div className="lg:col-span-4 space-y-6">
            <div className="rounded-[20px] bg-yec-white border border-[#DDD3C7] p-6">
              <h3 className="mb-4 font-display text-lg font-bold text-yec-brown">Progres Kompetisi</h3>
              <div className="relative">
                <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-[#DDD3C7]"></div>
                {[
                  { id: "BMC", label: "Business Model Canvas", done: displayState !== "READY", active: displayState === "READY" || displayState === "SUBMITTED" },
                  { id: "EVAL", label: "Evaluasi & Seleksi Juri", done: displayState === "PASSED" || displayState === "FAILED" || displayState === "PITCHING_SUBMITTED", active: displayState === "WAITING_RESULT" },
                  { id: "PITCH", label: "Pitching Session", done: displayState === "PITCHING_SUBMITTED", active: displayState === "PASSED" },
                  { id: "FINAL", label: "Pengumuman Final", done: false, active: false },
                ].map((step) => (
                  <div key={step.id} className="relative z-10 flex items-center gap-4 mb-5 last:mb-0">
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-yec-white ${
                      step.done ? "border-yec-amber bg-yec-amber text-white" : step.active ? "border-yec-amber" : "border-[#DDD3C7]"
                    }`}>
                      {step.done
                        ? <CheckCircle2 className="h-4 w-4 text-white" />
                        : <div className={`h-2.5 w-2.5 rounded-full ${step.active ? "bg-yec-amber" : "bg-[#DDD3C7]"}`} />
                      }
                    </div>
                    <p className={`text-sm font-medium ${step.active || step.done ? "text-yec-text" : "text-yec-text-muted"}`}>{step.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[20px] border border-[#DDD3C7] bg-yec-paper p-6">
              <h3 className="mb-2 font-display text-base font-bold text-yec-brown">Bantuan & Helpdesk</h3>
              <p className="text-sm text-yec-text-secondary mb-4">Ada kendala dalam mengunggah karya atau membutuhkan bantuan?</p>
              <a
                href={`https://wa.me/${supportPhone}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#25D366] px-4 text-sm font-semibold text-white hover:bg-[#20bd5a] transition-colors"
              >
                Hubungi Support (WhatsApp)
              </a>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ── Login Form ────────────────────────────────────────────────────────────────
function LoginSection({ onLoginSuccess }: { onLoginSuccess: () => void }) {
  const [teams, setTeams] = useState<{ id: string; name: string }[]>([])
  const [selectedTeamId, setSelectedTeamId] = useState("")
  const [pin, setPin] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isFetchingTeams, setIsFetchingTeams] = useState(true)

  useEffect(() => {
    const loadTeams = async () => {
      try {
        const res = await fetch('/api/teams')
        const data = await res.json()
        if (data.data) {
          setTeams(data.data)
        }
      } catch (err) {
        console.error('Failed to load teams:', err)
      } finally {
        setIsFetchingTeams(false)
      }
    }
    loadTeams()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedTeamId || !pin.trim()) {
      setError("Pilih nama tim dan masukkan PIN 6 digit.")
      return
    }
    setError("")
    setIsLoading(true)

    try {
      const res = await fetch('/api/participant/access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ teamId: selectedTeamId, pin })
      })
      const data = await res.json()

      if (data.success) {
        onLoginSuccess()
      } else {
        setError(data.error || "Login gagal. Periksa PIN tim kamu.")
      }
    } catch {
      setError("Terjadi kesalahan koneksi.")
    } finally {
      setIsLoading(false)
    }
  }

  const teamOptions = [
    { value: "", label: isFetchingTeams ? "Memuat daftar tim..." : "Pilih nama tim kamu..." },
    ...teams.map((t) => ({ value: t.id, label: t.name }))
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="container mx-auto px-4 pb-24 md:px-6"
    >
      <div className="grid gap-12 lg:grid-cols-2 lg:items-start lg:gap-20">
        <div>
          <p className="text-yec-text-secondary text-base md:text-lg mb-8 leading-relaxed">
            Portal Tim adalah pusat komando perjalanan kompetisimu. Di sini kamu bisa:
          </p>
          <div className="space-y-4">
            {[
              { icon: <UploadCloud className="h-5 w-5 text-yec-amber" />, text: "Submit karya Business Model Canvas (BMC)" },
              { icon: <Target className="h-5 w-5 text-yec-amber" />, text: "Pantau tahapan kompetisi secara real-time" },
              { icon: <Trophy className="h-5 w-5 text-yec-amber" />, text: "Lihat pengumuman hasil evaluasi & pitching" },
              { icon: <Users className="h-5 w-5 text-yec-amber" />, text: "Unggah presentasi jika tim lolos ke pitching" },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-4 rounded-xl bg-yec-white border border-[#DDD3C7] px-5 py-4 shadow-sm">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-yec-amber/10">{f.icon}</div>
                <p className="text-sm font-medium text-yec-text">{f.text}</p>
              </div>
            ))}
          </div>
        </div>

        <Card className="p-8 rounded-[28px] shadow-large">
          <div className="flex items-center gap-3 mb-8">
            <div className="relative h-12 w-12 overflow-hidden rounded-full shrink-0">
              <Image src="/logo-yec.jpeg" alt="YEC Logo" fill className="object-cover" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-yec-brown">Masuk ke Portal Tim</h2>
              <p className="text-xs text-yec-text-muted">Gunakan nama tim & PIN dari panitia</p>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Nama Tim" htmlFor="teamSelect">
              <Select
                id="teamSelect"
                value={selectedTeamId}
                onChange={(e) => setSelectedTeamId(e.target.value)}
                options={teamOptions}
                disabled={isFetchingTeams}
              />
            </FormField>

            <FormField label="PIN Akses (6 Digit)" htmlFor="pin" error={error}>
              <Input
                id="pin"
                type="password"
                placeholder="••••••"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                required
                className="font-mono tracking-[0.5em] text-center text-lg"
              />
            </FormField>

            <Button type="submit" className="w-full h-12 gap-2" isLoading={isLoading}>
              <LogIn className="h-4 w-4" /> Masuk ke Dashboard
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-yec-text-muted">
            Lupa atau belum menerima PIN?{" "}
            <a href="https://wa.me/6281219843922" target="_blank" rel="noreferrer" className="text-yec-amber font-semibold hover:underline">
              Hubungi panitia
            </a>
          </p>
        </Card>
      </div>
    </motion.div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function PortalPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [portalData, setPortalData] = useState<PortalData | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchPortalState = async () => {
    try {
      const res = await fetch('/api/participant/portal')
      if (res.ok) {
        const result = await res.json()
        if (result.success && result.data) {
          setPortalData(result.data)
          setIsLoggedIn(true)
        } else {
          setIsLoggedIn(false)
          setPortalData(null)
        }
      } else {
        setIsLoggedIn(false)
        setPortalData(null)
      }
    } catch {
      setIsLoggedIn(false)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    const init = async () => {
      await fetchPortalState()
    }
    init()
  }, [])

  const handleLogout = async () => {
    await fetch('/api/participant/logout', { method: 'POST' })
    setIsLoggedIn(false)
    setPortalData(null)
  }

  const activeState: PortalState = portalData?.state || "READY"


  return (
    <div className="min-h-screen bg-yec-paper">
      {/* Header Page */}
      <div className="bg-yec-white border-b border-[#DDD3C7] pt-28 pb-10 relative overflow-hidden">
        <motion.div
          animate={{ y: [0, -6, 0], rotate: [0, -2, 0] }}
          transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-10 -right-10 w-64 md:w-80 pointer-events-none z-10 mix-blend-multiply opacity-40 hidden sm:block"
        >
          <Image
            src="/decor/tree-leaves.jpg"
            alt="Daun Pohon"
            width={350}
            height={350}
            className="w-full h-auto object-contain"
          />
        </motion.div>

        <div className="container mx-auto px-4 md:px-6 relative z-10">
          <span className="text-2xl mb-2 inline-block">⛺ 🌲</span>
          <h1 className="font-display text-3xl font-bold text-yec-brown md:text-4xl mb-2">Portal Tim</h1>
          <p className="text-yec-text-secondary max-w-2xl leading-relaxed">
            {isLoggedIn && portalData
              ? `Kamu masuk sebagai tim "${portalData.team.name}". Pantau progres dan submit karyamu di bawah ini.`
              : "Pilih tim dan masukkan PIN aksesmu untuk melihat status kompetisi dan mengunggah karya."}
          </p>
        </div>
      </div>

      {/* Content Area */}


      {/* Main Content */}
      <div className="pt-10">
        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-yec-amber border-t-transparent" />
          </div>
        ) : (
          <AnimatePresence mode="wait">
            {isLoggedIn && portalData ? (
              <motion.div key="dashboard" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <PortalDashboard
                  portalData={portalData}
                  displayState={activeState}
                  onLogout={handleLogout}
                  onRefresh={fetchPortalState}
                />
              </motion.div>
            ) : (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
                <LoginSection onLoginSuccess={fetchPortalState} />
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </div>
  )
}
