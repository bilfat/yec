"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table"
import { FormField } from "@/components/ui/FormField"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { fetchApi } from "@/lib/api"
import {
  Award, Trophy, Medal, CheckCircle2,
  Sparkles, Save, Eye, UserCheck, Star, BarChart3, Users
} from "lucide-react"

interface JudgeScoreDetail {
  judgeName: string
  role: string
  totalScore: number
  note: string
  criteriaScores: { name: string; weight: number; score: number }[]
}

interface PitchingTeam {
  id: string
  name: string
  subtheme: string
  pitchingFile: string
  averageScore: number
  rank: number
  judgeDetails: JudgeScoreDetail[]
}

export default function AdminPitchingEvaluationsPage() {
  const [teams, setTeams] = useState<PitchingTeam[]>([])
  const [champ1, setChamp1] = useState("")
  const [champ2, setChamp2] = useState("")
  const [champ3, setChamp3] = useState("")
  const [isLoading, setIsLoading] = useState(true)

  const fetchEvals = async () => {
    setIsLoading(true)
    const res = await fetchApi<PitchingTeam[]>('/results?stage=PITCHING')
    if (res.success && res.data) {
      setTeams(res.data)
      if (res.data.length >= 3) {
        setChamp1(res.data[0].id)
        setChamp2(res.data[1].id)
        setChamp3(res.data[2].id)
      }
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchEvals()
  }, [])

  const [selectedTeamForDetail, setSelectedTeamForDetail] = useState<PitchingTeam | null>(null)
  const [isConfirmOpen, setIsConfirmOpen] = useState(false)
  const [isSavedToast, setIsSavedToast] = useState(false)

  const handleConfirmSave = async () => {
    try {
      const res = await fetchApi('/results/champion', {
        method: 'POST',
        body: JSON.stringify({ champ1, champ2, champ3 })
      })

      if (res.success) {
        setIsConfirmOpen(false)
        setIsSavedToast(true)
        setTimeout(() => setIsSavedToast(false), 3000)
      } else {
        alert(res.error || "Gagal menyimpan penetapan juara.")
      }
    } catch (err) {
      alert("Terjadi kesalahan koneksi.")
    }
  }


  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-yec-amber border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Toast */}
      {isSavedToast && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 rounded-2xl bg-success px-5 py-4 text-white shadow-large">
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">Penetapan Juara Lomba YEC 2026 Berhasil Disimpan!</span>
        </div>
      )}

      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-yec-brown">
          Evaluasi Pitching & Detail Penilaian Juri
        </h2>
        <p className="text-sm text-yec-text-secondary mt-1">
          Pada Tahap Pitching, 1 karya presentasi dinilai oleh SELURUH dewan juri. Tinjau skor detail dan tetapkan Pemenang Juara 1, 2, dan 3.
        </p>
      </div>

      {/* Champion Selector Panel */}
      <Card className="p-6 md:p-8 bg-yec-white border-2 border-yec-amber/40 shadow-large relative overflow-hidden">
        <div className="flex items-center gap-3 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yec-amber text-white shadow-md">
            <Trophy className="h-6 w-6" />
          </div>
          <div>
            <h3 className="font-display font-bold text-2xl text-yec-brown">Penetapan Pemenang Juara 1/2/3</h3>
            <p className="text-xs text-yec-text-secondary">Pilih tim juara berdasarkan rekapitulasi penilaian juri akhir (Evaluasi Seluruh Juri)</p>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3 mb-8">
          {/* Juara 1 */}
          <div className="rounded-2xl border-2 border-yec-amber bg-yec-amber/5 p-5 space-y-3 relative">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display font-bold text-lg text-yec-brown">
                <Trophy className="h-5 w-5 text-yec-amber" /> Juara 1 (Winner)
              </span>
              <Sparkles className="h-5 w-5 text-yec-amber animate-pulse" />
            </div>
            <FormField label="Pilih Tim Juara 1" htmlFor="champ1">
              <Select
                id="champ1"
                value={champ1}
                onChange={(e) => setChamp1(e.target.value)}
                options={teams.map((t) => ({ value: t.id, label: `${t.name} (Skor: ${t.averageScore !== null && t.averageScore !== undefined ? t.averageScore : '-'})` }))}
              />
            </FormField>
          </div>

          {/* Juara 2 */}
          <div className="rounded-2xl border border-[#DDD3C7] bg-yec-paper p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display font-bold text-lg text-yec-brown">
                <Medal className="h-5 w-5 text-yec-text-muted" /> Juara 2 (Runner-Up)
              </span>
            </div>
            <FormField label="Pilih Tim Juara 2" htmlFor="champ2">
              <Select
                id="champ2"
                value={champ2}
                onChange={(e) => setChamp2(e.target.value)}
                options={teams.map((t) => ({ value: t.id, label: `${t.name} (Skor: ${t.averageScore !== null && t.averageScore !== undefined ? t.averageScore : '-'})` }))}
              />
            </FormField>
          </div>

          {/* Juara 3 */}
          <div className="rounded-2xl border border-[#DDD3C7] bg-yec-paper p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 font-display font-bold text-lg text-yec-brown">
                <Award className="h-5 w-5 text-yec-brown/60" /> Juara 3 (3rd Place)
              </span>
            </div>
            <FormField label="Pilih Tim Juara 3" htmlFor="champ3">
              <Select
                id="champ3"
                value={champ3}
                onChange={(e) => setChamp3(e.target.value)}
                options={teams.map((t) => ({ value: t.id, label: `${t.name} (Skor: ${t.averageScore !== null && t.averageScore !== undefined ? t.averageScore : '-'})` }))}
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end">
          <Button variant="primary" size="lg" onClick={() => setIsConfirmOpen(true)} className="gap-2">
            <Save className="h-5 w-5" /> Simpan & Rilis Hasil Juara
          </Button>
        </div>
      </Card>

      {/* Leaderboard Rankings Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-[#DDD3C7] bg-yec-paper flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-yec-brown">Peringkat & Skor Juri Pitching</h3>
          <Badge variant="info">
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> Evaluasi Seluruh Juri (Full-Judge Scope)
          </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Rank</TableHead>
              <TableHead>Nama Tim</TableHead>
              <TableHead>Sub-tema</TableHead>
              <TableHead>File Presentasi</TableHead>
              <TableHead>Penilai Dewan Juri</TableHead>
              <TableHead>Skor Final Juri</TableHead>
              <TableHead className="text-right">Aksi Detail</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teams.map((t) => (
              <TableRow key={t.id}>
                <TableCell>
                  <span className={`inline-flex h-8 w-8 items-center justify-center rounded-full font-bold text-sm ${
                    t.rank === 1 ? "bg-yec-amber text-white" : t.rank === 2 ? "bg-[#C0C0C0] text-yec-brown" : t.rank === 3 ? "bg-[#CD7F32] text-white" : "bg-yec-paper text-yec-text-muted"
                  }`}>
                    #{t.rank}
                  </span>
                </TableCell>
                <TableCell className="font-semibold text-yec-brown">{t.name}</TableCell>
                <TableCell className="text-sm text-yec-text-secondary">{t.subtheme}</TableCell>
                <TableCell className="text-xs font-mono text-yec-amber font-semibold">{t.pitchingFile}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-yec-brown bg-yec-amber/10 border border-yec-amber/20 px-2.5 py-1 rounded-lg">
                    <UserCheck className="h-3.5 w-3.5 text-yec-amber" /> Semua Juri ({t.judgeDetails.length} Juri)
                  </span>
                </TableCell>
                <TableCell className="font-display font-bold text-xl text-yec-brown">
                  {t.averageScore !== null && t.averageScore !== undefined ? t.averageScore.toFixed(1) : "-"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedTeamForDetail(t)}
                    className="gap-1.5 text-xs text-yec-brown border-[#DDD3C7] hover:bg-yec-amber/10"
                  >
                    <Eye className="h-3.5 w-3.5 text-yec-amber" /> Detail Nilai Juri
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Modal Detail Nilai Juri Individual & Breakdown Per Kriteria */}
      {selectedTeamForDetail && (
        <Modal
          isOpen={selectedTeamForDetail !== null}
          onClose={() => setSelectedTeamForDetail(null)}
          title={`Detail Penilaian Dewan Juri — ${selectedTeamForDetail.name}`}
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Summary */}
            <div className="p-5 rounded-2xl bg-yec-paper border border-[#DDD3C7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-yec-text-muted">Peringkat & Sub-tema</span>
                <h4 className="font-display font-bold text-xl text-yec-brown">{selectedTeamForDetail.name}</h4>
                <p className="text-xs text-yec-text-secondary mt-0.5">{selectedTeamForDetail.subtheme} · File: {selectedTeamForDetail.pitchingFile}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-yec-text-muted uppercase block">Skor Rata-Rata Final</span>
                <span className="font-display text-3xl font-bold text-yec-amber">
                  {selectedTeamForDetail.averageScore !== null && selectedTeamForDetail.averageScore !== undefined
                    ? Number(selectedTeamForDetail.averageScore).toFixed(1)
                    : "-"}
                </span>
              </div>
            </div>

            {/* List Detail Per Juri Penilai */}
            <div className="space-y-4">
              <h5 className="font-display font-bold text-base text-yec-brown flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-yec-amber" /> Rincian Nilai per Dewan Juri (Evaluasi Seluruh Juri):
              </h5>

              {selectedTeamForDetail.judgeDetails.map((jd, idx) => (
                <div key={idx} className="rounded-2xl border border-[#DDD3C7] bg-yec-white p-5 space-y-4 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#DDD3C7]">
                    <div>
                      <span className="font-bold text-base text-yec-brown">{jd.judgeName}</span>
                      <span className="ml-2 text-xs font-semibold text-yec-amber bg-yec-amber/10 px-2 py-0.5 rounded-md">
                        {jd.role}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 font-display font-bold text-lg text-yec-brown">
                      <Star className="h-4 w-4 text-yec-amber fill-yec-amber" /> {jd.totalScore} / 100
                    </div>
                  </div>

                  {/* Breakdown Per Kriteria */}
                  <div className="space-y-2">
                    <p className="text-xs font-bold uppercase tracking-wider text-yec-text-muted">Skor Per Kriteria:</p>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {jd.criteriaScores.map((cs, cIdx) => (
                        <div key={cIdx} className="p-3 rounded-xl bg-yec-paper border border-[#DDD3C7]/60">
                          <p className="text-xs font-semibold text-yec-text-secondary truncate">{cs.name}</p>
                          <div className="flex justify-between items-baseline mt-1">
                            <span className="text-[10px] text-yec-text-muted">Bobot {cs.weight}%</span>
                            <span className="font-bold text-sm text-yec-brown">{cs.score}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Catatan / Feedback Juri */}
                  {jd.note && (
                    <div className="p-3 rounded-xl bg-yec-amber/5 border border-yec-amber/20 text-xs">
                      <span className="font-bold text-yec-brown block mb-0.5">Catatan Evaluasi & Feedback Juri:</span>
                      <p className="text-yec-text-secondary italic">&ldquo;{jd.note}&rdquo;</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#DDD3C7]">
              <Button onClick={() => setSelectedTeamForDetail(null)}>Tutup Detail</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Rilis Pengumuman Juara?"
        message="Hasil penetapan Juara 1, 2, dan 3 akan langsung dipublikasikan dan ditampilkan secara otomatis pada Portal Peserta."
        confirmText="Rilis Sekarang"
        variant="primary"
        onConfirm={handleConfirmSave}
        onCancel={() => setIsConfirmOpen(false)}
      />
    </div>
  )
}
