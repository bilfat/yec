/**
 * Utility for exporting evaluation results to CSV
 * Matches the Google Sheets / Excel format with two-tier criteria headers:
 * Row 1: No | Nama Tim | Nilai (spans criteria) | Total Nilai | Catatan Evaluasi Juri
 * Row 2:    |          | Criteria 1 | Criteria 2... |             |
 */

export interface ExportCsvTeam {
  name: string
  averageScore?: number | null
  criteriaAverages?: { name: string; score: number | null }[]
  judgeDetails?: {
    judgeName: string
    note?: string
    criteriaScores?: { name: string; score: number }[]
  }[]
  combinedNotes?: string
}

export interface ExportEvaluationCsvOptions {
  filename: string
  teams: ExportCsvTeam[]
  templateCriteria: { name: string }[]
}

export function exportEvaluationCsv({
  filename,
  teams,
  templateCriteria,
}: ExportEvaluationCsvOptions) {
  // 1. Gather all criteria names in order
  let criteriaNames: string[] = []
  if (templateCriteria && templateCriteria.length > 0) {
    criteriaNames = templateCriteria.map((c) => c.name)
  } else {
    // Fallback: derive unique criteria names from team evaluations
    const namesSet = new Set<string>()
    teams.forEach((t) => {
      if (t.criteriaAverages) {
        t.criteriaAverages.forEach((ca) => namesSet.add(ca.name))
      } else if (t.judgeDetails) {
        t.judgeDetails.forEach((jd) => {
          jd.criteriaScores?.forEach((cs) => namesSet.add(cs.name))
        })
      }
    })
    criteriaNames = Array.from(namesSet)
  }

  // Helper to escape CSV cell contents
  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return '""'
    const str = String(val).trim()
    return `"${str.replace(/"/g, '""')}"`
  }

  // Row 1: No | Nama Tim | Nilai | [empty spaces for criteria columns] | Total Nilai | Catatan Evaluasi Juri
  const row1: string[] = ['"No"', '"Nama Tim"', '"Nilai"']
  for (let i = 1; i < Math.max(criteriaNames.length, 1); i++) {
    row1.push('""')
  }
  row1.push('"Total Nilai"')
  row1.push('"Catatan Evaluasi Juri"')

  // Row 2: Empty | Empty | Criteria Names... | Empty | Empty
  const row2: string[] = ['""', '""']
  if (criteriaNames.length === 0) {
    row2.push('""')
  } else {
    for (const crit of criteriaNames) {
      row2.push(escapeCell(crit))
    }
  }
  row2.push('""')
  row2.push('""')

  // Data rows
  const dataRows: string[][] = teams.map((team, index) => {
    const row: string[] = []

    // 1. Nomor
    row.push(escapeCell(index + 1))

    // 2. Nama Tim
    row.push(escapeCell(team.name))

    // 3. Detail Nilai per Kriteria
    if (criteriaNames.length === 0) {
      row.push(escapeCell('-'))
    } else {
      for (const critName of criteriaNames) {
        let score: number | null = null

        // Try from criteriaAverages first
        if (team.criteriaAverages && team.criteriaAverages.length > 0) {
          const found = team.criteriaAverages.find(
            (ca) => ca.name.trim().toLowerCase() === critName.trim().toLowerCase()
          )
          if (found && found.score !== null && found.score !== undefined) {
            score = found.score
          }
        }

        // Fallback: average from judgeDetails
        if (score === null && team.judgeDetails && team.judgeDetails.length > 0) {
          const validScores = team.judgeDetails
            .map((jd) =>
              jd.criteriaScores?.find(
                (cs) => cs.name.trim().toLowerCase() === critName.trim().toLowerCase()
              )?.score
            )
            .filter((s): s is number => typeof s === 'number')

          if (validScores.length > 0) {
            score = Math.round((validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10) / 10
          }
        }

        row.push(escapeCell(score !== null ? score : '-'))
      }
    }

    // 4. Total Nilai
    const totalScore =
      team.averageScore !== null && team.averageScore !== undefined
        ? Number(team.averageScore).toFixed(1)
        : '-'
    row.push(escapeCell(totalScore))

    // 5. Catatan Evaluasi Juri
    let noteText = team.combinedNotes || ''
    if (!noteText && team.judgeDetails && team.judgeDetails.length > 0) {
      const validNotes = team.judgeDetails
        .filter(
          (jd) =>
            jd.note &&
            jd.note.trim() !== '' &&
            jd.note !== 'Belum memberikan penilaian.'
        )
        .map((jd) =>
          team.judgeDetails!.length > 1 ? `[${jd.judgeName}]: ${jd.note}` : jd.note
        )
      noteText = validNotes.join('\n')
    }
    row.push(escapeCell(noteText || '-'))

    return row
  })

  // Assemble full CSV
  const csvLines = [
    row1.join(','),
    row2.join(','),
    ...dataRows.map((r) => r.join(',')),
  ]

  // Add UTF-8 Byte Order Mark (BOM) so Excel detects UTF-8 correctly
  const csvContent = '\uFEFF' + csvLines.join('\r\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', filename.endsWith('.csv') ? filename : `${filename}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
