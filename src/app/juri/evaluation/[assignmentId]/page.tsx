import { Metadata } from "next"
import { EvaluationWorkspace } from "@/components/judge/evaluation/EvaluationWorkspace"

export const metadata: Metadata = {
  title: "Penilaian Peserta | Young Entrepreneur Camp",
  description: "Workspace penilaian juri YEC",
}

interface PageProps {
  params: Promise<{
    assignmentId: string
  }>
}

export default async function JuriEvaluationPage({ params }: PageProps) {
  const { assignmentId } = await params
  return <EvaluationWorkspace assignmentId={assignmentId} />
}

