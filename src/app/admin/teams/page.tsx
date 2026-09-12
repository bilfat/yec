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
  Users, Search, Download, Plus, Trash2, Key,
  Copy, Check, RefreshCw, Eye, FileText, Clock,
  CheckCircle2, XCircle, Award, ExternalLink, ShieldCheck
} from "lucide-react"

interface TeamItem {
  id: string
  name: string
  pin: string
  subtheme: string
  createdAt: string
  // Mock fields for now (Phase 3 & 4)
  bmcStatus: "NOT_SUBMITTED" | "EVALUATING" | "PASSED" | "FAILED"
  pitchingStatus: "NOT_ELIGIBLE" | "NOT_SUBMITTED" | "EVALUATING" | "COMPLETED"
}

export default function AdminTeamsPage() {
  const [teams, setTeams] = useState<TeamItem[]>([])
  const [subthemes, setSubthemes] = useState<{value: string, label: string}[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState("ALL")

  // Create team modal state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [newTeamName, setNewTeamName] = useState("")
  const [newTeamSubthemeId, setNewTeamSubthemeId] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  
  // New PIN Result Modal
  const [createdTeamInfo, setCreatedTeamInfo] = useState<{name: string, rawPin: string} | null>(null)

  // Delete dialog state
  const [deleteTeamId, setDeleteTeamId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const fetchTeams = async () => {
    setIsLoading(true)
    const [teamsRes, subthemesRes] = await Promise.all([
      fetchApi<any[]>('/teams'),
      fetchApi<any[]>('/subthemes')
    ])
    
    if (subthemesRes.success && subthemesRes.data) {
      setSubthemes(subthemesRes.data.map(s => ({ value: s.id, label: s.name })))
    }
    
    if (teamsRes.success && teamsRes.data) {
      const mapped: TeamItem[] = teamsRes.data.map(t => ({
        id: t.id,
        name: t.name,
        pin: t.pin_code || "------",
        subtheme: t.subthemes?.name || "-",
        createdAt: new Date(t.created_at).toLocaleDateString('id-ID'),
        bmcStatus: "NOT_SUBMITTED",
        pitchingStatus: "NOT_ELIGIBLE"
      }))
      setTeams(mapped)
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTeams()
  }, [])

  const filteredTeams = teams.filter((t) => {
    const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase())
    if (filterStatus === "ALL") return matchesSearch
    if (filterStatus === "EVALUATING") return matchesSearch && (t.bmcStatus === "EVALUATING" || t.pitchingStatus === "EVALUATING")
    if (filterStatus === "PASSED") return matchesSearch && t.bmcStatus === "PASSED"
    if (filterStatus === "FAILED") return matchesSearch && t.bmcStatus === "FAILED"
    return matchesSearch
  })

  const handleOpenAddModal = () => {
    setNewTeamName("")
    setNewTeamSubthemeId(subthemes.length > 0 ? subthemes[0].value : "")
    setIsAddModalOpen(true)
  }

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTeamName.trim()) return

    setIsCreating(true)
    const res = await fetchApi('/teams', {
      method: 'POST',
      body: JSON.stringify({ 
        name: newTeamName.trim(),
        subthemeId: newTeamSubthemeId || null
      })
    })

    if (res.success && res.data) {
      setCreatedTeamInfo({
        name: res.data.name,
        rawPin: res.data.rawPin
      })
      await fetchTeams()
      setIsAddModalOpen(false)
    } else {
      alert(res.error?.message || "Gagal membuat tim")
    }
    setIsCreating(false)
  }

  const [resettingId, setResettingId] = useState<string | null>(null)

  const handleResetPin = async (teamId: string) => {
    setResettingId(teamId)
    const res = await fetchApi(`/teams/${teamId}/reset-pin`, { method: 'POST' })
    if (res.success && res.data) {
      setCreatedTeamInfo({
        name: res.data.name,
        rawPin: res.data.rawPin
      })
      await fetchTeams()
    } else {
      alert(res.error?.message || "Gagal memperbarui PIN tim")
    }
    setResettingId(null)
  }

  const handleDeleteTeam = async () => {
    if (deleteTeamId) {
      setIsDeleting(true)
      const res = await fetchApi(`/teams/${deleteTeamId}`, { method: 'DELETE' })
      if (res.success) {
        setTeams(teams.filter((t) => t.id !== deleteTeamId))
      } else {
        alert(res.error?.message || "Gagal menghapus tim")
      }
      setIsDeleting(false)
      setDeleteTeamId(null)
    }
  }

  const handleCopyPin = (pin: string, id: string) => {
    navigator.clipboard.writeText(pin)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleExportCsv = async () => {
    window.location.href = '/api/teams/export-pin'
  }

  const handleExportPdf = () => {
    window.print()
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-yec-brown">
            Manajemen Tim Peserta
          </h2>
          <p className="text-sm text-yec-text-secondary mt-1">
            Pantau seluruh tim peserta, lihat subtema, dan kelola PIN pendaftaran.
          </p>
        </div>
        <div className="flex flex-wrap gap-3 print:hidden">
          <Button variant="outline" onClick={handleExportPdf} className="gap-2 border-[#DDD3C7] text-yec-brown hover:bg-yec-paper">
            <FileText className="h-4 w-4 text-yec-amber" /> Cetak / Export PDF
          </Button>
          <Button variant="outline" onClick={handleExportCsv} className="gap-2 border-[#DDD3C7] text-yec-brown hover:bg-yec-paper">
            <Download className="h-4 w-4 text-yec-amber" /> Export CSV
          </Button>
          <Button variant="primary" onClick={handleOpenAddModal} className="gap-2">
            <Plus className="h-4 w-4" /> Tambah Tim Baru
          </Button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <Card className="p-4 print:hidden">
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-yec-text-muted" />
            <Input
              placeholder="Cari nama tim..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-10 text-sm"
            />
          </div>
          <div className="w-full sm:w-56">
            <Select
              id="filterStatus"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              options={[
                { value: "ALL", label: "Semua Status Tim" },
              ]}
              className="h-10 text-sm"
            />
          </div>
        </div>
      </Card>

      {/* Complete Teams Table */}
      <Card className="p-0 overflow-hidden print:border-none print:shadow-none">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Tim Peserta</TableHead>
              <TableHead>Sub-tema</TableHead>
              <TableHead>PIN Akses</TableHead>
              <TableHead>Status Saat Ini</TableHead>
              <TableHead className="text-right print:hidden">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTeams.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-12 text-yec-text-muted">
                  Tidak ada data tim yang sesuai pencarian.
                </TableCell>
              </TableRow>
            ) : (
              filteredTeams.map((t) => (
                <TableRow key={t.id}>
                  {/* Nama Tim */}
                  <TableCell className="font-semibold text-yec-brown">
                    {t.name}
                    <div className="text-[11px] font-normal text-yec-text-muted">Terdaftar: {t.createdAt}</div>
                  </TableCell>

                  {/* Sub-tema */}
                  <TableCell className="text-sm text-yec-text-secondary">{t.subtheme}</TableCell>

                  {/* PIN Akses Direct Display */}
                  <TableCell>
                    <div className="inline-flex items-center gap-2 rounded-xl bg-yec-paper border border-[#DDD3C7] px-3 py-1.5 font-mono text-sm font-bold text-yec-amber">
                      <span className="tracking-widest">{t.pin}</span>
                      {t.pin !== "------" && (
                        <button
                          onClick={() => handleCopyPin(t.pin, t.id)}
                          className="text-yec-text-muted hover:text-yec-brown transition-colors p-0.5 print:hidden"
                          title="Salin PIN"
                        >
                          {copiedId === t.id ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      )}
                    </div>
                  </TableCell>

                  <TableCell>
                    <Badge variant="default">Terdaftar</Badge>
                  </TableCell>

                  {/* Actions */}
                  <TableCell className="text-right print:hidden">
                    <div className="flex justify-end items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleResetPin(t.id)}
                        isLoading={resettingId === t.id}
                        className="gap-1.5 text-xs text-yec-brown border-[#DDD3C7] hover:bg-yec-amber/10"
                        title="Generate PIN Baru"
                      >
                        <Key className="h-3.5 w-3.5 text-yec-amber" /> Reset PIN
                      </Button>
                      <button
                        onClick={() => setDeleteTeamId(t.id)}
                        className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                        title="Hapus Tim"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Team Modal */}
      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title="Registrasi Tim Peserta Baru"
      >
        <form onSubmit={handleCreateTeam} className="space-y-5">
          <FormField label="Nama Tim Peserta" htmlFor="addTeamName">
            <Input
              id="addTeamName"
              placeholder="Contoh: Tim Creative Alpha..."
              value={newTeamName}
              onChange={(e) => setNewTeamName(e.target.value)}
              required
            />
          </FormField>
          
          <FormField label="Pilih Sub-tema (Opsional)" htmlFor="addTeamSubtheme">
            <Select
              id="addTeamSubtheme"
              value={newTeamSubthemeId}
              onChange={(e) => setNewTeamSubthemeId(e.target.value)}
              options={[{ value: "", label: "Pilih Sub-tema..." }, ...subthemes]}
            />
          </FormField>

          <p className="text-xs text-yec-text-muted mt-2">
            Sistem akan secara otomatis membuatkan PIN acak (6 digit) untuk tim ini. PIN akan ditampilkan di layar selanjutnya.
          </p>

          <div className="flex justify-end gap-3 pt-4 border-t border-[#DDD3C7]">
            <Button type="button" variant="ghost" onClick={() => setIsAddModalOpen(false)}>
              Batal
            </Button>
            <Button type="submit" isLoading={isCreating}>
              Buat Tim
            </Button>
          </div>
        </form>
      </Modal>
      
      {/* PIN Result Modal */}
      <Modal
        isOpen={createdTeamInfo !== null}
        onClose={() => setCreatedTeamInfo(null)}
        title="Tim Berhasil Dibuat!"
      >
        <div className="space-y-6 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          
          <div>
            <h3 className="font-display font-bold text-xl text-yec-brown">{createdTeamInfo?.name}</h3>
            <p className="text-sm text-yec-text-secondary mt-1">
              Penting! Catat atau salin PIN di bawah ini dan berikan kepada peserta. PIN ini dienkripsi di database dan tidak dapat dilihat kembali.
            </p>
          </div>
          
          <div className="rounded-xl border-2 border-dashed border-yec-amber bg-yec-paper p-6">
            <span className="block text-xs font-bold uppercase tracking-wider text-yec-text-muted mb-2">
              PIN Akses (Sekali Tampil)
            </span>
            <div className="font-mono text-4xl tracking-[0.3em] font-bold text-yec-amber">
              {createdTeamInfo?.rawPin}
            </div>
            <div className="mt-4">
               <Button 
                variant="outline" 
                onClick={() => {
                  if (createdTeamInfo) handleCopyPin(createdTeamInfo.rawPin, 'new-pin')
                }}
                className="mx-auto gap-2"
               >
                 {copiedId === 'new-pin' ? <Check className="h-4 w-4 text-success" /> : <Copy className="h-4 w-4" />}
                 {copiedId === 'new-pin' ? 'Tersalin!' : 'Salin PIN'}
               </Button>
            </div>
          </div>
          
          <Button className="w-full" onClick={() => setCreatedTeamInfo(null)}>
            Tutup
          </Button>
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteTeamId !== null}
        title="Hapus Tim Peserta?"
        message="Tindakan ini akan menghapus data tim beserta seluruh riwayat karya BMC dan nilai juri yang telah disubmit."
        confirmText="Hapus Permanen"
        variant="danger"
        onConfirm={handleDeleteTeam}
        onCancel={() => setDeleteTeamId(null)}
        isLoading={isDeleting}
      />
    </div>
  )
}
