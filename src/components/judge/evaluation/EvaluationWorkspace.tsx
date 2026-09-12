"use client"

import * as React from "react"
import { PdfViewer } from "./PdfViewer"
import { EvaluationPanel } from "./EvaluationPanel"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/Button"
import { fetchApi } from "@/lib/api"

interface EvaluationData {
  id: string | null
  assignmentId: string
  teamId: string
  teamName: string
  subthemeName: string
  stage: string
  status: string
  isLocked: boolean
  submission?: {
    id: string
    originalFilename: string
    fileSize: number
    signedUrl: string | null
  } | null
  template?: {
    id: string
    name: string
    criteriaList: Array<{
      id: string
      name: string
      weight: number
      points: Array<{ id: string; label: string }>
    }>
  } | null
  scores: Record<string, number>
  notes: string
}

interface EvaluationWorkspaceProps {
  assignmentId: string
}

export function EvaluationWorkspace({ assignmentId }: EvaluationWorkspaceProps) {
  const [isLoading, setIsLoading] = React.useState(true)
  const [evalData, setEvalData] = React.useState<EvaluationData | null>(null)

  React.useEffect(() => {
    const fetchEval = async () => {
      setIsLoading(true)
      const res = await fetchApi<EvaluationData>(`/evaluations/${assignmentId}`)
      if (res.success && res.data) {
        setEvalData(res.data)
      }
      setIsLoading(false)
    }
    fetchEval()
  }, [assignmentId])
  
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-yec-white">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-yec-amber border-t-transparent" />
      </div>
    )
  }

  if (!evalData) {
    return (
      <div className="flex h-screen items-center justify-center bg-yec-white">
        <p className="text-yec-text-muted">Data evaluasi tidak ditemukan.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen bg-yec-white overflow-hidden">
      {/* Top Navbar for mobile (optional) or back button */}
      <div className="bg-yec-brown text-yec-white h-12 flex items-center px-4 shrink-0 shadow-sm z-20">
        <Button asChild variant="ghost" size="sm" className="text-yec-white hover:bg-yec-brown-dark hover:text-yec-white -ml-2">
          <Link href="/juri/dashboard">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Kembali ke Dashboard
          </Link>
        </Button>
        <div className="ml-4 text-sm font-medium opacity-80 hidden sm:block">
          Workspace Penilaian — ID: {assignmentId}
        </div>
      </div>

      {/* Split Screen Layout */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        {/* PDF Viewer - 55% on desktop */}
        <div className="w-full h-[50vh] lg:h-auto lg:w-[55%] shrink-0 lg:shrink flex flex-col">
          <PdfViewer 
            pdfUrl={evalData.submission?.signedUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}
            fileName={evalData.submission?.originalFilename || `${evalData.stage}_${evalData.teamName.replace(/\s+/g, '_')}.pdf`}
          />
        </div>

        {/* Evaluation Form - 45% on desktop */}
        <div className="w-full h-full lg:w-[45%] shrink-0 lg:shrink overflow-hidden border-t lg:border-t-0 border-[#DDD3C7]">
          <EvaluationPanel 
            assignmentId={assignmentId}
            teamName={evalData.teamName}
            stage={`Tahap ${evalData.stage}`}
            criteriaList={evalData.template?.criteriaList || []}
            initialScores={evalData.scores || {}}
            initialNote={evalData.notes || ""}
            isLocked={evalData.isLocked || evalData.status === "LOCKED"}
          />
        </div>

      </div>
    </div>
  )
}
