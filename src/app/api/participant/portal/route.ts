import { NextResponse } from 'next/server'
import { getParticipantSession } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const session = await getParticipantSession()
    
    if (!session || !session.teamId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 1. Fetch team details
    const { data: team, error: teamError } = await supabase
      .from('teams')
      .select('id, name, subtheme_id, subthemes(id, name)')
      .eq('id', session.teamId)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ success: false, error: 'Tim tidak ditemukan' }, { status: 404 })
    }
    
    // 2. Fetch competition settings
    const { data: settings } = await supabase.from('competition_settings').select('*').limit(1).single()

    // 3. Fetch submissions for this team
    const { data: submissions } = await supabase
      .from('submissions')
      .select('*')
      .eq('team_id', session.teamId)

    const bmcSubmission = submissions?.find(s => s.stage === 'BMC') || null
    const pitchingSubmission = submissions?.find(s => s.stage === 'PITCHING') || null

    // 4. Fetch stage results for this team
    const { data: stageResults } = await supabase
      .from('team_stage_results')
      .select('*')
      .eq('team_id', session.teamId)

    const bmcResult = stageResults?.find(r => r.stage === 'BMC') || null
    const pitchingResult = stageResults?.find(r => r.stage === 'PITCHING') || null

    // 5. Fetch active subthemes for dropdown
    const { data: activeSubthemes } = await supabase
      .from('subthemes')
      .select('id, name')
      .eq('active', true)
      .order('sort_order', { ascending: true })

    // 6. Calculate Portal State
    let state = 'READY'
    if (bmcResult?.result_status === 'FAILED') {
      state = 'FAILED'
    } else if (bmcResult?.result_status === 'PASSED') {
      state = pitchingSubmission ? 'PITCHING_SUBMITTED' : 'PASSED'
    } else if (bmcSubmission) {
      state = 'SUBMITTED'
    }

    return NextResponse.json({
      success: true,
      data: {
        team: {
          id: team.id,
          name: team.name,
          subtheme_id: team.subtheme_id,
          subtheme_name: (team.subthemes as any)?.name || null
        },
        state,
        settings: {
          competition_name: settings?.competition_name || 'Young Entrepreneur Camp 2026',
          announcements: settings?.announcements || null,
          participant_support_phone: settings?.participant_support_phone || '6281219843922',
          bmc_submission_open: settings?.bmc_submission_open ?? true,
          bmc_evaluation_open: settings?.bmc_evaluation_open ?? false,
          pitching_submission_open: settings?.pitching_submission_open ?? false,
          pitching_evaluation_open: settings?.pitching_evaluation_open ?? false
        },
        submissions: {
          bmc: bmcSubmission ? {
            id: bmcSubmission.id,
            original_filename: bmcSubmission.original_filename,
            file_size: bmcSubmission.file_size,
            created_at: bmcSubmission.created_at,
            subtheme_id: bmcSubmission.subtheme_id
          } : null,
          pitching: pitchingSubmission ? {
            id: pitchingSubmission.id,
            original_filename: pitchingSubmission.original_filename,
            file_size: pitchingSubmission.file_size,
            created_at: pitchingSubmission.created_at
          } : null
        },
        results: {
          bmc: bmcResult ? {
            final_score: bmcResult.final_score,
            result_status: bmcResult.result_status,
            locked_at: bmcResult.locked_at
          } : null,
          pitching: pitchingResult ? {
            final_score: pitchingResult.final_score,
            result_status: pitchingResult.result_status,
            locked_at: pitchingResult.locked_at
          } : null
        },
        activeSubthemes: activeSubthemes || []
      },
      message: 'Berhasil mengambil data portal'
    })
  } catch (error) {
    console.error('Portal state error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal' }, { status: 500 })
  }
}

