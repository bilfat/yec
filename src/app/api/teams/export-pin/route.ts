import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/auth-helpers'
import { extractRawPin } from '@/lib/security/pin'

export async function GET() {
  try {
    await checkAdminAccess()
    const supabase = createAdminClient()

    const { data: teams, error } = await supabase
      .from('teams')
      .select(`
        id,
        name,
        pin_hash,
        created_at,
        subthemes ( name )
      `)
      .order('created_at', { ascending: false })

    if (error) throw error

    // Build CSV content
    const headers = ['Nama Tim', 'Sub Tema', 'PIN Akses', 'Tanggal Terdaftar']
    const rows = (teams || []).map((t: any) => [
      `"${(t.name || '').replace(/"/g, '""')}"`,
      `"${(t.subthemes?.name || '-').replace(/"/g, '""')}"`,
      `"${extractRawPin(t.pin_hash)}"`,
      `"${new Date(t.created_at).toLocaleDateString('id-ID')}"`
    ])

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n')

    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="Data_PIN_Tim_YEC_${new Date().toISOString().split('T')[0]}.csv"`
      }
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
