import { SupabaseClient } from '@supabase/supabase-js'

export const DEFAULT_TEMPLATES: Record<string, {
  name: string
  criteria: Array<{
    name: string
    weight: number
    sort_order: number
    points: Array<{ name: string; sort_order: number }>
  }>
}> = {
  BMC: {
    name: "Rubrik Penilaian BMC YEC 2026",
    criteria: [
      {
        name: "Inovasi & Solution",
        weight: 25,
        sort_order: 1,
        points: [
          { name: "Tingkat keunikan ide bisnis", sort_order: 1 },
          { name: "Solusi konkret terhadap permasalahan konsumen", sort_order: 2 }
        ]
      },
      {
        name: "Market & Target Consumer",
        weight: 25,
        sort_order: 2,
        points: [
          { name: "Kejelasan target segmen pasar", sort_order: 1 },
          { name: "Potensi pertumbuhan & ukuran pasar", sort_order: 2 }
        ]
      },
      {
        name: "Model Bisnis & Monetisasi",
        weight: 25,
        sort_order: 3,
        points: [
          { name: "Kejelasan arus pendapatan (Revenue Streams)", sort_order: 1 },
          { name: "Struktur biaya & kelayakan finansial", sort_order: 2 }
        ]
      },
      {
        name: "Strategi Eksekusi & Keunggulan",
        weight: 25,
        sort_order: 4,
        points: [
          { name: "Strategi pemasaran & alur distribusi", sort_order: 1 },
          { name: "Keunggulan bersaing dibanding kompetitor", sort_order: 2 }
        ]
      }
    ]
  },
  PITCHING: {
    name: "Rubrik Penilaian Pitching YEC 2026",
    criteria: [
      {
        name: "Presentasi & Komunikasi",
        weight: 25,
        sort_order: 1,
        points: [
          { name: "Penyampaian materi & penguasaan panggung", sort_order: 1 },
          { name: "Kerapian & daya tarik slide deck", sort_order: 2 }
        ]
      },
      {
        name: "Kualitas Produk / Prototype",
        weight: 30,
        sort_order: 2,
        points: [
          { name: "Kematangan prototipe / MVP produk", sort_order: 1 },
          { name: "Fungsionalitas & User Experience", sort_order: 2 }
        ]
      },
      {
        name: "Potensi Bisnis & Traction",
        weight: 25,
        sort_order: 3,
        points: [
          { name: "Validasi pasar & traksi bisnis awal", sort_order: 1 },
          { name: "Skalabilitas bisnis di masa depan", sort_order: 2 }
        ]
      },
      {
        name: "Tanya Jawab (Q&A)",
        weight: 20,
        sort_order: 4,
        points: [
          { name: "Ketepatan & kejelasan jawaban atas pertanyaan juri", sort_order: 1 },
          { name: "Kekompakan & kerjasama tim", sort_order: 2 }
        ]
      }
    ]
  }
}

export async function getActiveOrFallbackTemplate(supabase: SupabaseClient, stage: string) {
  // 1. Find active template first, or fallback to latest created template
  const { data: templates } = await supabase
    .from('evaluation_templates')
    .select(`
      id,
      name,
      stage,
      active,
      description,
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
    .order('active', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(1)

  let template = templates && templates.length > 0 ? templates[0] : null

  // If template exists and has criteria, return it
  if (template && template.criteria && template.criteria.length > 0) {
    return template
  }

  // 2. If no template exists or template has 0 criteria, seed default template into database
  const defaultConf = DEFAULT_TEMPLATES[stage] || DEFAULT_TEMPLATES.BMC
  
  if (!template) {
    const { data: newTemplate, error: tErr } = await supabase
      .from('evaluation_templates')
      .insert({
        name: defaultConf.name,
        stage: stage,
        active: true
      })
      .select()
      .single()

    if (tErr || !newTemplate) {
      console.error('Error creating default template:', tErr)
      return null
    }
    template = newTemplate
  }

  if (!template) return null
  const currentTemplate = template

  // Seed criteria & points for this template
  const seededCriteria: any[] = []
  for (const crit of defaultConf.criteria) {
    const { data: newCrit, error: cErr } = await supabase
      .from('criteria')
      .insert({
        template_id: currentTemplate.id,
        name: crit.name,
        weight: crit.weight,
        sort_order: crit.sort_order
      })
      .select()
      .single()

    if (cErr || !newCrit) {
      console.error('Error seeding criterion:', cErr)
      continue
    }

    const pointsToInsert = crit.points.map(p => ({
      criterion_id: newCrit.id,
      name: p.name,
      sort_order: p.sort_order
    }))

    const { data: newPoints } = await supabase
      .from('criterion_points')
      .insert(pointsToInsert)
      .select()

    seededCriteria.push({
      ...newCrit,
      criterion_points: newPoints || []
    })
  }

  return {
    ...template,
    active: true,
    criteria: seededCriteria
  }
}
