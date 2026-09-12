import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess } from '@/lib/auth-helpers'

export async function POST(request: Request) {
  try {
    await checkAdminAccess()
    const body = await request.json()
    const { champ1, champ2, champ3 } = body

    const supabase = createAdminClient()

    // Delete previous final_results records
    await supabase.from('final_results').delete().neq('id', '00000000-0000-0000-0000-000000000000')

    const winners = [
      { team_id: champ1, rank: 1 },
      { team_id: champ2, rank: 2 },
      { team_id: champ3, rank: 3 }
    ].filter(w => w.team_id && w.team_id.trim() !== '')

    if (winners.length > 0) {
      // Calculate final pitching score for each team to attach to final_results
      const { data: pitchingResults } = await supabase
        .from('team_stage_results')
        .select('team_id, final_score')
        .eq('stage', 'PITCHING')

      const insertRows = winners.map(w => {
        const pRes = pitchingResults?.find(r => r.team_id === w.team_id)
        return {
          team_id: w.team_id,
          rank: w.rank,
          final_score: pRes?.final_score || 0
        }
      })

      const { error: insertErr } = await supabase
        .from('final_results')
        .insert(insertRows)

      if (insertErr) throw insertErr
    }

    return NextResponse.json({
      success: true,
      message: 'Penetapan Juara 1, 2, dan 3 berhasil disimpan dan dipublikasikan.'
    })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    console.error('Champion POST error:', error)
    return NextResponse.json({ success: false, error: error.message || 'Terjadi kesalahan internal' }, { status: 500 })
  }
}
