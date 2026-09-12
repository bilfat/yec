import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/auth-helpers'

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAdminAccess()
    const { id } = await params
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from('teams')
      .update({
        name: body.name,
        subtheme_id: body.subthemeId,
        active: body.active
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ data })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

const BUCKET_NAME = process.env.STORAGE_BUCKET || 'yec-private-submissions'

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAdminAccess()
    const { id } = await params
    const supabase = createAdminClient()

    // 1. Fetch all submission files for this team
    const { data: submissions } = await supabase
      .from('submissions')
      .select('storage_path')
      .eq('team_id', id)

    // 2. Delete files from Supabase Storage if any exist
    if (submissions && submissions.length > 0) {
      const storagePaths = submissions
        .map((s) => s.storage_path)
        .filter(Boolean) as string[]

      if (storagePaths.length > 0) {
        await supabase.storage.from(BUCKET_NAME).remove(storagePaths)
      }
    }

    // 3. Delete team record from database (Cascade deletes submissions, assignments, results)
    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', id)

    if (error) throw error
    return NextResponse.json({ success: true, message: 'Tim dan seluruh data karya berhasil dihapus permanen' })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server'
    if (errMessage === 'Unauthorized') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: errMessage }, { status: 500 })
  }
}
