import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user || (user.role !== 'JUDGE' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 1. Fetch competition settings for stage evaluation open statuses
    const { data: settings } = await supabase
      .from('competition_settings')
      .select('bmc_evaluation_open, pitching_evaluation_open')
      .limit(1)
      .maybeSingle()

    const bmcEvalOpen = settings?.bmc_evaluation_open ?? false
    const pitchingEvalOpen = settings?.pitching_evaluation_open ?? false

    // 2. Auto-sync Pitching assignments for teams that PASSED BMC stage for all active judges
    const { data: bmcPassedResults } = await supabase
      .from('team_stage_results')
      .select('team_id')
      .eq('stage', 'BMC')
      .eq('result_status', 'PASSED')

    const passedTeamIds = (bmcPassedResults || []).map(r => r.team_id)

    if (passedTeamIds.length > 0) {
      const { data: activeJudges } = await supabase
        .from('users')
        .select('id')
        .eq('role', 'JUDGE')
        .eq('active', true)

      const { data: existingPitchingAssigns } = await supabase
        .from('assignments')
        .select('judge_id, team_id')
        .eq('stage', 'PITCHING')

      const existingSet = new Set(
        (existingPitchingAssigns || []).map(a => `${a.judge_id}_${a.team_id}`)
      )

      const missingInserts: { judge_id: string; team_id: string; stage: 'PITCHING'; assignment_scope: 'ALL' }[] = []

      for (const teamId of passedTeamIds) {
        for (const judge of (activeJudges || [])) {
          const key = `${judge.id}_${teamId}`
          if (!existingSet.has(key)) {
            missingInserts.push({
              judge_id: judge.id,
              team_id: teamId,
              stage: 'PITCHING',
              assignment_scope: 'ALL'
            })
          }
        }
      }

      if (missingInserts.length > 0) {
        await supabase.from('assignments').insert(missingInserts)
      }
    }

    // 3. Fetch locked stage results
    const { data: stageResults } = await supabase
      .from('team_stage_results')
      .select('team_id, stage, locked_at')

    const lockedMap = new Set(
      (stageResults || [])
        .filter(r => r.locked_at)
        .map(r => `${r.team_id}_${r.stage}`)
    )

    // 4. Fetch assignments for this user
    let query = supabase
      .from('assignments')
      .select(`
        id,
        judge_id,
        team_id,
        stage,
        assignment_scope,
        created_at,
        teams (
          id,
          name,
          subthemes ( name, description )
        ),
        evaluations (
          id,
          status,
          updated_at
        )
      `)
      .order('created_at', { ascending: false })

    if (user.role === 'JUDGE') {
      query = query.eq('judge_id', user.id)
    }

    const { data: assignments, error } = await query

    if (error) {
      console.error('Error fetching judge evaluations:', error)
      throw error
    }

    const formattedData = (assignments || []).map((assignment: any) => {
      const evaluation = assignment.evaluations?.[0] || null
      const team = assignment.teams
      const isEvalOpen = assignment.stage === 'BMC' ? bmcEvalOpen : pitchingEvalOpen
      const isLocked = lockedMap.has(`${assignment.team_id}_${assignment.stage}`)

      return {
        id: team?.id || assignment.team_id,
        assignmentId: assignment.id,
        teamName: team?.name || 'Tim Panitia',
        subtheme: team?.subthemes?.name || 'Umum',
        subthemeTitle: team?.subthemes?.name || 'Belum memilih',
        subthemeDescription: team?.subthemes?.description || null,
        stage: assignment.stage,
        scope: assignment.assignment_scope,
        status: evaluation?.status || 'PENDING',
        evaluationId: evaluation?.id || null,
        isEvaluationOpen: isEvalOpen,
        isLocked: isLocked
      }
    })

    return NextResponse.json({
      success: true,
      data: formattedData,
      message: 'Berhasil mengambil data tugas penilaian'
    })
  } catch (error: any) {
    console.error('Evaluations GET error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}


