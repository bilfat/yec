import * as React from "react"
import { CriterionPointField } from "./CriterionPointField"

export interface CriterionPoint {
  id: string
  label: string
}

export interface Criteria {
  id: string
  name: string
  weight: number
  points: CriterionPoint[]
}

interface CriteriaSectionProps {
  criteria: Criteria
  scores: Record<string, number>
  onChangeScore: (pointId: string, score: number) => void
  readOnly?: boolean
}

export function CriteriaSection({ criteria, scores, onChangeScore, readOnly = false }: CriteriaSectionProps) {
  
  // Calculate average score for this criteria section based on points
  const pointIds = criteria.points.map(p => p.id)
  const answeredScores = pointIds.map(id => scores[id]).filter(s => s !== undefined) as number[]
  const totalScore = answeredScores.reduce((acc, curr) => acc + curr, 0)
  const averageScore = pointIds.length > 0 ? (totalScore / pointIds.length) : 0
  const weightedScore = (averageScore * criteria.weight) / 100

  return (
    <section className="bg-yec-white rounded-2xl border border-[#DDD3C7] shadow-sm overflow-hidden mb-6">
      <div className="bg-yec-paper px-6 py-4 border-b border-[#DDD3C7] flex items-center justify-between">
        <h3 className="font-serif text-lg font-bold text-yec-text">{criteria.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-yec-text-secondary bg-yec-cream px-2 py-1 rounded-md">
            Bobot: {criteria.weight}%
          </span>
        </div>
      </div>
      
      <div className="p-6 space-y-4">
        {criteria.points.map(point => (
          <CriterionPointField
            key={point.id}
            id={point.id}
            label={point.label}
            score={scores[point.id]}
            onChangeScore={onChangeScore}
            readOnly={readOnly}
          />
        ))}
      </div>

      <div className="bg-gray-50 px-6 py-3 border-t border-[#DDD3C7] flex justify-end items-center gap-4">
        <div className="text-sm text-yec-text-muted">
          Rata-rata: <span className="font-semibold text-yec-text">{averageScore.toFixed(1)}</span>
        </div>
        <div className="text-sm text-yec-text-muted">
          Nilai Tertimbang: <span className="font-semibold text-yec-amber">{weightedScore.toFixed(2)}</span>
        </div>
      </div>
    </section>
  )
}
