import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/auth-helpers'

export async function GET() {
  try {
    await checkAdminAccess()

    const supabase = createAdminClient()

    // 1. Total teams
    const { count: totalTeams } = await supabase
      .from('teams')
      .select('*', { count: 'exact', head: true })
      .eq('active', true)

    // 2. BMC Submissions count
    const { count: bmcSubmitted } = await supabase
      .from('submissions')
      .select('*', { count: 'exact', head: true })
      .eq('stage', 'BMC')

    // 3. Passed teams count (BMC or Pitching)
    const { count: passedPitching } = await supabase
      .from('team_stage_results')
      .select('*', { count: 'exact', head: true })
      .eq('result_status', 'PASSED')

    // 4. Pending evaluations count
    const { count: pendingEvaluation } = await supabase
      .from('evaluations')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'PENDING')

    // 5. Competition settings
    const { data: settings } = await supabase
      .from('competition_settings')
      .select('*')
      .limit(1)
      .maybeSingle()

    // 6. Recent activities feed (from latest submissions & evaluations)
    const { data: recentSubmissions } = await supabase
      .from('submissions')
      .select('submitted_at, stage, original_filename, teams(name)')
      .order('submitted_at', { ascending: false })
      .limit(5)

    const recentActivities: {
      team: string
      action: string
      time: string
      type: "success" | "info" | "warning"
    }[] = (recentSubmissions || []).map((sub: any) => ({
      team: sub.teams?.name || 'Tim Peserta',
      action: `Mengunggah berkas ${sub.stage} (${sub.original_filename})`,
      time: sub.submitted_at ? new Date(sub.submitted_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) : 'Baru saja',
      type: 'info'
    }))

    if (recentActivities.length === 0) {
      recentActivities.push({
        team: 'Sistem YEC',
        action: 'Sistem siap menerima pendaftaran dan karya tim peserta.',
        time: 'Baru saja',
        type: 'success'
      })
    }


    return NextResponse.json({
      success: true,
      data: {
        stats: {
          totalTeams: totalTeams || 0,
          bmcSubmitted: bmcSubmitted || 0,
          passedPitching: passedPitching || 0,
          pendingEvaluation: pendingEvaluation || 0
        },
        recentActivities,
        stages: {
          bmcSubmission: settings?.bmc_submission_open ? 'OPEN' : 'CLOSED',
          bmcEvaluation: settings?.bmc_evaluation_open ? 'OPEN' : 'CLOSED',
          pitching: settings?.pitching_submission_open ? 'OPEN' : 'CLOSED',
          pitchingEvaluation: settings?.pitching_evaluation_open ? 'OPEN' : 'CLOSED'
        }
      },
      message: 'Berhasil mengambil ikhtisar dashboard admin'
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }
    console.error('Dashboard summary GET error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}
