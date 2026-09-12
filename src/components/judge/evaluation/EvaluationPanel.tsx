"use client"

import * as React from "react"
import { CriteriaSection, Criteria } from "@/components/evaluation/CriteriaSection"
import { Button } from "@/components/ui/Button"
import { fetchApi } from "@/lib/api"

import { useRouter } from "next/navigation"

interface EvaluationPanelProps {
  assignmentId: string
  teamName: string
  stage: string
  criteriaList: Criteria[]
  initialScores?: Record<string, number>
  initialNote?: string
  isLocked?: boolean
}

export function EvaluationPanel({ assignmentId, teamName, stage, criteriaList, initialScores = {}, initialNote = "", isLocked = false }: EvaluationPanelProps) {
  const router = useRouter()
  const [scores, setScores] = React.useState<Record<string, number>>(initialScores)
  const [note, setNote] = React.useState(initialNote)
  const [isSaving, setIsSaving] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const handleScoreChange = (pointId: string, score: number) => {
    setScores(prev => ({ ...prev, [pointId]: score }))
  }

  // Calculate total score based on weights
  let totalScore = 0
  criteriaList.forEach(criteria => {
    const pointIds = criteria.points.map(p => p.id)
    const answeredScores = pointIds.map(id => scores[id]).filter(s => s !== undefined) as number[]
    const totalPointScore = answeredScores.reduce((acc, curr) => acc + curr, 0)
    const averageScore = pointIds.length > 0 ? (totalPointScore / pointIds.length) : 0
    const weightedScore = (averageScore * criteria.weight) / 100
    totalScore += weightedScore
  })

  const handleSave = async (submit: boolean = false) => {
    if (submit) setIsSubmitting(true)
    else setIsSaving(true)

    try {
      const res = await fetchApi(`/evaluations/${assignmentId}`, {
        method: 'PUT',
        body: JSON.stringify({
          scores,
          notes: note,
          isSubmit: submit
        })
      })
      
      if (res.success) {
        if (submit) {
          alert("Penilaian berhasil di-submit secara permanen!")
          router.push("/juri/dashboard")
        } else {
          alert("Draft penilaian berhasil disimpan!")
        }
      } else {
        alert(res.error || "Gagal menyimpan penilaian.")
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan.")
    } finally {
      if (submit) setIsSubmitting(false)
      else setIsSaving(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#FFF8EA]">
      {/* Header */}
      <div className="bg-yec-white px-6 py-4 border-b border-[#DDD3C7] sticky top-0 z-10">
        <h2 className="text-xl font-bold text-yec-text">{teamName}</h2>
        <p className="text-sm text-yec-text-muted mt-1">Tahap Penilaian: <span className="font-semibold text-yec-text">{stage}</span></p>
        {isLocked && (
          <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            Penilaian Dikunci (Read-only)
          </div>
        )}
      </div>

      {/* Form Content */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {criteriaList.map(criteria => (
          <CriteriaSection
            key={criteria.id}
            criteria={criteria}
            scores={scores}
            onChangeScore={handleScoreChange}
            readOnly={isLocked}
          />
        ))}

        {/* Note section */}
        <section className="bg-yec-white rounded-2xl border border-[#DDD3C7] shadow-sm p-6">
          <label htmlFor="note" className="block text-sm font-semibold text-yec-text mb-2">
            Catatan Penilaian (Opsional)
          </label>
          <textarea
            id="note"
            rows={4}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            disabled={isLocked}
            placeholder="Tuliskan catatan khusus atau masukan untuk tim ini..."
            className="w-full rounded-xl border border-[#DDD3C7] bg-yec-white px-4 py-3 text-sm text-yec-text placeholder:text-yec-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yec-amber focus-visible:border-yec-amber disabled:opacity-50 disabled:bg-gray-50"
          />
        </section>
      </div>

      {/* Footer / Actions */}
      <div className="bg-yec-white px-6 py-4 border-t border-[#DDD3C7] flex flex-col sm:flex-row items-center justify-between gap-4 sticky bottom-0 z-10">
        <div className="text-left w-full sm:w-auto">
          <p className="text-sm text-yec-text-muted font-medium">Estimasi Nilai Akhir:</p>
          <p className="text-3xl font-bold text-yec-amber">{totalScore.toFixed(2)}</p>
          <p className="text-xs text-yec-text-muted mt-1">(Hanya indikasi berdasarkan bobot)</p>
        </div>
        
        {!isLocked && (
          <div className="flex w-full sm:w-auto gap-3">
            <Button 
              variant="outline" 
              onClick={() => handleSave(false)}
              disabled={isSaving || isSubmitting}
              isLoading={isSaving}
              className="flex-1 sm:flex-none"
            >
              Simpan Draft
            </Button>
            <Button 
              variant="primary" 
              onClick={() => handleSave(true)}
              disabled={isSaving || isSubmitting}
              isLoading={isSubmitting}
              className="flex-1 sm:flex-none"
            >
              Submit Penilaian
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
