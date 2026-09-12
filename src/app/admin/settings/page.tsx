"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Textarea } from "@/components/ui/Textarea"
import { FormField } from "@/components/ui/FormField"
import { Badge } from "@/components/ui/Badge"
import { ConfirmDialog } from "@/components/ui/ConfirmDialog"
import { fetchApi } from "@/lib/api"
import {
  Save, Plus, Trash2, GripVertical, CheckCircle2,
  Megaphone, Sliders, Layers
} from "lucide-react"

export default function AdminSettingsPage() {
  // Settings state
  const [bmcOpen, setBmcOpen] = useState(false)
  const [bmcEvalOpen, setBmcEvalOpen] = useState(false)
  const [pitchingOpen, setPitchingOpen] = useState(false)
  const [pitchingEvalOpen, setPitchingEvalOpen] = useState(false)

  const [competitionName, setCompetitionName] = useState("")
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementContent, setAnnouncementContent] = useState("")
  const [supportPhone, setSupportPhone] = useState("")

  // Subthemes state
  const [subthemes, setSubthemes] = useState<any[]>([])
  
  const [newSubthemeTitle, setNewSubthemeTitle] = useState("")
  const [newSubthemeCode, setNewSubthemeCode] = useState("")
  
  const [showSavedToast, setShowSavedToast] = useState(false)
  const [deleteSubthemeId, setDeleteSubthemeId] = useState<string | null>(null)
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  // Load Data
  useEffect(() => {
    async function loadData() {
      setIsLoading(true)
      
      const [settingsRes, subthemesRes] = await Promise.all([
        fetchApi('/settings'),
        fetchApi('/subthemes')
      ])

      if (settingsRes.success && settingsRes.data) {
        setBmcOpen(settingsRes.data.bmc_submission_open || false)
        setBmcEvalOpen(settingsRes.data.bmc_evaluation_open || false)
        setPitchingOpen(settingsRes.data.pitching_submission_open || false)
        setPitchingEvalOpen(settingsRes.data.pitching_evaluation_open || false)
        setCompetitionName(settingsRes.data.competition_name || "")
        setAnnouncementTitle(settingsRes.data.announcement_title || "")
        setAnnouncementContent(settingsRes.data.announcement_content || "")
        setSupportPhone(settingsRes.data.participant_support_phone || "")
      }

      if (subthemesRes.success && subthemesRes.data) {
        // Map to expected format
        const mapped = subthemesRes.data.map((s: any) => ({
          id: s.id,
          title: s.name,
          code: s.name.substring(0, 4).toUpperCase(), // If code is not in schema, fallback
          active: s.active,
          sortOrder: s.sort_order
        }))
        setSubthemes(mapped)
      }
      
      setIsLoading(false)
    }
    
    loadData()
  }, [])

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSaving(true)
    
    const payload = {
      competition_name: competitionName,
      bmc_submission_open: bmcOpen,
      bmc_evaluation_open: bmcEvalOpen,
      pitching_submission_open: pitchingOpen,
      pitching_evaluation_open: pitchingEvalOpen,
      announcement_title: announcementTitle,
      announcement_content: announcementContent,
      participant_support_phone: supportPhone
    }
    
    const res = await fetchApi('/settings', {
      method: 'PUT',
      body: JSON.stringify(payload)
    })
    
    setIsSaving(false)
    
    if (res.success) {
      setShowSavedToast(true)
      setTimeout(() => setShowSavedToast(false), 3000)
    } else {
      alert(res.error?.message || 'Gagal menyimpan pengaturan')
    }
  }

  const handleAddSubtheme = async () => {
    if (!newSubthemeTitle.trim()) return
    
    const payload = {
      name: newSubthemeTitle,
      sortOrder: subthemes.length + 1,
      active: true
    }
    
    const res = await fetchApi('/subthemes', {
      method: 'POST',
      body: JSON.stringify(payload)
    })
    
    if (res.success && res.data) {
      setSubthemes([
        ...subthemes,
        {
          id: res.data.id,
          title: res.data.name,
          code: res.data.name.substring(0, 4).toUpperCase(),
          active: res.data.active,
          sortOrder: res.data.sort_order
        },
      ])
      setNewSubthemeTitle("")
      setNewSubthemeCode("")
    } else {
      alert(res.error?.message || 'Gagal menambahkan subtema')
    }
  }

  const handleDeleteSubtheme = async () => {
    if (deleteSubthemeId) {
      const res = await fetchApi(`/subthemes/${deleteSubthemeId}`, {
        method: 'DELETE'
      })
      
      if (res.success) {
        setSubthemes(subthemes.filter((s) => s.id !== deleteSubthemeId))
        setDeleteSubthemeId(null)
      } else {
        alert(res.error?.message || 'Gagal menghapus subtema')
        setDeleteSubthemeId(null)
      }
    }
  }

  const toggleSubtheme = async (id: string) => {
    const target = subthemes.find(s => s.id === id)
    if (!target) return
    
    const newStatus = !target.active
    
    const res = await fetchApi(`/subthemes/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ active: newStatus })
    })
    
    if (res.success) {
      setSubthemes(
        subthemes.map((s) => (s.id === id ? { ...s, active: newStatus } : s))
      )
    } else {
      alert(res.error?.message || 'Gagal mengubah status subtema')
    }
  }

  if (isLoading) {
    return <div className="p-8 text-center text-yec-text-muted animate-pulse">Memuat pengaturan...</div>
  }

  return (
    <div className="space-y-8">
      {/* Toast Notifikasi */}
      {showSavedToast && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="fixed top-24 right-8 z-50 flex items-center gap-3 rounded-2xl bg-success px-5 py-4 text-white shadow-large"
        >
          <CheckCircle2 className="h-5 w-5" />
          <span className="text-sm font-semibold">Pengaturan berhasil disimpan!</span>
        </motion.div>
      )}

      {/* Header */}
      <div>
        <h2 className="font-display font-bold text-2xl md:text-3xl text-yec-brown">
          Pengaturan Lomba & Configuration
        </h2>
        <p className="text-sm text-yec-text-secondary mt-1">
          Atur status tahapan lomba, sub-tema bisnis, pengumuman publik, serta kontak bantuan.
        </p>
      </div>

      <form onSubmit={handleSaveSettings} className="space-y-8">
        
        {/* Section: General Config */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yec-amber/10 text-yec-amber">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-yec-brown">Informasi Umum</h3>
              <p className="text-xs text-yec-text-secondary">Nama lomba yang akan ditampilkan</p>
            </div>
          </div>
          <div className="space-y-5">
            <FormField label="Nama Kompetisi Utama" htmlFor="compName">
              <Input
                id="compName"
                value={competitionName}
                onChange={(e) => setCompetitionName(e.target.value)}
              />
            </FormField>
          </div>
        </Card>

        {/* Section 1: Control Sakelar Tahapan */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yec-amber/10 text-yec-amber">
              <Sliders className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-yec-brown">Sakelar Stage / Tahapan Lomba</h3>
              <p className="text-xs text-yec-text-secondary">Buka atau tutup akses submit dan evaluasi juri secara real-time</p>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* BMC Controls */}
            <div className="rounded-2xl border border-[#DDD3C7] bg-yec-paper p-5 space-y-4">
              <h4 className="font-semibold text-yec-brown text-base flex items-center justify-between">
                Tahap 1 — Business Model Canvas (BMC)
                <Badge variant={bmcOpen ? "success" : "default"}>
                  {bmcOpen ? "AKTIF" : "NONAKTIF"}
                </Badge>
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-yec-white border border-[#DDD3C7] cursor-pointer">
                  <span className="text-sm font-medium text-yec-text">Submisi BMC Peserta</span>
                  <input
                    type="checkbox"
                    checked={bmcOpen}
                    onChange={(e) => setBmcOpen(e.target.checked)}
                    className="h-5 w-5 rounded accent-yec-amber"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-yec-white border border-[#DDD3C7] cursor-pointer">
                  <span className="text-sm font-medium text-yec-text">Evaluasi Juri BMC</span>
                  <input
                    type="checkbox"
                    checked={bmcEvalOpen}
                    onChange={(e) => setBmcEvalOpen(e.target.checked)}
                    className="h-5 w-5 rounded accent-yec-amber"
                  />
                </label>
              </div>
            </div>

            {/* Pitching Controls */}
            <div className="rounded-2xl border border-[#DDD3C7] bg-yec-paper p-5 space-y-4">
              <h4 className="font-semibold text-yec-brown text-base flex items-center justify-between">
                Tahap 2 — Pitching Presentation
                <Badge variant={pitchingOpen ? "success" : "default"}>
                  {pitchingOpen ? "AKTIF" : "NONAKTIF"}
                </Badge>
              </h4>
              <div className="space-y-3">
                <label className="flex items-center justify-between p-3 rounded-xl bg-yec-white border border-[#DDD3C7] cursor-pointer">
                  <span className="text-sm font-medium text-yec-text">Submisi Pitching Peserta</span>
                  <input
                    type="checkbox"
                    checked={pitchingOpen}
                    onChange={(e) => setPitchingOpen(e.target.checked)}
                    className="h-5 w-5 rounded accent-yec-amber"
                  />
                </label>
                <label className="flex items-center justify-between p-3 rounded-xl bg-yec-white border border-[#DDD3C7] cursor-pointer">
                  <span className="text-sm font-medium text-yec-text">Evaluasi Juri Pitching</span>
                  <input
                    type="checkbox"
                    checked={pitchingEvalOpen}
                    onChange={(e) => setPitchingEvalOpen(e.target.checked)}
                    className="h-5 w-5 rounded accent-yec-amber"
                  />
                </label>
              </div>
            </div>
          </div>
        </Card>

        {/* Section 2: Sub-Theme Manager */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yec-amber/10 text-yec-amber">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-yec-brown">Manajemen Sub-tema Bisnis</h3>
              <p className="text-xs text-yec-text-secondary">Kelola daftar pilihan sub-tema yang tersedia bagi peserta</p>
            </div>
          </div>

          <div className="space-y-4 mb-6">
            {subthemes.map((st) => (
              <div
                key={st.id}
                className="flex items-center justify-between p-4 rounded-xl border border-[#DDD3C7] bg-yec-paper"
              >
                <div className="flex items-center gap-3">
                  <GripVertical className="h-4 w-4 text-yec-text-muted cursor-grab" />
                  <div>
                    <span className="font-semibold text-sm text-yec-brown">{st.title}</span>
                    <span className="ml-2 text-xs font-mono text-yec-amber">[{st.code}]</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => toggleSubtheme(st.id)}
                    className={`px-3 py-1 text-xs font-bold rounded-full transition-colors ${
                      st.active
                        ? "bg-success/15 text-success hover:bg-success/20"
                        : "bg-yec-text-muted/15 text-yec-text-muted hover:bg-yec-text-muted/20"
                    }`}
                  >
                    {st.active ? "Aktif" : "Nonaktif"}
                  </button>
                  <button
                    type="button"
                    onClick={() => setDeleteSubthemeId(st.id)}
                    className="p-1.5 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Form Tambah Subtheme */}
          <div className="pt-4 border-t border-[#DDD3C7] flex flex-col sm:flex-row gap-3 items-end">
            <div className="flex-1 w-full">
              <FormField label="Nama Sub-tema Baru" htmlFor="newSubTitle">
                <Input
                  id="newSubTitle"
                  placeholder="Contoh: Social Entrepreneurship..."
                  value={newSubthemeTitle}
                  onChange={(e) => setNewSubthemeTitle(e.target.value)}
                />
              </FormField>
            </div>
            <div className="w-full sm:w-36">
              <FormField label="Kode (Opsional)" htmlFor="newSubCode">
                <Input
                  id="newSubCode"
                  placeholder="SOC"
                  value={newSubthemeCode}
                  onChange={(e) => setNewSubthemeCode(e.target.value)}
                />
              </FormField>
            </div>
            <Button
              type="button"
              variant="secondary"
              onClick={handleAddSubtheme}
              className="gap-2 w-full sm:w-auto h-11 shrink-0"
            >
              <Plus className="h-4 w-4" /> Tambah Sub-tema
            </Button>
          </div>
        </Card>

        {/* Section 3: Announcement Editor & General Config */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-yec-amber/10 text-yec-amber">
              <Megaphone className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-xl text-yec-brown">Pengumuman & Kontak Support</h3>
              <p className="text-xs text-yec-text-secondary">Konten ini akan tampil di Landing Page dan Portal Tim</p>
            </div>
          </div>

          <div className="space-y-5">
            <FormField label="Judul Pengumuman Utama" htmlFor="annTitle">
              <Input
                id="annTitle"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
              />
            </FormField>

            <FormField label="Isi Pesan Pengumuman" htmlFor="annContent">
              <Textarea
                id="annContent"
                rows={3}
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
              />
            </FormField>

            <FormField label="Nomor WhatsApp Helpdesk Support" htmlFor="supportPhone">
              <Input
                id="supportPhone"
                value={supportPhone}
                onChange={(e) => setSupportPhone(e.target.value)}
              />
            </FormField>
          </div>
        </Card>

        {/* Save Bar */}
        <div className="flex justify-end pt-4">
          <Button type="submit" size="lg" className="gap-2 px-8" isLoading={isSaving}>
            <Save className="h-5 w-5" /> Simpan Semua Pengaturan
          </Button>
        </div>
      </form>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteSubthemeId !== null}
        title="Hapus Sub-tema?"
        message="Apakah Anda yakin ingin menghapus sub-tema ini? Sub-tema yang dihapus tidak dapat dipilih oleh peserta baru."
        confirmText="Hapus Sub-tema"
        variant="danger"
        onConfirm={handleDeleteSubtheme}
        onCancel={() => setDeleteSubthemeId(null)}
      />
    </div>
  )
}
