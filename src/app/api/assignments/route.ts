import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess, getUserRole, getCurrentUser } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const role = await getUserRole()
    if (role !== 'ADMIN' && role !== 'JUDGE') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }

    const supabase = createAdminClient()

    let query = supabase.from('assignments').select(`
      *,
      users (id, name),
      teams (id, name, subtheme_id),
      assignment_criteria ( criterion_id )
    `)

    // If Judge, only show their own assignments
    if (role === 'JUDGE') {
      const user = await getCurrentUser()
      if (!user) {
        return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
      }
      query = query.eq('judge_id', user.id)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data, message: 'Berhasil mengambil penugasan juri' })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server'
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: errMessage } }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    await checkAdminAccess()
    const supabase = createAdminClient()
    const body = await request.json()

    // Server Validation: If stage is PITCHING, team must have result_status PASSED in BMC stage
    if (body.stage === 'PITCHING') {
      const { data: bmcResult } = await supabase
        .from('team_stage_results')
        .select('result_status')
        .eq('team_id', body.teamId)
        .eq('stage', 'BMC')
        .maybeSingle()

      if (!bmcResult || bmcResult.result_status !== 'PASSED') {
        return NextResponse.json({
          success: false,
          error: { code: 'BAD_REQUEST', message: 'Tim belum dinyatakan PASSED pada tahap BMC untuk mengikuti tahap Pitching.' }
        }, { status: 400 })
      }
    }

    // Insert assignment
    const { data: assignment, error } = await supabase
      .from('assignments')
      .insert({
        judge_id: body.judgeId,
        team_id: body.teamId,
        stage: body.stage,
        assignment_scope: body.assignmentScope // 'ALL' or 'CRITERIA'
      })
      .select()
      .single()

    if (error) throw error

    // If specific criteria, insert them
    if (body.assignmentScope === 'CRITERIA' && body.criteriaIds && body.criteriaIds.length > 0) {
      const criteriaInserts = body.criteriaIds.map((cid: string) => ({
        assignment_id: assignment.id,
        criterion_id: cid
      }))

      const { error: critError } = await supabase
        .from('assignment_criteria')
        .insert(criteriaInserts)
        
      if (critError) {
        // Rollback assignment
        await supabase.from('assignments').delete().eq('id', assignment.id)
        throw critError
      }
    }

    // Fetch complete newly created assignment with relations
    const { data: fullAssignment } = await supabase.from('assignments').select(`
      *,
      users (id, name),
      teams (id, name),
      assignment_criteria ( criterion_id )
    `).eq('id', assignment.id).single()

    return NextResponse.json({ success: true, data: fullAssignment, message: 'Penugasan juri berhasil dibuat' }, { status: 201 })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server'
    if (errMessage === 'Unauthorized') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: errMessage } }, { status: 500 })
  }
}
