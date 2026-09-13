"use client"

import * as React from "react"
import { Badge } from "@/components/ui/Badge"
import { Button } from "@/components/ui/Button"
import { StageType } from "./StageTabs"
import Link from "next/link"
import { Lock, Edit3, Play } from "lucide-react"

export type EvaluationStatus = "PENDING" | "COMPLETED" | "LOCKED"

export interface AssignedTeam {
  id: string
  assignmentId: string
  teamName: string
  stage: StageType
  status: EvaluationStatus
  subthemeTitle?: string
  subthemeDescription?: string
  isEvaluationOpen?: boolean
  isLocked?: boolean
}

interface AssignedTeamTableProps {
  teams: AssignedTeam[]
}

export function AssignedTeamTable({ teams }: AssignedTeamTableProps) {
  if (teams.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-4 text-center bg-yec-white rounded-2xl border border-[#DDD3C7]">
        <div className="h-12 w-12 rounded-full bg-yec-paper flex items-center justify-center mb-4 text-yec-text-muted">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 012-2h2a2 2 0 012-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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
            <th className="px-6 py-4 font-semibold text-yec-text">Sub-tema</th>
            <th className="px-6 py-4 font-semibold text-yec-text">Tahap</th>
            <th className="px-6 py-4 font-semibold text-yec-text">Status Evaluasi</th>
            <th className="px-6 py-4 font-semibold text-yec-text text-right">Aksi</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#DDD3C7]">
          {teams.map((team) => {
            const isClosedByPanitia = team.isEvaluationOpen === false || team.isLocked === true || team.status === "LOCKED"
            const isCompleted = team.status === "COMPLETED"

            return (
              <tr key={team.assignmentId} className="hover:bg-yec-paper/50 transition-colors">
                <td className="px-6 py-4 font-medium text-yec-text">{team.teamName}</td>
                <td className="px-6 py-4 whitespace-normal min-w-[250px]">
                  {team.subthemeTitle ? (
                    <>
                      <div className="font-semibold text-yec-brown mb-1">{team.subthemeTitle}</div>
                      <div className="text-xs text-yec-text-secondary leading-tight line-clamp-2" title={team.subthemeDescription}>
                        {team.subthemeDescription || "Tidak ada keterangan"}
                      </div>
                    </>
                  ) : (
                    <span className="text-yec-text-muted italic text-xs">Belum memilih</span>
                  )}
                </td>
                <td className="px-6 py-4 text-yec-text-secondary">{team.stage}</td>
                <td className="px-6 py-4">
                  {isClosedByPanitia ? (
                    <Badge variant="default" className="gap-1">
                      <Lock className="h-3 w-3" /> TERKUNCI
                    </Badge>
                  ) : isCompleted ? (
                    <Badge variant="success">SELESAI</Badge>
                  ) : (
                    <Badge variant="warning">BELUM DINILAI</Badge>
                  )}
                </td>
                <td className="px-6 py-4 text-right">
                  {isClosedByPanitia ? (
                    <Button disabled size="sm" variant="outline" className="gap-1.5 opacity-60">
                      <Lock className="h-3.5 w-3.5" /> Terkunci
                    </Button>
                  ) : isCompleted ? (
                    <Button asChild size="sm" variant="outline" className="gap-1.5 border-yec-amber text-yec-brown hover:bg-yec-amber/15 font-semibold">
                      <Link href={`/juri/evaluation/${team.assignmentId}`}>
                        <Edit3 className="h-3.5 w-3.5 text-yec-amber" /> Edit Nilai
                      </Link>
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="primary" className="gap-1.5">
                      <Link href={`/juri/evaluation/${team.assignmentId}`}>
                        <Play className="h-3.5 w-3.5 fill-white" /> Mulai Nilai
                      </Link>
                    </Button>
                  )}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
