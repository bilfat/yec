import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/auth-helpers'
import { calculateJudgeTotalScore, calculateFinalAggregatedScore } from '@/lib/scoring'
import { getActiveOrFallbackTemplate } from '@/lib/evaluation-helpers'

export async function GET(request: Request) {
  try {
    await checkAdminAccess()

    const { searchParams } = new URL(request.url)
    const stage = (searchParams.get('stage') as 'BMC' | 'PITCHING') || 'BMC'

    const supabase = createAdminClient()

    // 1. Fetch active or fallback template for this stage
    const template = await getActiveOrFallbackTemplate(supabase, stage)

    const criteriaList = ((template?.criteria as any[]) || [])
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        points: (c.criterion_points || [])
          .sort((pa: any, pb: any) => (pa.sort_order || 0) - (pb.sort_order || 0))
          .map((p: any) => ({ id: p.id, name: p.name }))
      }))

    // 2. Fetch all active teams with subthemes
    const { data: teams, error: teamsErr } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        subthemes ( name )
      `)
      .eq('active', true)
      .order('name', { ascending: true })

    if (teamsErr) throw teamsErr

    // 3. Fetch submissions for this stage
    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('stage', stage)

    // 4. Fetch assignments for this stage joined with evaluations & scores
    const { data: assignments } = await supabase
      .from('assignments')
      .select(`
        id,
        judge_id,
        team_id,
        stage,
        users ( id, name, role ),
        evaluations (
          id,
          status,
          notes,
          submitted_at,
          evaluation_scores (
            criterion_point_id,
            score
          )
        )
      `)
      .eq('stage', stage)

    // 5. Fetch team_stage_results for all stages to check BMC passed status
    const { data: allStageResults } = await supabase
      .from('team_stage_results')
      .select('*')

    const bmcPassedTeamIds = new Set(
      (allStageResults || [])
        .filter(r => r.stage === 'BMC' && r.result_status === 'PASSED')
        .map(r => r.team_id)
    )

    const stageResults = (allStageResults || []).filter(r => r.stage === stage)

    // Filter eligible teams for Pitching stage
    const eligibleTeams = (teams || []).filter(team => {
      if (stage === 'PITCHING') {
        return bmcPassedTeamIds.has(team.id)
      }
      return true
    })

    // 6. Assemble team evaluation results
    const teamResults = eligibleTeams.map((team: any) => {
      const teamSub = submissions?.find(s => s.team_id === team.id) || null
      const teamAssigns = assignments?.filter(a => a.team_id === team.id) || []
      const teamResult = stageResults?.find(r => r.team_id === team.id) || null

      const judgeDetails: any[] = []
      const judgeScores: number[] = []
      let completedJudgeCount = 0

      teamAssigns.forEach((assign: any) => {
        const evalObj = assign.evaluations?.[0] || null
        const judgeUser = assign.users

        if (evalObj && evalObj.status === 'COMPLETED') {
          completedJudgeCount++

          // Build scoresMap
          const scoresMap: Record<string, number> = {}
          if (evalObj.evaluation_scores) {
            evalObj.evaluation_scores.forEach((es: any) => {
              scoresMap[es.criterion_point_id] = es.score
            })
          }

          const { totalScore, criteriaBreakdown } = calculateJudgeTotalScore({
            criteriaList,
            scoresMap
          })

          judgeScores.push(totalScore)

          judgeDetails.push({
            judgeName: judgeUser?.name || 'Juri YEC',
            role: judgeUser?.role === 'ADMIN' ? 'Juri Utama (Admin)' : 'Dewan Juri',
            totalScore,
            note: evalObj.notes || '',
            criteriaScores: criteriaBreakdown
          })
        } else {
          judgeDetails.push({
            judgeName: judgeUser?.name || 'Juri YEC',
            role: judgeUser?.role === 'ADMIN' ? 'Juri Utama (Admin)' : 'Dewan Juri',
            totalScore: 0,
            note: 'Belum memberikan penilaian.',
            criteriaScores: []
          })
        }
      })

      const averageScore = teamResult?.final_score ?? calculateFinalAggregatedScore(judgeScores)
      const judgeCount = teamAssigns.length
      const isCompleted = judgeCount > 0 && completedJudgeCount === judgeCount

      return {
        id: team.id,
        name: team.name,
        subtheme: team.subthemes?.name || 'Umum',
        submissionId: teamSub?.id || null,
        pdfName: teamSub?.original_filename || 'Belum Unggah',
        pitchingFile: teamSub?.original_filename || 'Belum Unggah',
        submittedAt: teamSub?.submitted_at ? new Date(teamSub.submitted_at).toLocaleString('id-ID') : '-',
        judgeCount,
        completedJudgeCount,
        averageScore,
        status: isCompleted ? 'COMPLETED' : 'PENDING',
        resultStatus: teamResult?.result_status || 'UNDECIDED',
        judgeDetails
      }
    })

    // If PITCHING stage, sort by averageScore descending and attach ranks
    if (stage === 'PITCHING') {
      teamResults.sort((a, b) => (b.averageScore || 0) - (a.averageScore || 0))
      teamResults.forEach((t, idx) => {
        (t as any).rank = idx + 1
      })
    }

    return NextResponse.json({
      success: true,
      data: teamResults,
      message: 'Berhasil mengambil data hasil evaluasi'
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    console.error('Results GET error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}

