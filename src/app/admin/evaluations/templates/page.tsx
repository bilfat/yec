"use client"

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/Card"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Select } from "@/components/ui/Select"
import { Badge } from "@/components/ui/Badge"
import { FormField } from "@/components/ui/FormField"
import {
  FileText, Plus, Trash2, CheckCircle2,
  AlertTriangle, Save, Play, GripVertical
} from "lucide-react"
import { fetchApi } from "@/lib/api"

interface PointItem {
  id: string
  label: string
}

interface CriteriaItem {
  id: string
  name: string
  weight: number
  points: PointItem[]
}

export default function AdminEvaluationTemplatesPage() {
  const [activeStage, setActiveStage] = useState<"BMC" | "PITCHING">("BMC")
  const [templateName, setTemplateName] = useState("")
  const [status, setStatus] = useState<"DRAFT" | "ACTIVE">("DRAFT")
  const [criteriaList, setCriteriaList] = useState<CriteriaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)

  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const fetchTemplate = async (stage: string) => {
    setIsLoading(true)
    const res = await fetchApi<{ templateName: string, status: "DRAFT" | "ACTIVE", criteriaList: CriteriaItem[] }>(`/evaluation-templates?stage=${stage}`)
    if (res.success && res.data) {
      setTemplateName(res.data.templateName)
      setStatus(res.data.status)
      setCriteriaList(res.data.criteriaList)
    } else {
      // Fallback defaults
      setTemplateName(`Rubrik Penilaian ${stage} YEC 2026`)
      setStatus("DRAFT")
      setCriteriaList([])
    }
    setIsLoading(false)
  }

  useEffect(() => {
    fetchTemplate(activeStage)
  }, [activeStage])

  // Calculated total weight
  const totalWeight = criteriaList.reduce((sum, c) => sum + (Number(c.weight) || 0), 0)
  const isWeightValid = totalWeight === 100

  const handleAddCriteria = () => {
    setCriteriaList([
      ...criteriaList,
      {
        id: Date.now().toString(),
        name: "Kriteria Baru",
        weight: 0,
        points: [{ id: Date.now().toString() + "_p", label: "Poin indikator 1" }],
      },
    ])
  }

  const handleDeleteCriteria = (id: string) => {
    setCriteriaList(criteriaList.filter((c) => c.id !== id))
  }

  const handleUpdateCriteriaName = (id: string, name: string) => {
    setCriteriaList(criteriaList.map((c) => (c.id === id ? { ...c, name } : c)))
  }

  const handleUpdateCriteriaWeight = (id: string, weightStr: string) => {
    const weight = parseInt(weightStr, 10) || 0
    setCriteriaList(criteriaList.map((c) => (c.id === id ? { ...c, weight } : c)))
  }

  const handleAddPoint = (criteriaId: string) => {
    setCriteriaList(
      criteriaList.map((c) => {
        if (c.id === criteriaId) {
          return {
            ...c,
            points: [...c.points, { id: Date.now().toString(), label: "" }],
          }
        }
        return c
      })
    )
  }

  const handleUpdatePointLabel = (criteriaId: string, pointId: string, label: string) => {
    setCriteriaList(
      criteriaList.map((c) => {
        if (c.id === criteriaId) {
          return {
            ...c,
            points: c.points.map((p) => (p.id === pointId ? { ...p, label } : p)),
          }
        }
        return c
      })
    )
  }

  const handleDeletePoint = (criteriaId: string, pointId: string) => {
    setCriteriaList(
      criteriaList.map((c) => {
        if (c.id === criteriaId) {
          return {
            ...c,
            points: c.points.filter((p) => p.id !== pointId),
          }
        }
        return c
      })
    )
  }

  const saveTemplate = async (newStatus: "DRAFT" | "ACTIVE") => {
    setIsSaving(true)
    const res = await fetchApi('/evaluation-templates', {
      method: 'POST',
      body: JSON.stringify({
        stage: activeStage,
        templateName,
        status: newStatus,
        criteriaList
      })
    })
    
    if (res.success) {
      setStatus(newStatus)
      setToastMessage(newStatus === "DRAFT" ? "Template berhasil disimpan sebagai Draft." : "Template penilaian berhasil DIAKTIFKAN!")
      setTimeout(() => setToastMessage(null), 3000)
    }
    setIsSaving(false)
  }

  const handleSaveDraft = () => {
    saveTemplate("DRAFT")
  }

  const handleActivate = () => {
    if (!isWeightValid) return
    saveTemplate("ACTIVE")
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

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="font-display font-bold text-2xl md:text-3xl text-yec-brown">
            Builder Template Penilaian Dinamis
          </h2>
          <p className="text-sm text-yec-text-secondary mt-1">
            Konfigurasi kriteria, bobot, dan poin penilaian tanpa perlu di-hardcode pada React UI.
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-xl bg-yec-paper p-1.5 border border-[#DDD3C7]">
          <button
            onClick={() => setActiveStage("BMC")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeStage === "BMC" ? "bg-yec-amber text-white shadow-sm" : "text-yec-text-secondary hover:text-yec-brown"
            }`}
          >
            Stage BMC
          </button>
          <button
            onClick={() => setActiveStage("PITCHING")}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition-all ${
              activeStage === "PITCHING" ? "bg-yec-amber text-white shadow-sm" : "text-yec-text-secondary hover:text-yec-brown"
            }`}
          >
            Stage Pitching
          </button>
        </div>
      </div>

      {/* Weight Summary Banner */}
      <Card className="p-5 border-l-4 border-l-yec-amber flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-yec-white">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-yec-amber/10 text-yec-amber">
            <FileText className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-yec-brown text-base">{templateName}</span>
              <Badge variant={status === "ACTIVE" ? "success" : "warning"}>
                {status}
              </Badge>
            </div>
            <p className="text-xs text-yec-text-secondary mt-0.5">Stage: {activeStage}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <span className="text-xs text-yec-text-muted block">Total Bobot Kriteria</span>
            <span className={`font-display text-2xl font-bold ${isWeightValid ? "text-success" : "text-danger"}`}>
              {totalWeight}%
            </span>
          </div>
          {!isWeightValid && (
            <div className="flex items-center gap-1.5 text-xs text-danger font-semibold bg-danger/10 px-3 py-1.5 rounded-lg">
              <AlertTriangle className="h-4 w-4" /> Wajib = 100%
            </div>
          )}
        </div>
      </Card>

      {/* Criteria Editor Section */}
      <div className="space-y-6">
        {criteriaList.map((crit, idx) => (
          <Card key={crit.id} className="p-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#DDD3C7]">
              <div className="flex items-center gap-3 flex-1">
                <GripVertical className="h-5 w-5 text-yec-text-muted cursor-grab" />
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-yec-amber text-white text-xs font-bold">
                  {idx + 1}
                </span>
                <Input
                  value={crit.name}
                  onChange={(e) => handleUpdateCriteriaName(crit.id, e.target.value)}
                  className="font-bold text-lg text-yec-brown border-transparent hover:border-[#DDD3C7] focus:border-yec-amber"
                  placeholder="Nama Kriteria..."
                />
              </div>

              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-yec-text-muted">Bobot:</span>
                  <div className="relative w-24">
                    <Input
                      type="number"
                      min={0}
                      max={100}
                      value={crit.weight}
                      onChange={(e) => handleUpdateCriteriaWeight(crit.id, e.target.value)}
                      className="pr-7 text-right font-bold text-yec-brown"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-yec-text-muted">%</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteCriteria(crit.id)}
                  className="p-2 rounded-lg text-danger hover:bg-danger/10 transition-colors"
                  title="Hapus Kriteria"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Points list under criteria */}
            <div className="space-y-3 pl-4 md:pl-10">
              <p className="text-xs font-bold uppercase tracking-wider text-yec-text-muted mb-2">
                Poin Indikator Penilaian:
              </p>
              {crit.points.map((p, pIdx) => (
                <div key={p.id} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-yec-text-muted w-5">{pIdx + 1}.</span>
                  <Input
                    value={p.label}
                    onChange={(e) => handleUpdatePointLabel(crit.id, p.id, e.target.value)}
                    placeholder="Masukkan uraian poin indikator..."
                    className="text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeletePoint(crit.id, p.id)}
                    className="p-1.5 text-yec-text-muted hover:text-danger"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleAddPoint(crit.id)}
                className="gap-1.5 text-xs text-yec-amber mt-2"
              >
                <Plus className="h-3.5 w-3.5" /> Tambah Poin Indikator
              </Button>
            </div>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={handleAddCriteria}
          className="w-full py-4 border-dashed border-2 gap-2 text-yec-amber hover:bg-yec-amber/5"
        >
          <Plus className="h-5 w-5" /> Tambah Kriteria Baru
        </Button>
      </div>

      {/* Action Footer */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-4 border-t border-[#DDD3C7]">
        <span className="text-xs text-yec-text-secondary">
          {isWeightValid ? "✓ Total bobot memenuhi syarat 100%" : "⚠️ Total bobot belum sama dengan 100%"}
        </span>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleSaveDraft} className="gap-2">
            <Save className="h-4 w-4" /> Simpan Draft
          </Button>
          <Button
            variant="primary"
            onClick={handleActivate}
            disabled={!isWeightValid}
            className="gap-2"
          >
            <Play className="h-4 w-4" /> Aktifkan Template
          </Button>
        </div>
      </div>
    </div>
  )
}
