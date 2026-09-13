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
        evaluationId: evaluation?.id || null
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

