"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { fetchApi } from "@/lib/api"
import {
  FileCheck, Award, Eye, CheckCircle2,
  Clock, Check, X, UserCheck, Star, BarChart3
} from "lucide-react"

interface BmcJudgeDetail {
  judgeName: string
  role: string
  totalScore: number
  note: string
  criteriaScores: { name: string; weight: number; score: number }[]
}

interface BmcEvalTeam {
  id: string
  name: string
  subtheme: string
  pdfName: string
  submittedAt: string
  judgeCount: number
  completedJudgeCount: number
  averageScore: number | null
  status: "PENDING" | "COMPLETED"
  resultStatus: "UNDECIDED" | "PASSED" | "FAILED"
  judgeDetails: BmcJudgeDetail[]
}

export default function AdminBmcEvaluationsPage() {
  const [evalList, setEvalList] = useState<BmcEvalTeam[]>([])
  const [selectedTeam, setSelectedTeam] = useState<BmcEvalTeam | null>(null)
  const [decisionType, setDecisionType] = useState<"PASSED" | "FAILED" | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  const fetchEvals = async () => {
    setIsLoading(true)
    const res = await fetchApi<BmcEvalTeam[]>('/results?stage=BMC')
    if (res.success && res.data) {
      setEvalList(res.data)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchEvals()
  }, [])

  const handleOpenDecision = (team: BmcEvalTeam, type: "PASSED" | "FAILED") => {
    setSelectedTeam(team)
    setDecisionType(type)
  }

  const handleConfirmDecision = async () => {
    if (selectedTeam && decisionType) {
      const res = await fetchApi(`/results/${selectedTeam.id}`, {
        method: 'PUT',
        body: JSON.stringify({ resultStatus: decisionType })
      })

      if (res.success) {
        setEvalList(
          evalList.map((t) =>
            t.id === selectedTeam.id ? { ...t, resultStatus: decisionType } : t
          )
        )
      } else {
        alert(res.error || "Gagal mengubah status kelulusan.")
      }
      setSelectedTeam(null)
      setDecisionType(null)
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
      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-yec-brown">
          Penilaian & Hasil Seleksi BMC
        </h2>
        <p className="text-sm text-yec-text-secondary mt-1">
          Pantau progres penilaian juri multi-evaluator, rincian skor per kriteria, dan tetapkan kelulusan tim ke tahap Pitching.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-yec-amber/10 text-yec-amber font-bold">
            <FileCheck className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-yec-text-muted uppercase">Total Terkumpul</span>
            <div className="font-display text-2xl font-bold text-yec-brown">4 Karya</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/10 text-success font-bold">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-yec-text-muted uppercase">Evaluasi Selesai</span>
            <div className="font-display text-2xl font-bold text-yec-brown">3 Tim</div>
          </div>
        </Card>
        <Card className="p-5 flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-warning/10 text-warning font-bold">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-yec-text-muted uppercase">Menunggu Juri</span>
            <div className="font-display text-2xl font-bold text-yec-brown">1 Tim</div>
          </div>
        </Card>
      </div>

      {/* Evaluations Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-[#DDD3C7] bg-yec-paper flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-yec-brown">Daftar Karya BMC & Status Penilaian Juri</h3>
          <Badge variant="info">
            <BarChart3 className="h-3.5 w-3.5 mr-1" /> Evaluasi Multi-Juri
          </Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Tim & Sub-tema</TableHead>
              <TableHead>Berkas BMC</TableHead>
              <TableHead>Progres Juri</TableHead>
              <TableHead>Rata-rata Skor</TableHead>
              <TableHead>Status Hasil</TableHead>
              <TableHead className="text-right">Aksi & Detail Nilai</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {evalList.map((t) => (
              <TableRow key={t.id}>
                <TableCell className="font-semibold text-yec-brown">
                  {t.name}
                  <div className="text-xs font-normal text-yec-text-muted">{t.subtheme}</div>
                </TableCell>
                <TableCell className="text-xs font-mono text-yec-amber font-semibold">
                  {t.pdfName}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-yec-brown">
                      {t.completedJudgeCount}/{t.judgeCount}
                    </span>
                    {t.status === "COMPLETED" ? (
                      <Badge variant="success">LENGKAP</Badge>
                    ) : (
                      <Badge variant="warning">PROSES</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="font-display font-bold text-lg text-yec-brown">
                  {t.averageScore ? t.averageScore.toFixed(1) : "-"}
                </TableCell>
                <TableCell>
                  {t.resultStatus === "PASSED" && <Badge variant="success">PASSED / LOLOS</Badge>}
                  {t.resultStatus === "FAILED" && <Badge variant="danger">FAILED</Badge>}
                  {t.resultStatus === "UNDECIDED" && <Badge variant="default">BELUM DIPUTUSKAN</Badge>}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setSelectedTeam(t); setIsDetailModalOpen(true) }}
                      className="h-8 px-2.5 text-xs gap-1.5 text-yec-brown border-[#DDD3C7] hover:bg-yec-amber/10"
                    >
                      <Eye className="h-3.5 w-3.5 text-yec-amber" /> Detail Nilai
                    </Button>
                    {t.resultStatus === "UNDECIDED" && (
                      <>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenDecision(t, "PASSED")}
                          disabled={t.status !== "COMPLETED"}
                          className="h-8 px-2.5 text-xs gap-1 bg-success/15 text-success hover:bg-success/25"
                        >
                          <Check className="h-3.5 w-3.5" /> Pass
                        </Button>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => handleOpenDecision(t, "FAILED")}
                          disabled={t.status !== "COMPLETED"}
                          className="h-8 px-2.5 text-xs gap-1 bg-danger/15 text-danger hover:bg-danger/25"
                        >
                          <X className="h-3.5 w-3.5" /> Fail
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      {/* Detail Score Modal */}
      {selectedTeam && isDetailModalOpen && (
        <Modal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Detail Rincian Penilaian Juri — ${selectedTeam.name}`}
        >
          <div className="space-y-6 max-h-[75vh] overflow-y-auto pr-1">
            {/* Header Summary */}
            <div className="p-5 rounded-2xl bg-yec-paper border border-[#DDD3C7] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-yec-text-muted">Sub-tema & Berkas PDF</span>
                <h4 className="font-display font-bold text-xl text-yec-brown">{selectedTeam.name}</h4>
                <p className="text-xs text-yec-text-secondary mt-0.5">{selectedTeam.subtheme} · File: {selectedTeam.pdfName}</p>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-yec-text-muted uppercase block">Skor Rata-Rata BMC</span>
                <span className="font-display text-3xl font-bold text-yec-amber">{selectedTeam.averageScore?.toFixed(1) || "-"}</span>
              </div>
            </div>

            {/* List Detail Per Juri Penilai */}
            <div className="space-y-4">
              <h5 className="font-display font-bold text-base text-yec-brown flex items-center gap-2">
                <UserCheck className="h-4 w-4 text-yec-amber" /> Rincian Nilai per Dewan Juri & Kriteria:
              </h5>

              {selectedTeam.judgeDetails.map((jd, idx) => (
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
                      <span className="font-bold text-yec-brown block mb-0.5">Catatan Evaluasi Juri:</span>
                      <p className="text-yec-text-secondary italic">&ldquo;{jd.note}&rdquo;</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex justify-end pt-4 border-t border-[#DDD3C7]">
              <Button onClick={() => setIsDetailModalOpen(false)}>Tutup Detail</Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Pass / Fail Decision Dialog */}
      {selectedTeam && decisionType && (
        <ConfirmDialog
          isOpen={decisionType !== null}
          title={decisionType === "PASSED" ? "Loloskan Tim ke Pitching?" : "Tetapkan Status Tidak Lolos?"}
          message={`Apakah Anda yakin menetapkan status ${decisionType} untuk tim "${selectedTeam.name}"? Keputusan ini akan langsung diperbarui pada Portal Peserta.`}
          confirmText={decisionType === "PASSED" ? "Loloskan Tim" : "Tetapkan Tidak Lolos"}
          variant={decisionType === "PASSED" ? "primary" : "danger"}
          onConfirm={handleConfirmDecision}
          onCancel={() => { setSelectedTeam(null); setDecisionType(null) }}
        />
      )}
    </div>
  )
}
