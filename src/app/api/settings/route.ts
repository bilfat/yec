import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getUserRole, checkAdminAccess } from '@/lib/auth-helpers'

const DEFAULT_SETTINGS = {
  competition_name: "YEC 2026",
  hero_title: "BUILD YOUR IDEA. BUILD YOUR CHARACTER.",
  hero_subtitle: "Kompetisi bisnis pemuda se-Indonesia.",
  announcement_title: "Selamat Datang di YEC 2026",
  announcement_content: "Siapkan tim dan karyamu!",
  participant_support_phone: "08123456789",
  bmc_submission_open: false,
  bmc_evaluation_open: false,
  pitching_submission_open: false,
  pitching_evaluation_open: false
}

export async function GET() {
  try {
    const supabase = createAdminClient() // Use admin client to bypass RLS
    const role = await getUserRole()
    
    // Admin gets everything, public gets limited fields
    let query = supabase.from('competition_settings').select('*').limit(1).single()
    
    if (role !== 'ADMIN') {
      query = supabase.from('competition_settings').select(
        'competition_name, announcement_title, announcement_content, participant_support_phone, bmc_submission_open, bmc_evaluation_open, pitching_submission_open, pitching_evaluation_open'
      ).limit(1).single()
    }
    
    const { data, error } = await query

    if (error && error.code !== 'PGRST116') {
      return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: error.message } }, { status: 500 })
    }

    return NextResponse.json({ success: true, data: data || DEFAULT_SETTINGS, message: 'Berhasil mengambil pengaturan kompetisi' })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error'
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: errMessage } }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    await checkAdminAccess()
    
    const supabase = createAdminClient()
    const updates = await request.json()
    
    // Fetch ID or insert if missing.
    const { data: existing } = await supabase.from('competition_settings').select('id').limit(1).single()
    
    let result;
    if (existing) {
      result = await supabase.from('competition_settings').update(updates).eq('id', existing.id).select().single()
    } else {
      result = await supabase.from('competition_settings').insert(updates).select().single()
    }

    if (result.error) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: result.error.message } }, { status: 400 })
    }

    return NextResponse.json({ success: true, data: result.data, message: 'Pengaturan berhasil diperbarui' })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Internal Server Error'
    if (errMessage === 'Unauthorized') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: errMessage } }, { status: 500 })
  }
}
