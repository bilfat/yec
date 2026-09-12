"use client"

import { Check } from "lucide-react"

export type StageType = "BMC" | "EVALUATION" | "PITCHING" | "FINAL"

interface CompetitionProgressProps {
  currentStage: StageType
}

const STAGES = [
  { id: "BMC", label: "Business Model Canvas", type: "action" },
  { id: "EVALUATION", label: "Evaluasi & Penilaian", type: "wait" },
  { id: "PITCHING", label: "Pitching Session", type: "action" },
  { id: "FINAL", label: "Pengumuman Final", type: "result" },
]

export function CompetitionProgress({ currentStage }: CompetitionProgressProps) {
  const currentIndex = STAGES.findIndex(s => s.id === currentStage)

  return (
    <div className="rounded-[20px] bg-yec-white p-6 shadow-card">
      <h3 className="mb-6 font-display text-lg font-bold text-yec-brown">Progres Kompetisi</h3>
      <div className="relative">
        <div className="absolute left-[15px] top-4 bottom-4 w-0.5 bg-[#DDD3C7]"></div>
        
        <div className="flex flex-col gap-6">
          {STAGES.map((stage, index) => {
            const isCompleted = index < currentIndex
            const isActive = index === currentIndex
            
            return (
              <div key={stage.id} className="relative z-10 flex items-start gap-4">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-yec-white transition-colors ${
                  isCompleted 
                    ? "border-yec-amber bg-yec-amber text-yec-white" 
                    : isActive 
                      ? "border-yec-amber text-yec-amber" 
                      : "border-[#DDD3C7] text-transparent"
                }`}>
                  {isCompleted ? (
                    <Check className="h-4 w-4" strokeWidth={3} />
                  ) : (
                    <div className={`h-2.5 w-2.5 rounded-full ${isActive ? "bg-yec-amber" : "bg-transparent"}`} />
                  )}
                </div>
                <div className="pt-1.5">
                  <p className={`text-sm font-semibold ${isActive ? "text-yec-text" : isCompleted ? "text-yec-text" : "text-yec-text-muted"}`}>
                    {stage.label}
                  </p>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
