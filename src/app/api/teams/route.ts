import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess, getUserRole } from '@/lib/auth-helpers'
import { hashPin, extractRawPin } from '@/lib/security/pin'

export async function GET() {
  try {
    const role = await getUserRole()
    const supabase = createAdminClient()

    if (role === 'ADMIN') {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          pin_hash,
          active,
          created_at,
          subthemes ( id, name ),
          submissions ( id, stage, storage_path, original_filename ),
          team_stage_results ( id, stage, result_status, final_score ),
          final_results ( id, rank, final_score )
        `)
        .order('created_at', { ascending: false })

      if (error) throw error

      // Auto-assign pin_code for legacy entries if missing in pin_hash
      const mappedData = []
      if (data) {
        for (const t of data) {
          let rawPin = extractRawPin(t.pin_hash)
          if (rawPin === '------') {
            rawPin = Math.floor(100000 + Math.random() * 900000).toString()
            const newPinHash = await hashPin(rawPin)
            await supabase.from('teams').update({ pin_hash: newPinHash }).eq('id', t.id)
          }

          // Process statuses
          const bmcSubmission = t.submissions?.find((s: any) => s.stage === 'BMC')
          const pitchingSubmission = t.submissions?.find((s: any) => s.stage === 'PITCHING')
          const bmcResult = t.team_stage_results?.find((r: any) => r.stage === 'BMC')
          const pitchingResult = t.team_stage_results?.find((r: any) => r.stage === 'PITCHING')
          const finalResult = t.final_results?.[0] || null

          let bmcStatus = "Belum dikumpul"
          if (bmcResult?.result_status === 'PASSED') bmcStatus = "Lolos"
          else if (bmcResult?.result_status === 'FAILED') bmcStatus = "Tidak Lolos"
          else if (bmcSubmission) bmcStatus = "Dikumpul"

          let pitchingStatus = "Belum dikumpul"
          if (finalResult?.rank === 1) pitchingStatus = "Juara 1"
          else if (finalResult?.rank === 2) pitchingStatus = "Juara 2"
          else if (finalResult?.rank === 3) pitchingStatus = "Juara 3"
          else if (pitchingResult?.result_status === 'PASSED' || pitchingResult?.result_status === 'FAILED') pitchingStatus = "Tidak Juara"
          else if (pitchingSubmission) pitchingStatus = "Dikumpul"

          mappedData.push({
            ...t,
            pin_code: rawPin,
            bmcStatus,
            pitchingStatus,
            bmcScore: bmcResult?.final_score || null,
            pitchingScore: finalResult?.final_score || pitchingResult?.final_score || null,
            bmcFile: bmcSubmission ? { id: bmcSubmission.id, name: bmcSubmission.original_filename } : null,
            pitchingFile: pitchingSubmission ? { id: pitchingSubmission.id, name: pitchingSubmission.original_filename } : null
          })
        }
      }

      return NextResponse.json({ success: true, data: mappedData, message: 'Berhasil mengambil daftar tim' })
    }

    // Public/participant dropdown
    const { data, error } = await supabase
      .from('teams')
      .select('id, name')
      .eq('active', true)
      .order('name', { ascending: true })

    if (error) throw error
    return NextResponse.json({ success: true, data, message: 'Berhasil mengambil daftar tim' })
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

    if (!body.name) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Team name is required' } }, { status: 400 })
    }

    // Generate random 6-digit PIN
    const rawPin = Math.floor(100000 + Math.random() * 900000).toString()
    const pinHash = await hashPin(rawPin)

    const { data, error } = await supabase
      .from('teams')
      .insert({
        name: body.name,
        pin_hash: pinHash,
        subtheme_id: body.subthemeId || null
      })
      .select()
      .single()

    if (error) throw error
    
    return NextResponse.json({ success: true, data: { ...data, rawPin, pin_code: rawPin }, message: 'Tim berhasil dibuat' }, { status: 201 })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server'
    if (errMessage === 'Unauthorized') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: errMessage } }, { status: 500 })
  }
}
