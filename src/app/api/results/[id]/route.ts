import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/auth-helpers'
import { calculateJudgeTotalScore, calculateFinalAggregatedScore } from '@/lib/scoring'
import { getActiveOrFallbackTemplate } from '@/lib/evaluation-helpers'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: teamId } = await params
    await checkAdminAccess()

    const body = await request.json()
    const stage = (body.stage as 'BMC' | 'PITCHING') || 'BMC'
    const resultStatus = body.resultStatus as 'PASSED' | 'FAILED'

    if (!resultStatus || (resultStatus !== 'PASSED' && resultStatus !== 'FAILED')) {
      return NextResponse.json({ success: false, error: 'Status hasil tidak valid' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Fetch active or fallback template for this stage to calculate final score
    const template = await getActiveOrFallbackTemplate(supabase, stage)

    const criteriaList = ((template?.criteria as any[]) || []).map((c: any) => ({
      id: c.id,
      name: c.name,
      weight: c.weight,
      points: (c.criterion_points || []).map((p: any) => ({ id: p.id, name: p.name }))
    }))

    // 2. Fetch assignments & completed evaluations for this team
    const { data: assignments } = await supabase
      .from('assignments')
      .select(`
        id,
        evaluations (
          id,
          status,
          evaluation_scores ( criterion_point_id, score )
        )
      `)
      .eq('team_id', teamId)
      .eq('stage', stage)

    const totalAssignments = (assignments || []).length
    let completedEvaluationsCount = 0
    const judgeScores: number[] = []

    for (const a of (assignments || [])) {
      const evalObj = (a as any).evaluations?.[0]
      if (evalObj && evalObj.status === 'COMPLETED') {
        completedEvaluationsCount++

        const scoresMap: Record<string, number> = {}
        if (evalObj.evaluation_scores) {
          evalObj.evaluation_scores.forEach((es: any) => {
            scoresMap[es.criterion_point_id] = es.score
          })
        }

        const { totalScore } = calculateJudgeTotalScore({ criteriaList, scoresMap })
        judgeScores.push(totalScore)
      }
    }

    if (totalAssignments === 0 || completedEvaluationsCount < totalAssignments) {
      return NextResponse.json({
        success: false,
        error: 'Tidak dapat menetapkan status. Seluruh juri penilai yang ditugaskan harus menyelesaikan penilaian terlebih dahulu.'
      }, { status: 400 })
    }

    const finalScore = calculateFinalAggregatedScore(judgeScores) || 0
    const nowIso = new Date().toISOString()

    // 3. Check existing team_stage_result
    const { data: existingResult } = await supabase
      .from('team_stage_results')
      .select('id')
      .eq('team_id', teamId)
      .eq('stage', stage)
      .maybeSingle()

    if (existingResult) {
      const { error: updateErr } = await supabase
        .from('team_stage_results')
        .update({
          final_score: finalScore,
          result_status: resultStatus,
          locked_at: nowIso,
          updated_at: nowIso
        })
        .eq('id', existingResult.id)

      if (updateErr) throw updateErr
    } else {
      const { error: insertErr } = await supabase
        .from('team_stage_results')
        .insert({
          team_id: teamId,
          stage,
          final_score: finalScore,
          result_status: resultStatus,
          locked_at: nowIso
        })

      if (insertErr) throw insertErr
    }

    return NextResponse.json({
      success: true,
      data: { teamId, stage, finalScore, resultStatus, lockedAt: nowIso },
      message: `Berhasil menetapkan status ${resultStatus} dan mengunci nilai`
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    console.error('Results PUT error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}

