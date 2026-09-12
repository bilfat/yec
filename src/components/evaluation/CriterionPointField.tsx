import * as React from "react"
import { ScoreInput } from "./ScoreInput"
import { cn } from "@/lib/utils"

interface CriterionPointFieldProps {
  id: string
  label: string
  score: number | undefined
  onChangeScore: (id: string, score: number) => void
  readOnly?: boolean
}

export function CriterionPointField({ id, label, score, onChangeScore, readOnly = false }: CriterionPointFieldProps) {
  return (
    <div className={cn("flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border",
      readOnly ? "bg-gray-50 border-gray-200" : "bg-yec-white border-[#DDD3C7] hover:border-yec-amber/50 transition-colors"
    )}>
      <div className="flex-1">
        <p className={cn("text-sm sm:text-base font-medium text-yec-text", readOnly && "text-yec-text-secondary")}>
          {label}
        </p>
      </div>
      <div className="shrink-0 flex items-center gap-3">
        <span className="text-sm font-semibold text-yec-text-muted">Nilai:</span>
        <ScoreInput
          value={score}
          onChange={(val) => onChangeScore(id, val)}
          disabled={readOnly}
          className={readOnly ? "bg-transparent border-transparent px-0 font-bold text-yec-text w-16" : ""}
        />
      </div>
    </div>
  )
}
