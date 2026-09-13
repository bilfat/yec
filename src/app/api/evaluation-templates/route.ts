import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess, getUserRole } from '@/lib/auth-helpers'
import { getActiveOrFallbackTemplate } from '@/lib/evaluation-helpers'

export async function GET(request: Request) {
  try {
    const role = await getUserRole()
    if (role !== 'ADMIN' && role !== 'JUDGE') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')

    if (!stage) {
      return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Stage parameter is required' } }, { status: 400 })
    }

    const supabase = createAdminClient()

    const template = await getActiveOrFallbackTemplate(supabase, stage)

    if (!template) {
      return NextResponse.json({ success: true, data: null, message: 'Template tidak ditemukan' })
    }

    // Map to frontend format
    // Sort criteria by sort_order
    const sortedCriteria = (template.criteria || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
    
    const criteriaList = sortedCriteria.map((c: any) => {
      const sortedPoints = (c.criterion_points || []).sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
      return {
        id: c.id,
        name: c.name,
        weight: c.weight,
        points: sortedPoints.map((p: any) => ({
          id: p.id,
          label: p.name
        }))
      }
    })

    return NextResponse.json({
      success: true,
      data: {
        templateName: template.name,
        status: template.active ? "ACTIVE" : "DRAFT",
        criteriaList
      },
      message: 'Berhasil mengambil template evaluasi'
    })
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

    const { stage, templateName, status, criteriaList } = body
    const isActive = status === 'ACTIVE'

    // Validate weights if active
    if (isActive) {
      const totalWeight = criteriaList.reduce((sum: number, c: any) => sum + (Number(c.weight) || 0), 0)
      if (totalWeight !== 100) {
        return NextResponse.json({ success: false, error: { code: 'BAD_REQUEST', message: 'Total bobot kriteria harus tepat 100% untuk mengaktifkan template.' } }, { status: 400 })
      }
    }

    // 1. Insert new template
    const { data: newTemplate, error: tError } = await supabase
      .from('evaluation_templates')
      .insert({
        name: templateName,
        stage: stage,
        active: isActive
      })
      .select()
      .single()

    if (tError) throw tError

    // 2. Insert criteria and points
    for (let cIdx = 0; cIdx < criteriaList.length; cIdx++) {
      const crit = criteriaList[cIdx]
      const { data: newCrit, error: cError } = await supabase
        .from('criteria')
        .insert({
          template_id: newTemplate.id,
          name: crit.name,
          weight: crit.weight,
          sort_order: cIdx + 1
        })
        .select()
        .single()

      if (cError) {
        await supabase.from('evaluation_templates').delete().eq('id', newTemplate.id)
        throw cError
      }

      // Insert points
      if (crit.points && crit.points.length > 0) {
        const pointsToInsert = crit.points.map((p: any, pIdx: number) => ({
          criterion_id: newCrit.id,
          name: p.label,
          sort_order: pIdx + 1
        }))
        const { error: pError } = await supabase.from('criterion_points').insert(pointsToInsert)
        if (pError) {
          await supabase.from('evaluation_templates').delete().eq('id', newTemplate.id)
          throw pError
        }
      }
    }

    // 3. Deactivate old templates
    if (isActive) {
      await supabase
        .from('evaluation_templates')
        .update({ active: false })
        .eq('stage', stage)
        .neq('id', newTemplate.id)
    } else {
      await supabase
        .from('evaluation_templates')
        .delete()
        .eq('stage', stage)
        .eq('active', false)
        .neq('id', newTemplate.id)
    }

    return NextResponse.json({ success: true, data: { id: newTemplate.id }, message: 'Template penilaian berhasil disimpan' }, { status: 201 })
  } catch (error: unknown) {
    const errMessage = error instanceof Error ? error.message : 'Terjadi kesalahan server'
    if (errMessage === 'Unauthorized') {
      return NextResponse.json({ success: false, error: { code: 'UNAUTHORIZED', message: 'Unauthorized' } }, { status: 401 })
    }
    return NextResponse.json({ success: false, error: { code: 'SERVER_ERROR', message: errMessage } }, { status: 500 })
  }
}
