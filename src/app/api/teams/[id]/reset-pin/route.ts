import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/auth-helpers'
import { hashPin } from '@/lib/security/pin'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await checkAdminAccess()
    const { id } = await params
    const supabase = createAdminClient()

    // 1. Check if team exists
    const { data: team, error: findError } = await supabase
      .from('teams')
      .select('id, name')
      .eq('id', id)
      .single()

    if (findError || !team) {
      return NextResponse.json({ success: false, error: 'Tim tidak ditemukan' }, { status: 404 })
    }

    // 2. Generate new 6-digit PIN
    const rawPin = Math.floor(100000 + Math.random() * 900000).toString()
    const pinHash = await hashPin(rawPin)

    // 3. Update pin_code & pin_hash in DB
    const { error: updateError } = await supabase
      .from('teams')
      .update({ pin_code: rawPin, pin_hash: pinHash })
      .eq('id', id)

    if (updateError) throw updateError

    return NextResponse.json({
      success: true,
      data: {
        id: team.id,
        name: team.name,
        rawPin
      },
      message: 'PIN tim berhasil diperbarui'
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan server' }, { status: 500 })
  }
}
