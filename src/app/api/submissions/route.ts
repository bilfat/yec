import { NextResponse } from 'next/server'
import { getParticipantSession } from '@/lib/auth-helpers'
import { createAdminClient } from '@/lib/supabase/server'
import { uploadSubmissionFile } from '@/lib/storage/supabase'

export async function POST(request: Request) {
  try {
    const session = await getParticipantSession()
    
    if (!session || !session.teamId) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Silakan login terlebih dahulu.' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const stage = (formData.get('stage') as string) || 'BMC'
    const rawSubthemeId = (formData.get('subtheme_id') as string) || (formData.get('subtheme') as string) || null
    const subthemeId = (rawSubthemeId && rawSubthemeId.trim() !== '') ? rawSubthemeId.trim() : null

    if (!file) {
      return NextResponse.json({ success: false, error: 'File wajib diunggah' }, { status: 400 })
    }

    if (stage !== 'BMC' && stage !== 'PITCHING') {
      return NextResponse.json({ success: false, error: 'Stage tidak valid' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // 1. Cek setting pengumpulan kompetisi
    const { data: settings } = await supabase.from('competition_settings').select('*').limit(1).maybeSingle()

    if (stage === 'BMC' && settings && settings.bmc_submission_open === false) {
      return NextResponse.json({ success: false, error: 'Pengumpulan karya BMC saat ini sedang ditutup.' }, { status: 400 })
    }

    if (stage === 'PITCHING' && settings && settings.pitching_submission_open === false) {
      return NextResponse.json({ success: false, error: 'Pengumpulan file Pitching saat ini sedang ditutup.' }, { status: 400 })
    }

    // 2. Validasi ukuran dan tipe file (Max 10MB)
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB
    if (file.size > MAX_SIZE) {
      return NextResponse.json({ success: false, error: 'Ukuran file melebihi batas maksimal 10MB' }, { status: 400 })
    }

    const allowedMimes = [
      'application/pdf',
      'application/vnd.ms-powerpoint',
      'application/vnd.openxmlformats-officedocument.presentationml.presentation'
    ]
    if (!allowedMimes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Format file tidak didukung. Harap unggah PDF/PPT/PPTX.' }, { status: 400 })
    }

    // 3. Upload file ke Supabase Storage
    const { path: storagePath, error: uploadError } = await uploadSubmissionFile({
      teamId: String(session.teamId),
      stage: stage as 'BMC' | 'PITCHING',
      file: file as File
    })


    if (uploadError || !storagePath) {
      return NextResponse.json({ success: false, error: uploadError || 'Gagal menyimpan file ke Supabase Storage' }, { status: 500 })
    }

    // 4. Update subtheme tim jika dikirimkan
    if (subthemeId) {
      await supabase
        .from('teams')
        .update({ subtheme_id: subthemeId, updated_at: new Date().toISOString() })
        .eq('id', session.teamId)
    }

    // 5. Check if submission record already exists
    const { data: existingSub } = await supabase
      .from('submissions')
      .select('id')
      .eq('team_id', session.teamId)
      .eq('stage', stage)
      .maybeSingle()

    let submissionRecord
    const payload: any = {
      original_filename: file.name,
      storage_path: storagePath,
      mime_type: file.type,
      file_size: file.size,
      updated_at: new Date().toISOString()
    }
    if (subthemeId) {
      payload.subtheme_id = subthemeId
    }

    if (existingSub) {
      const { data, error: updateErr } = await supabase
        .from('submissions')
        .update(payload)
        .eq('id', existingSub.id)
        .select()
        .single()

      if (updateErr) throw updateErr
      submissionRecord = data
    } else {
      const { data, error: insertErr } = await supabase
        .from('submissions')
        .insert({
          team_id: session.teamId,
          stage,
          ...payload
        })
        .select()
        .single()

      if (insertErr) throw insertErr
      submissionRecord = data
    }

    return NextResponse.json({
      success: true,
      data: submissionRecord,
      message: 'Karya berhasil diunggah'
    })
  } catch (error: any) {
    console.error('Submission upload error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}