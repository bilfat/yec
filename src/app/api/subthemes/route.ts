import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess, getUserRole } from '@/lib/auth-helpers'

export async function GET() {
  try {
    const supabase = createAdminClient()
    const role = await getUserRole()
    
    let query = supabase.from('subthemes').select('*').order('sort_order', { ascending: true })
    
    // Public only sees active
    if (role !== 'ADMIN') {
      query = query.eq('active', true)
    }

    const { data, error } = await query
    if (error) throw error

    return NextResponse.json({ success: true, data, message: 'Berhasil mengambil daftar subtema' })
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

    const insertPayload: any = {
      name: body.name,
      description: body.description ?? null,
      sort_order: body.sortOrder ?? 0,
      active: body.active ?? true
    }

    let { data, error } = await supabase
      .from('subthemes')
      .insert(insertPayload)
      .select()
      .single()

    if (error && (error.code === 'PGRST204' || error.message?.includes('description'))) {
      delete insertPayload.description
      const retry = await supabase
        .from('subthemes')
        .insert(insertPayload)
        .select()
        .single()
      data = retry.data
      error = retry.error
    }

    if (error) throw error
    return NextResponse.json({ success: true, data, message: 'Subtema berhasil dibuat' }, { status: 201 })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server'
    if (errMessage === 'Unauthorized') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: errMessage } }, { status: 500 })
  }
}
