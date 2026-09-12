"use client"

import * as React from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { StageType } from "./StageTabs"
import Link from "next/link"

export type EvaluationStatus = "PENDING" | "COMPLETED" | "LOCKED"

export interface AssignedTeam {
  id: string
  assignmentId: string
  teamName: string
  stage: StageType
  status: EvaluationStatus
}

interface AssignedTeamTableProps {
  teams: AssignedTeam[]
}

export function AssignedTeamTable({ teams }: AssignedTeamTableProps) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-yec-white rounded-2xl border border-[#DDD3C7]">
        <div className="h-12 w-12 rounded-full bg-yec-paper flex items-center justify-center mb-4 text-yec-text-muted">
          {/* Placeholder for empty state icon */}
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-yec-text">Belum ada tim yang ditugaskan</h3>
        <p className="mt-1 text-sm text-yec-text-muted max-w-sm">
          Saat ini belum ada tugas penilaian untuk tahap ini. Silakan kembali lagi nanti.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full overflow-x-auto bg-yec-white rounded-2xl border border-[#DDD3C7] shadow-sm">
      <table className="w-full text-left text-sm whitespace-nowrap">
        <thead className="bg-yec-paper border-b border-[#DDD3C7]">
          <tr>
            <th className="px-6 py-4 font-semibold text-yec-text">Nama Tim</th>
            <th className="px-6 py-4 font-semibold text-yec-text">Tahap</th>
            <th className="px-6 py-4 font-semibold text-yec-text">Status Evaluasi</th>
            <th className="px-6 py-4 font-semibold text-yec-text text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDD3C7]">
          {teams.map((team) => (
            <tr key={team.assignmentId} className="hover:bg-yec-paper/50 transition-colors">
              <td className="px-6 py-4 font-medium text-yec-text">{team.teamName}</td>
              <td className="px-6 py-4 text-yec-text-secondary">{team.stage}</td>
              <td className="px-6 py-4">
                <Badge
                  variant={
                    team.status === "COMPLETED" ? "success" :
                    team.status === "LOCKED" ? "default" : "warning"
                  }
                >
                  {team.status}
                </Badge>
              </td>
              <td className="px-6 py-4 text-right">
                <Button asChild size="sm" variant={team.status === "LOCKED" ? "outline" : "primary"}>
                  <Link href={`/juri/evaluation/${team.assignmentId}`}>
                    {team.status === "LOCKED" ? "Lihat Penilaian" : "Mulai Nilai"}
                  </Link>
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
