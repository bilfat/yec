import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth-helpers'
import { getActiveOrFallbackTemplate } from '@/lib/evaluation-helpers'

const BUCKET_NAME = process.env.STORAGE_BUCKET || 'yec-private-submissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params
    const user = await getCurrentUser()

    if (!user || (user.role !== 'JUDGE' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // 1. Fetch assignment details
    const { data: assignment, error: assignError } = await supabase
      .from('assignments')
      .select(`
        id,
        judge_id,
        team_id,
        stage,
        assignment_scope,
        teams (
          id,
          name,
          subthemes ( name )
        )
      `)
      .eq('id', assignmentId)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json({ success: false, error: 'Penugasan juri tidak ditemukan' }, { status: 404 })
    }

    // Verify judge ownership if not Admin
    if (user.role === 'JUDGE' && assignment.judge_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Anda tidak berhak mengakses penugasan tim ini' }, { status: 403 })
    }

    // 2. Fetch active or fallback evaluation template for this stage
    const template = await getActiveOrFallbackTemplate(supabase, assignment.stage)

    // 3. Fetch submission for this team & stage
    const { data: submission } = await supabase
      .from('submissions')
      .select('id, original_filename, mime_type, file_size, storage_path')
      .eq('team_id', assignment.team_id)
      .eq('stage', assignment.stage)
      .maybeSingle()

    let signedUrl = null
    if (submission?.storage_path) {
      const { data: signedData } = await supabase.storage
        .from(BUCKET_NAME)
        .createSignedUrl(submission.storage_path, 900)
      signedUrl = signedData?.signedUrl || null
    }

    // 4. Fetch existing evaluation & scores for this assignment
    const { data: evaluation } = await supabase
      .from('evaluations')
      .select(`
        id,
        status,
        notes,
        submitted_at,
        evaluation_scores (
          criterion_point_id,
          score
        )
      `)
      .eq('assignment_id', assignmentId)
      .maybeSingle()

    // 5. Check if stage result is locked
    const { data: stageResult } = await supabase
      .from('team_stage_results')
      .select('locked_at')
      .eq('team_id', assignment.team_id)
      .eq('stage', assignment.stage)
      .maybeSingle()

    const isLocked = !!stageResult?.locked_at

    // Format criteria list for UI (Filter by assignment_criteria if scope = CRITERIA)
    let rawCriteria = (template?.criteria || []) as any[]

    if (assignment.assignment_scope === 'CRITERIA') {
      const { data: scopeCriteria } = await supabase
        .from('assignment_criteria')
        .select('criterion_id')
        .eq('assignment_id', assignmentId)

      if (scopeCriteria && scopeCriteria.length > 0) {
        const assignedIds = new Set(scopeCriteria.map((sc: any) => sc.criterion_id))
        const filtered = rawCriteria.filter((c: any) => assignedIds.has(c.id))
        if (filtered.length > 0) {
          rawCriteria = filtered
        }
      }
    }

    const criteriaList = rawCriteria
      .sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      .map((c: any) => ({
        id: c.id,
        name: c.name,
        weight: c.weight,
        points: (c.criterion_points || [])
          .sort((pa: any, pb: any) => (pa.sort_order || 0) - (pb.sort_order || 0))
          .map((p: any) => ({
            id: p.id,
            label: p.name
          }))
      }))

    // Format scores map
    const scoresMap: Record<string, number> = {}
    if (evaluation?.evaluation_scores) {
      evaluation.evaluation_scores.forEach((es: any) => {
        scoresMap[es.criterion_point_id] = es.score
      })
    }

    const teamObj = assignment.teams as any

    return NextResponse.json({
      success: true,
      data: {
        id: evaluation?.id || null,
        assignmentId: assignment.id,
        teamId: assignment.team_id,
        teamName: teamObj?.name || 'Tim Panitia',
        subthemeName: teamObj?.subthemes?.name || 'Umum',
        stage: assignment.stage,
        status: evaluation?.status || 'PENDING',
        isLocked,
        submission: submission ? {
          id: submission.id,
          originalFilename: submission.original_filename,
          fileSize: submission.file_size,
          signedUrl
        } : null,
        template: template ? {
          id: template.id,
          name: template.name,
          criteriaList
        } : null,
        scores: scoresMap,
        notes: evaluation?.notes || ''
      },
      message: 'Berhasil mengambil form evaluasi'
    })
  } catch (error: any) {
    console.error('Evaluations [id] GET error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: assignmentId } = await params
    const user = await getCurrentUser()

    if (!user || (user.role !== 'JUDGE' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const body = await request.json()
    const { scores = {}, notes = '', isSubmit = false } = body

    // 1. Fetch assignment
    const { data: assignment, error: assignError } = await supabase
      .from('assignments')
      .select('id, judge_id, team_id, stage')
      .eq('id', assignmentId)
      .single()

    if (assignError || !assignment) {
      return NextResponse.json({ success: false, error: 'Penugasan juri tidak ditemukan' }, { status: 404 })
    }

    if (user.role === 'JUDGE' && assignment.judge_id !== user.id) {
      return NextResponse.json({ success: false, error: 'Anda tidak berhak menilai tim ini' }, { status: 403 })
    }

    // Check stage evaluation setting for JUDGE
    if (user.role === 'JUDGE') {
      const { data: settings } = await supabase.from('competition_settings').select('*').limit(1).maybeSingle()
      if (assignment.stage === 'BMC' && settings && settings.bmc_evaluation_open === false) {
        return NextResponse.json({ success: false, error: 'Evaluasi Juri BMC saat ini sedang ditutup oleh Admin.' }, { status: 400 })
      }
      if (assignment.stage === 'PITCHING' && settings && settings.pitching_evaluation_open === false) {
        return NextResponse.json({ success: false, error: 'Evaluasi Juri Pitching saat ini sedang ditutup oleh Admin.' }, { status: 400 })
      }
    }

    // 2. Check if stage result is locked
    const { data: stageResult } = await supabase
      .from('team_stage_results')
      .select('locked_at')
      .eq('team_id', assignment.team_id)
      .eq('stage', assignment.stage)
      .maybeSingle()

    if (stageResult?.locked_at) {
      return NextResponse.json({ success: false, error: 'Penilaian tim ini sudah dikunci oleh Admin dan tidak dapat diubah.' }, { status: 400 })
    }

    // 3. Get submission ID if exists
    const { data: submission } = await supabase
      .from('submissions')
      .select('id')
      .eq('team_id', assignment.team_id)
      .eq('stage', assignment.stage)
      .maybeSingle()

    // 4. Find existing evaluation or create new one
    const { data: existingEval } = await supabase
      .from('evaluations')
      .select('id')
      .eq('assignment_id', assignmentId)
      .maybeSingle()

    let evalId = existingEval?.id

    const newStatus = isSubmit ? 'COMPLETED' : 'PENDING'
    const nowIso = new Date().toISOString()

    if (existingEval) {
      const { error: updateError } = await supabase
        .from('evaluations')
        .update({
          submission_id: submission?.id || null,
          status: newStatus,
          notes: notes || '',
          submitted_at: isSubmit ? nowIso : null,
          updated_at: nowIso
        })
        .eq('id', existingEval.id)

      if (updateError) throw updateError
    } else {
      const { data: newEval, error: insertError } = await supabase
        .from('evaluations')
        .insert({
          assignment_id: assignmentId,
          submission_id: submission?.id || null,
          status: newStatus,
          notes: notes || '',
          submitted_at: isSubmit ? nowIso : null
        })
        .select('id')
        .single()

      if (insertError) throw insertError
      evalId = newEval.id
    }

    // 5. Upsert scores into evaluation_scores
    const scoreEntries = Object.entries(scores)
    if (scoreEntries.length > 0 && evalId) {
      for (const [pointId, scoreValue] of scoreEntries) {
        const numScore = Number(scoreValue)
        if (!isNaN(numScore) && pointId) {
          // Check existing score
          const { data: existingScore } = await supabase
            .from('evaluation_scores')
            .select('id')
            .eq('evaluation_id', evalId)
            .eq('criterion_point_id', pointId)
            .maybeSingle()

          if (existingScore) {
            await supabase
              .from('evaluation_scores')
              .update({
                score: numScore,
                updated_at: nowIso
              })
              .eq('id', existingScore.id)
          } else {
            await supabase
              .from('evaluation_scores')
              .insert({
                evaluation_id: evalId,
                criterion_point_id: pointId,
                score: numScore
              })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: isSubmit ? 'Penilaian berhasil disubmit' : 'Draft penilaian berhasil disimpan'
    })
  } catch (error: any) {
    console.error('Evaluations [id] PUT error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}

