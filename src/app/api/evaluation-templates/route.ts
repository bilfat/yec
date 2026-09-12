import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { checkAdminAccess, getUserRole } from '@/lib/auth-helpers'

export async function GET(request: Request) {
  try {
    const role = await getUserRole()
    if (role !== 'ADMIN' && role !== 'JUDGE') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const stage = searchParams.get('stage')

    if (!stage) {
      return NextResponse.json({ error: 'Stage parameter is required' }, { status: 400 })
    }

    const supabase = createAdminClient()

    // Find the ACTIVE template first. If not found, find the latest DRAFT.
    let { data: templates, error } = await supabase
      .from('evaluation_templates')
      .select(`
        id,
        name,
        active,
        criteria (
          id,
          name,
          weight,
          sort_order,
          criterion_points (
            id,
            name,
            sort_order
          )
        )
      `)
      .eq('stage', stage)
      .order('active', { ascending: false }) // true comes before false
      .order('created_at', { ascending: false })
      .limit(1)

    if (error) throw error

    if (!templates || templates.length === 0) {
      return NextResponse.json({ data: null })
    }

    const template = templates[0]

    // Map to frontend format
    // Sort criteria by sort_order
    const sortedCriteria = template.criteria?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
    
    const criteriaList = sortedCriteria.map((c: any) => {
      const sortedPoints = c.criterion_points?.sort((a: any, b: any) => a.sort_order - b.sort_order) || []
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
      data: {
        templateName: template.name,
        status: template.active ? "ACTIVE" : "DRAFT",
        criteriaList
      }
    })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
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
        return NextResponse.json({ error: 'Total weight must be exactly 100% to activate.' }, { status: 400 })
      }
    }

    // Since Supabase JS doesn't easily support cross-table transactions, we'll do sequential inserts
    // If it fails halfway, we might have garbage, but since we create a new template UUID, it won't corrupt active ones.

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
        // Rollback template manually
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

    // 3. Deactivate old templates (or delete old draft if we just saved a draft)
    if (isActive) {
      // Deactivate all other templates for this stage
      await supabase
        .from('evaluation_templates')
        .update({ active: false })
        .eq('stage', stage)
        .neq('id', newTemplate.id)
    } else {
      // We saved a draft. Delete all OTHER drafts for this stage so we don't pile up drafts
      await supabase
        .from('evaluation_templates')
        .delete()
        .eq('stage', stage)
        .eq('active', false)
        .neq('id', newTemplate.id)
    }

    return NextResponse.json({ success: true, data: { id: newTemplate.id } }, { status: 201 })
  } catch (error: any) {
    if (error.message === 'Unauthorized') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
