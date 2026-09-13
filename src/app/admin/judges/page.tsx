"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { Modal } from "@/components/ui/Modal"
import { FormField } from "@/components/ui/FormField"
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/Table"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { fetchApi } from "@/lib/api"
import {
  UserCheck, Plus, Trash2, UserPlus,
  FileCheck, Award, X, Edit2, ShieldCheck, CheckCircle2,
  Users, Info
} from "lucide-react"

interface JudgeAccount {
  id: string
  name: string
  username: string
  active: boolean
}

interface TeamAssignment {
  id: string
  teamName: string
  subtheme: string
  fileName: string
  assignments: { assignmentId: string, judgeId: string }[]
}

export default function AdminJudgesPage() {
  const [activeTab, setActiveTab] = useState<"BMC" | "PITCHING">("BMC")
  const [judges, setJudges] = useState<JudgeAccount[]>([])
  const [bmcTeams, setBmcTeams] = useState<TeamAssignment[]>([])
  const [pitchingTeams, setPitchingTeams] = useState<TeamAssignment[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Manage Judge Accounts Modal State
  const [isManageJudgesOpen, setIsManageJudgesOpen] = useState(false)
  const [isAddJudgeModalOpen, setIsAddJudgeModalOpen] = useState(false)
  const [editingJudgeId, setEditingJudgeId] = useState<string | null>(null)
  const [formName, setFormName] = useState("")
  const [formUsername, setFormUsername] = useState("")
  const [formPassword, setFormPassword] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Quick Assign Modal State (BMC Only)
  const [assigningTeam, setAssigningTeam] = useState<TeamAssignment | null>(null)
  const [selectedJudgeToAssign, setSelectedJudgeToAssign] = useState("")
  const [isAssigning, setIsAssigning] = useState(false)

  // Delete Judge State
  const [deleteJudgeId, setDeleteJudgeId] = useState<string | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fetchData = async () => {
    setIsLoading(true)
    const [resJudges, resTeams, resAssignments, resBmcResults] = await Promise.all([
      fetchApi<any[]>('/judges'),
      fetchApi<any[]>('/teams'),
      fetchApi<any[]>('/assignments'),
      fetchApi<any[]>('/results?stage=BMC')
    ])
    
    if (resJudges.success && resJudges.data) {
      setJudges(resJudges.data)
    }
    
    if (resTeams.success && resTeams.data && resAssignments.success && resAssignments.data) {
      const teams = resTeams.data
      const assignments = resAssignments.data
      const bmcResults = resBmcResults.success && resBmcResults.data ? resBmcResults.data : []
      const passedBmcIds = new Set(bmcResults.filter((r: any) => r.resultStatus === 'PASSED').map((r: any) => r.id))

      const mappedBmcTeams: TeamAssignment[] = teams.map((t) => {
        const teamAssignments = assignments.filter((a: any) => a.team_id === t.id && a.stage === 'BMC')
        const bmcResultObj = bmcResults.find((r: any) => r.id === t.id)
        
        return {
          id: t.id,
          teamName: t.name,
          subtheme: t.subthemes?.name || "-",
          fileName: bmcResultObj?.pdfName || "Belum Unggah",
          assignments: teamAssignments.map((a: any) => ({ assignmentId: a.id, judgeId: a.judge_id }))
        }
      })
      
      const mappedPitchingTeams: TeamAssignment[] = teams
        .filter((t) => passedBmcIds.has(t.id))
        .map((t) => {
          const bmcResultObj = bmcResults.find((r: any) => r.id === t.id)
          return {
            id: t.id,
            teamName: t.name,
            subtheme: t.subthemes?.name || "-",
            fileName: bmcResultObj?.pitchingFile || "Belum Unggah Pitching",
            assignments: []
          }
        })

      setBmcTeams(mappedBmcTeams)
      setPitchingTeams(mappedPitchingTeams)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchData()
  }, [])

  const activeJudgesCount = judges.filter((j) => j.active).length

  // Calculate stats workload per judge
  const getJudgeWorkload = (judgeId: string) => {
    if (activeTab === "PITCHING") {
      return pitchingTeams.length // Evaluated by ALL judges!
    }
    return bmcTeams.filter((t) => t.assignments.some(a => a.judgeId === judgeId)).length
  }

  // Quick Assign Handler (BMC Only)
  const handleAssignJudgeToTeam = async (teamId: string, judgeId: string) => {
    if (!judgeId) return
    setIsAssigning(true)
    const res = await fetchApi('/assignments', {
      method: 'POST',
      body: JSON.stringify({ teamId, judgeId, stage: 'BMC', assignmentScope: 'ALL' })
    })
    if (res.success) {
      await fetchData()
      showToast("Penugasan juri BMC berhasil ditambahkan!")
    } else {
      alert(res.error?.message || "Gagal assign juri")
    }
    setIsAssigning(false)
    setAssigningTeam(null)
    setSelectedJudgeToAssign("")
  }

  // Remove Assignment Handler (BMC Only)
  const handleRemoveAssignment = async (assignmentId: string) => {
    const res = await fetchApi(`/assignments/${assignmentId}`, {
      method: 'DELETE'
    })
    if (res.success) {
      await fetchData()
      showToast("Penugasan juri dihapus.")
    } else {
      alert(res.error?.message || "Gagal menghapus assignment")
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => setToastMessage(null), 3000)
  }

  // Save Judge Account
  const handleSaveJudge = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formName.trim() || !formUsername.trim()) return

    setIsSubmitting(true)
    if (editingJudgeId) {
      const res = await fetchApi(`/judges/${editingJudgeId}`, {
        method: 'PUT',
        body: JSON.stringify({ name: formName, active: true, password: formPassword || undefined }) // update allows empty password
      })
      if (res.success) {
        showToast("Akun juri diperbarui.")
      } else {
        alert(res.error?.message || "Gagal update")
      }
    } else {
      const res = await fetchApi('/judges', {
        method: 'POST',
        body: JSON.stringify({ name: formName, username: formUsername, password: formPassword })
      })
      if (res.success) {
        showToast("Akun juri baru dibuat.")
      } else {
        alert(res.error?.message || "Gagal membuat juri")
      }
    }
    await fetchData()
    setIsSubmitting(false)
    setIsAddJudgeModalOpen(false)
  }

  const handleDeleteJudge = async () => {
    if (deleteJudgeId) {
      const res = await fetchApi(`/judges/${deleteJudgeId}`, {
        method: 'DELETE'
      })
      if (res.success) {
        await fetchData()
        showToast("Akun juri dihapus.")
      } else {
        alert(res.error?.message || "Gagal hapus juri")
      }
      setDeleteJudgeId(null)
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
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-24 right-8 z-50 flex items-center gap-3 rounded-2xl bg-yec-brown text-white px-5 py-4 shadow-large">
          <CheckCircle2 className="h-5 w-5 text-yec-amber" />
          <span className="text-sm font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-yec-brown">
            Manajemen Penugasan Juri
          </h2>
          <p className="text-sm text-yec-text-secondary mt-1">
            Atur penugasan juri per tim untuk BMC, dan lihat evaluasi otomatis seluruh juri untuk Pitching.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={() => setIsManageJudgesOpen(true)}
            className="gap-2 border-[#DDD3C7] text-yec-brown hover:bg-yec-paper"
          >
            <UserCheck className="h-4 w-4 text-yec-amber" /> Kelola Akun Juri ({judges.length})
          </Button>
          <Button
            variant="primary"
            onClick={() => {
              setEditingJudgeId(null)
              setFormName("")
              setFormUsername("")
              setFormPassword("")
              setIsAddJudgeModalOpen(true)
            }}
            className="gap-2"
          >
            <Plus className="h-4 w-4" /> Tambah Juri Baru
          </Button>
        </div>
      </div>

      {/* Section 1: Stats Beban Kerja Per Juri */}
      <div>
        <p className="text-xs font-bold uppercase tracking-wider text-yec-text-muted mb-3">
          📊 Statistik Beban Penugasan Juri ({activeTab === "BMC" ? "Tahap BMC - Plot Penugasan" : "Tahap Pitching - Evaluasi Seluruh Juri"}):
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {judges.map((j) => {
            const count = getJudgeWorkload(j.id)
            return (
              <Card key={j.id} className="p-4 flex items-center justify-between border border-[#DDD3C7] bg-yec-white">
                <div className="min-w-0 pr-2">
                  <p className="font-semibold text-sm text-yec-brown truncate">{j.name}</p>
                  <p className="text-[11px] font-mono text-yec-text-muted">@{j.username}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-display font-bold text-xl text-yec-amber block leading-tight">{count}</span>
                  <span className="text-[10px] font-medium text-yec-text-secondary">Tim Assigned</span>
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Section 2: Stage Tabs Navigation */}
      <div className="flex border-b border-[#DDD3C7]">
        <button
          onClick={() => setActiveTab("BMC")}
          className={`flex items-center gap-2 px-6 py-3 font-display text-base font-bold transition-all border-b-2 ${
            activeTab === "BMC"
              ? "border-yec-amber text-yec-amber bg-yec-amber/5"
              : "border-transparent text-yec-text-secondary hover:text-yec-brown"
          }`}
        >
          <FileCheck className="h-5 w-5" /> Tahap 1 — Business Model Canvas (BMC)
        </button>
        <button
          onClick={() => setActiveTab("PITCHING")}
          className={`flex items-center gap-2 px-6 py-3 font-display text-base font-bold transition-all border-b-2 ${
            activeTab === "PITCHING"
              ? "border-yec-amber text-yec-amber bg-yec-amber/5"
              : "border-transparent text-yec-text-secondary hover:text-yec-brown"
          }`}
        >
          <Award className="h-5 w-5" /> Tahap 2 — Presentasi Pitching (Seluruh Juri)
        </button>
      </div>

      {/* Pitching Notice Banner */}
      {activeTab === "PITCHING" && (
        <div className="p-4 rounded-2xl border border-info/30 bg-info/5 flex items-start gap-3 text-info">
          <Info className="h-5 w-5 mt-0.5 shrink-0" />
          <div className="text-sm leading-relaxed">
            <p className="font-bold mb-0.5">Penugasan Otomatis Seluruh Juri (Full-Judge Evaluation):</p>
            <p className="text-info/80">
              Pada Tahap Pitching, 1 karya presentasi peserta secara otomatis dinilai oleh <strong>seluruh dewan juri aktif ({activeJudgesCount} Juri)</strong>. Tidak diperlukan penugasan manual per tim.
            </p>
          </div>
        </div>
      )}

      {/* Section 3: Team-Centric Assignment Table */}
      <Card className="p-0 overflow-hidden">
        <div className="p-5 border-b border-[#DDD3C7] bg-yec-paper flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-lg text-yec-brown">
              Daftar Tim Submit {activeTab === "BMC" ? "BMC" : "Pitching"}
            </h3>
            <p className="text-xs text-yec-text-secondary">
              {activeTab === "BMC"
                ? "Tugaskan juri penilai spesifik per karya tim BMC"
                : "Seluruh dewan juri aktif otomatis menjadi penilai karya pitching"}
            </p>
          </div>
          <Badge variant="info">
            {activeTab === "BMC" ? bmcTeams.length : pitchingTeams.length} Tim Terdaftar
          </Badge>
        </div>

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Tim Peserta</TableHead>
              <TableHead>Sub-tema Bisnis</TableHead>
              <TableHead>Berkas Submit</TableHead>
              <TableHead>Juri Penilai (Assigned)</TableHead>
              <TableHead className="text-right">Status Penugasan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activeTab === "BMC" ? (
              bmcTeams.map((team) => {
                return (
                  <TableRow key={team.id}>
                    <TableCell className="font-semibold text-yec-brown">
                      {team.teamName}
                    </TableCell>
                    <TableCell className="text-sm text-yec-text-secondary">
                      {team.subtheme}
                    </TableCell>
                    <TableCell className="text-xs font-mono text-yec-amber font-semibold">
                      {team.fileName}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-2">
                        {team.assignments.length === 0 ? (
                          <span className="text-xs text-yec-text-muted italic">Belum ada juri di-assign</span>
                        ) : (
                          team.assignments.map((assignment) => {
                            const judgeInfo = judges.find(j => j.id === assignment.judgeId)
                            if (!judgeInfo) return null
                            return (
                              <span
                                key={assignment.assignmentId}
                                className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD3C7] bg-yec-paper px-3 py-1 text-xs font-medium text-yec-brown"
                              >
                                <ShieldCheck className="h-3.5 w-3.5 text-yec-amber" />
                                {judgeInfo.name}
                                <button
                                  onClick={() => handleRemoveAssignment(assignment.assignmentId)}
                                  className="ml-1 rounded-full p-0.5 hover:bg-danger/20 hover:text-danger text-yec-text-muted"
                                  title="Hapus Penugasan Juri Ini"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            )
                          })
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setAssigningTeam(team)}
                        className="gap-1.5 text-xs text-yec-brown border-[#DDD3C7] hover:bg-yec-amber/10"
                      >
                        <UserPlus className="h-3.5 w-3.5 text-yec-amber" /> + Tugaskan Juri
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })
            ) : (
              pitchingTeams.map((team) => (
                <TableRow key={team.id}>
                  <TableCell className="font-semibold text-yec-brown">
                    {team.teamName}
                  </TableCell>
                  <TableCell className="text-sm text-yec-text-secondary">
                    {team.subtheme}
                  </TableCell>
                  <TableCell className="text-xs font-mono text-yec-amber font-semibold">
                    {team.fileName}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-2">
                      {judges.filter(j => j.active).map((j) => (
                        <span
                          key={j.id}
                          className="inline-flex items-center gap-1.5 rounded-full border border-[#DDD3C7] bg-yec-amber/10 px-3 py-1 text-xs font-medium text-yec-brown"
                        >
                          <ShieldCheck className="h-3.5 w-3.5 text-yec-amber" />
                          {j.name}
                        </span>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Badge variant="success">✅ OTOMATIS SEMUA JURI ({activeJudgesCount})</Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Quick Assign Modal (BMC Only) */}
      {assigningTeam && (
        <Modal
          isOpen={assigningTeam !== null}
          onClose={() => setAssigningTeam(null)}
          title={`Penugasan Juri BMC — ${assigningTeam.teamName}`}
        >
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-yec-paper border border-[#DDD3C7]">
              <span className="text-xs font-bold text-yec-text-muted uppercase">Target Tim</span>
              <p className="font-bold text-yec-brown text-base">{assigningTeam.teamName}</p>
              <p className="text-xs text-yec-text-secondary mt-0.5">{assigningTeam.subtheme} · File: {assigningTeam.fileName}</p>
            </div>

            <FormField label="Pilih Dewan Juri yang Di-assign" htmlFor="selectJudge">
              <Select
                id="selectJudge"
                value={selectedJudgeToAssign}
                onChange={(e) => setSelectedJudgeToAssign(e.target.value)}
                options={[
                  { value: "", label: "Pilih Juri Penilai..." },
                  ...judges
                    .filter((j) => j.active && !assigningTeam.assignments.some(a => a.judgeId === j.id))
                    .map((j) => ({ value: j.id, label: `${j.name} (@${j.username})` })),
                ]}
              />
            </FormField>

            <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD3C7]">
              <Button variant="ghost" onClick={() => setAssigningTeam(null)}>
                Batal
              </Button>
              <Button
                disabled={!selectedJudgeToAssign}
                onClick={() => handleAssignJudgeToTeam(assigningTeam.id, selectedJudgeToAssign)}
                isLoading={isAssigning}
              >
                Konfirmasi Penugasan
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Manage Judges List Modal */}
      <Modal
        isOpen={isManageJudgesOpen}
        onClose={() => setIsManageJudgesOpen(false)}
        title="Daftar Akun Dewan Juri YEC 2026"
      >
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {judges.map((j) => (
            <div key={j.id} className="flex items-center justify-between p-3.5 rounded-xl border border-[#DDD3C7] bg-yec-paper">
              <div>
                <span className="font-semibold text-sm text-yec-brown block">{j.name}</span>
                <span className="text-xs font-mono text-yec-amber font-semibold">@{j.username}</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setEditingJudgeId(j.id)
                    setFormName(j.name)
                    setFormUsername(j.username)
                    setFormPassword("")
                    setIsManageJudgesOpen(false)
                    setIsAddJudgeModalOpen(true)
                  }}
                  className="p-2 rounded-lg text-yec-text-secondary hover:bg-yec-white"
                  title="Edit Akun"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setDeleteJudgeId(j.id)}
                  className="p-2 rounded-lg text-danger hover:bg-danger/10"
                  title="Hapus Akun"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}

          <div className="flex justify-end pt-4 border-t border-[#DDD3C7]">
            <Button onClick={() => setIsManageJudgesOpen(false)}>Selesai</Button>
          </div>
        </div>
      </Modal>

      {/* Modal Add/Edit Judge */}
      <Modal
        isOpen={isAddJudgeModalOpen}
        onClose={() => setIsAddJudgeModalOpen(false)}
        title={editingJudgeId ? "Edit Akun Dewan Juri" : "Tambah Akun Dewan Juri"}
      >
        <form onSubmit={handleSaveJudge} className="space-y-5">
          <FormField label="Nama Lengkap & Gelar" htmlFor="judgeName">
            <Input
              id="judgeName"
              placeholder="Contoh: Dr. Ir. Budi Santoso, M.M."
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              required
            />
          </FormField>

          <FormField label="Username Login" htmlFor="judgeUsername">
            <Input
              id="judgeUsername"
              placeholder="budi.santoso"
              value={formUsername}
              onChange={(e) => setFormUsername(e.target.value)}
              required
              disabled={!!editingJudgeId}
            />
          </FormField>

          <FormField
            label={editingJudgeId ? "Password Baru (Kosongkan jika tidak diubah)" : "Password Login"}
            htmlFor="judgePassword"
          >
            <Input
              id="judgePassword"
              type="password"
              placeholder="••••••••"
              value={formPassword}
              onChange={(e) => setFormPassword(e.target.value)}
              required={!editingJudgeId}
            />
          </FormField>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD3C7]">
            <Button type="button" variant="ghost" onClick={() => setIsAddJudgeModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              {editingJudgeId ? "Simpan Perubahan" : "Buat Akun Juri"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteJudgeId !== null}
        title="Hapus Akun Juri?"
        message="Menghapus juri ini akan mengosongkan penugasan tim yang terkait."
        confirmText="Hapus Akun"
        variant="danger"
        onConfirm={handleDeleteJudge}
        onCancel={() => setDeleteJudgeId(null)}
      />
    </div>
  )
}
