import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { getCurrentUser } from '@/lib/auth-helpers'

const BUCKET_NAME = process.env.STORAGE_BUCKET || 'yec-private-submissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const user = await getCurrentUser()

    if (!user || (user.role !== 'JUDGE' && user.role !== 'ADMIN')) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()

    // Query submission record by ID
    const { data: submission, error } = await supabase
      .from('submissions')
      .select('id, team_id, stage, storage_path, original_filename, mime_type, file_size')
      .eq('id', id)
      .single()

    if (error || !submission) {
      return NextResponse.json({ success: false, error: 'File submission tidak ditemukan' }, { status: 404 })
    }

    // IDOR Protection: If user is JUDGE, verify active assignment for this team & stage
    if (user.role === 'JUDGE') {
      const { data: assignment } = await supabase
        .from('assignments')
        .select('id')
        .eq('judge_id', user.id)
        .eq('team_id', submission.team_id)
        .eq('stage', submission.stage)
        .maybeSingle()

      if (!assignment) {
        return NextResponse.json({ success: false, error: 'Anda tidak memiliki penugasan untuk melihat file tim ini' }, { status: 403 })
      }
    }

    // Generate signed URL with 15 minutes (900s) expiry
    const { data: signedData, error: signedError } = await supabase.storage
      .from(BUCKET_NAME)
      .createSignedUrl(submission.storage_path, 900)

    if (signedError || !signedData?.signedUrl) {
      console.error('Signed URL generation error:', signedError)
      return NextResponse.json({ success: false, error: 'Gagal membuat URL pratinjau file' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: {
        signedUrl: signedData.signedUrl,
        originalFilename: submission.original_filename,
        mimeType: submission.mime_type,
        fileSize: submission.file_size
      },
      message: 'Berhasil membuat Signed URL file'
    })
  } catch (error: any) {
    console.error('Submission view GET error:', error)
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal' }, { status: 500 })
  }
}
