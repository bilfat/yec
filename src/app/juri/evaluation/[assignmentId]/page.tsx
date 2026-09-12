import { Metadata } from "next"
import { EvaluationWorkspace } from "@/components/judge/evaluation/EvaluationWorkspace"

export const metadata: Metadata = {
  title: "Penilaian Peserta | Young Entrepreneur Camp",
  description: "Workspace penilaian juri YEC",
}

interface PageProps {
  params: {
    assignmentId: string
  }
}

export default function JuriEvaluationPage({ params }: PageProps) {
  return <EvaluationWorkspace assignmentId={params.assignmentId} />
}
