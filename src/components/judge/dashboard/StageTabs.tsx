"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

export type StageType = "BMC" | "PITCHING"

interface StageTabsProps {
  activeStage: StageType
  onStageChange: (stage: StageType) => void
  showPitching?: boolean
}

export function StageTabs({ activeStage, onStageChange, showPitching = true }: StageTabsProps) {
  return (
    <div className="flex space-x-1 bg-yec-paper p-1 rounded-xl border border-[#DDD3C7] w-fit">
      <button
        onClick={() => onStageChange("BMC")}
        className={cn(
          "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
          activeStage === "BMC"
            ? "bg-yec-white text-yec-text shadow-sm"
            : "text-yec-text-muted hover:text-yec-text"
        )}
      >
        Tahap BMC
      </button>
      {showPitching && (
        <button
          onClick={() => onStageChange("PITCHING")}
          className={cn(
            "px-4 py-2 rounded-lg text-sm font-semibold transition-colors",
            activeStage === "PITCHING"
              ? "bg-yec-white text-yec-text shadow-sm"
              : "text-yec-text-muted hover:text-yec-text"
          )}
        >
          Tahap Pitching
        </button>
      )}
    </div>
  )
}
