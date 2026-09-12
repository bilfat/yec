import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { createAdminClient } from '@/lib/supabase/server'
import { verifyPin, createParticipantSession } from '@/lib/security/pin'

const attemptTracker = new Map<string, { count: number; resetAt: number }>()

export async function POST(request: Request) {
  try {
    const { teamId, pin } = await request.json()

    if (!teamId || !pin) {
      return NextResponse.json({ success: false, error: 'Team ID dan PIN wajib diisi' }, { status: 400 })
    }

    // Basic brute-force rate limiting check
    const now = Date.now()
    const attemptKey = `pin_${teamId}`
    const record = attemptTracker.get(attemptKey)

    if (record) {
      if (now < record.resetAt) {
        if (record.count >= 5) {
          return NextResponse.json({
            success: false,
            error: 'Terlalu banyak percobaan PIN yang salah. Silakan tunggu 15 menit.'
          }, { status: 429 })
        }
      } else {
        attemptTracker.delete(attemptKey)
      }
    }

    const supabase = createAdminClient()

    // Ambil data tim dari database
    const { data: team, error } = await supabase
      .from('teams')
      .select('id, name, pin_hash')
      .eq('id', teamId)
      .single()

    if (error || !team) {
      return NextResponse.json({ success: false, error: 'Tim tidak ditemukan' }, { status: 404 })
    }

    // Verifikasi PIN
    const isPinValid = await verifyPin(pin, team.pin_hash)
    if (!isPinValid) {
      const current = attemptTracker.get(attemptKey) || { count: 0, resetAt: now + 15 * 60 * 1000 }
      attemptTracker.set(attemptKey, { count: current.count + 1, resetAt: current.resetAt })
      return NextResponse.json({ success: false, error: 'PIN tidak valid' }, { status: 401 })
    }

    // Clear failed attempts on success
    attemptTracker.delete(attemptKey)

    // Buat sesi JWT untuk peserta
    const token = await createParticipantSession(team.id, team.name)

    // Set cookie response
    const response = NextResponse.json({ success: true, message: 'Login berhasil' })
    response.cookies.set({
      name: 'yec_participant_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 24 hours
    })

    return response
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Terjadi kesalahan internal' }, { status: 500 })
  }
}
