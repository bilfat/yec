/**
 * Utility for exporting evaluation results to a beautifully styled, Camp-Themed PDF
 * (Young Entrepreneur Camp 2026 theme: Campfire, Pine Trees, Tents, Mountains, Badges)
 */

export interface ExportPdfTeam {
  name: string
  subtheme?: string
  averageScore?: number | null
  criteriaAverages?: { name: string; score: number | null }[]
  judgeDetails?: {
    judgeName: string
    note?: string
    criteriaScores?: { name: string; score: number }[]
  }[]
  combinedNotes?: string
}

export interface ExportEvaluationPdfOptions {
  stage: "BMC" | "PITCHING"
  title: string
  stageSubtitle: string
  teams: ExportPdfTeam[]
  templateCriteria: { name: string; weight?: number }[]
}

export function exportEvaluationPdf({
  stage,
  title,
  stageSubtitle,
  teams,
  templateCriteria,
}: ExportEvaluationPdfOptions) {
  // Determine criteria names
  let criteriaList: { name: string; weight?: number }[] = []
  if (templateCriteria && templateCriteria.length > 0) {
    criteriaList = templateCriteria
  } else {
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
    criteriaList = Array.from(namesSet).map((name) => ({ name }))
  }

  const currentDate = new Date().toLocaleDateString("id-ID", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Build Table Header
  const criteriaHeaderCols = criteriaList
    .map(
      (c) =>
        `<th class="th-crit">${c.name}${c.weight ? `<span class="crit-weight">${c.weight}%</span>` : ""}</th>`
    )
    .join("")

  // Build Table Rows
  const tableRows = teams
    .map((team, idx) => {
      const rank = idx + 1
      const rankBadge =
        rank === 1
          ? `<span class="rank-badge rank-1">🏕️ #1</span>`
          : rank === 2
          ? `<span class="rank-badge rank-2">🌲 #2</span>`
          : rank === 3
          ? `<span class="rank-badge rank-3">⛰️ #3</span>`
          : `<span class="rank-badge rank-normal">#${rank}</span>`

      // Criteria scores
      const scoreCols = criteriaList
        .map((crit) => {
          let score: number | null = null

          if (team.criteriaAverages && team.criteriaAverages.length > 0) {
            const found = team.criteriaAverages.find(
              (ca) => ca.name.trim().toLowerCase() === crit.name.trim().toLowerCase()
            )
            if (found && found.score !== null && found.score !== undefined) {
              score = found.score
            }
          }

          if (score === null && team.judgeDetails && team.judgeDetails.length > 0) {
            const validScores = team.judgeDetails
              .map((jd) =>
                jd.criteriaScores?.find(
                  (cs) => cs.name.trim().toLowerCase() === crit.name.trim().toLowerCase()
                )?.score
              )
              .filter((s): s is number => typeof s === "number")

            if (validScores.length > 0) {
              score =
                Math.round(
                  (validScores.reduce((a, b) => a + b, 0) / validScores.length) * 10
                ) / 10
            }
          }

          const scoreDisplay = score !== null ? score.toFixed(1) : "-"
          return `<td class="td-score">${scoreDisplay}</td>`
        })
        .join("")

      // Total Score
      const totalScore =
        team.averageScore !== null && team.averageScore !== undefined
          ? Number(team.averageScore).toFixed(1)
          : "-"

      // Notes
      let noteText = team.combinedNotes || ""
      if (!noteText && team.judgeDetails && team.judgeDetails.length > 0) {
        const validNotes = team.judgeDetails
          .filter(
            (jd) =>
              jd.note &&
              jd.note.trim() !== "" &&
              jd.note !== "Belum memberikan penilaian."
          )
          .map((jd) =>
            team.judgeDetails!.length > 1 ? `<strong>${jd.judgeName}:</strong> ${jd.note}` : jd.note
          )
        noteText = validNotes.join("<br/>")
      }
      if (!noteText) noteText = "<em>Tidak ada catatan khusus dari dewan juri.</em>"

      return `
        <tr>
          <td class="td-rank">${rankBadge}</td>
          <td class="td-team">
            <div class="team-name">${team.name}</div>
            ${team.subtheme ? `<div class="team-subtheme">🏕️ ${team.subtheme}</div>` : ""}
          </td>
          ${scoreCols}
          <td class="td-total">
            <span class="total-pill">${totalScore}</span>
          </td>
          <td class="td-notes">
            <div class="notes-box">${noteText}</div>
          </td>
        </tr>
      `
    })
    .join("")

  const htmlContent = `
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <title>${title} — Young Entrepreneur Camp 2026</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@600;700;800;900&family=Plus+Jakarta+Sans:ital,wght@0,400;0,500;0,600;0,700;1,400&display=swap');

    @page {
      size: A4 landscape;
      margin: 8mm;
    }

    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }

    body {
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      background: #fbf9f5;
      color: #2b1f14;
      line-height: 1.4;
      font-size: 11px;
      -webkit-print-color-adjust: exact !important;
      print-color-adjust: exact !important;
    }

    /* Floating Toolbar (Hidden during print) */
    .toolbar {
      position: sticky;
      top: 0;
      z-index: 9999;
      background: #183a2b;
      color: #fff;
      padding: 12px 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 4px 16px rgba(0,0,0,0.25);
    }
    .toolbar-info {
      display: flex;
      align-items: center;
      gap: 12px;
      font-size: 13px;
    }
    .toolbar-title {
      font-weight: 700;
      color: #f59e0b;
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .btn-group {
      display: flex;
      gap: 10px;
    }
    .btn {
      cursor: pointer;
      font-family: inherit;
      font-size: 12px;
      font-weight: 600;
      padding: 8px 18px;
      border-radius: 8px;
      border: none;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s ease;
    }
    .btn-primary {
      background: #d97706;
      color: #fff;
    }
    .btn-primary:hover {
      background: #b45309;
    }
    .btn-secondary {
      background: rgba(255,255,255,0.15);
      color: #fff;
    }
    .btn-secondary:hover {
      background: rgba(255,255,255,0.25);
    }

    /* Main Container */
    .document-wrapper {
      max-width: 1400px;
      margin: 16px auto;
      background: #ffffff;
      border: 3px double #2d6a4f;
      border-radius: 16px;
      padding: 24px 28px;
      box-shadow: 0 10px 30px rgba(74, 46, 24, 0.08);
      position: relative;
      overflow: hidden;
    }

    /* Camp Wood & Forest Border Ornaments */
    .document-wrapper::before {
      content: "";
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 8px;
      background: linear-gradient(90deg, #183a2b 0%, #2d6a4f 25%, #d97706 50%, #2d6a4f 75%, #183a2b 100%);
    }

    /* Camp Header */
    .camp-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 2px dashed #d1c7b7;
      padding-bottom: 16px;
      margin-bottom: 16px;
      position: relative;
    }
    .camp-brand {
      display: flex;
      align-items: center;
      gap: 16px;
    }
    .camp-logo-badge {
      width: 68px;
      height: 68px;
      border-radius: 18px;
      background: linear-gradient(135deg, #183a2b 0%, #2d6a4f 60%, #1e4a36 100%);
      border: 2px solid #d97706;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 10px rgba(27,67,50,0.25);
      color: #fef3c7;
    }
    .camp-titles h1 {
      font-family: 'Cinzel', serif;
      font-size: 22px;
      font-weight: 800;
      color: #183a2b;
      letter-spacing: 1px;
      line-height: 1.1;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .camp-titles .subtitle {
      font-size: 13px;
      font-weight: 700;
      color: #d97706;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-top: 3px;
    }
    .camp-titles .desc {
      font-size: 11px;
      color: #6b5847;
      margin-top: 2px;
    }

    .camp-badge-info {
      text-align: right;
      background: #fbf7ee;
      border: 1px solid #e6dcce;
      border-left: 4px solid #d97706;
      border-radius: 10px;
      padding: 8px 14px;
    }
    .camp-badge-info .badge-label {
      font-size: 9px;
      font-weight: 700;
      text-transform: uppercase;
      color: #8c735d;
      letter-spacing: 0.5px;
    }
    .camp-badge-info .badge-val {
      font-size: 12px;
      font-weight: 700;
      color: #183a2b;
    }

    /* Camp Highlights & Stats Strip */
    .camp-stats-strip {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: linear-gradient(90deg, #183a2b 0%, #24523d 100%);
      color: #fff;
      padding: 8px 18px;
      border-radius: 10px;
      margin-bottom: 16px;
      font-size: 11px;
    }
    .strip-item {
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .strip-item strong {
      color: #fef08a;
      font-weight: 700;
    }

    /* Table Styling (Two-tier Camp Table) */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 18px;
      font-size: 10.5px;
    }
    th, td {
      border: 1px solid #dcd3c5;
      padding: 7px 9px;
      vertical-align: middle;
    }
    
    /* Tier 1 Header */
    .th-top-main {
      background: #183a2b;
      color: #fef3c7;
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
    }
    .th-top-criteria {
      background: #23553f;
      color: #fef3c7;
      font-family: 'Cinzel', serif;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: center;
    }

    /* Tier 2 Header */
    .th-crit {
      background: #eef5f0;
      color: #183a2b;
      font-size: 10px;
      font-weight: 700;
      text-align: center;
      min-width: 80px;
      white-space: normal;
    }
    .crit-weight {
      display: block;
      font-size: 8.5px;
      color: #b45309;
      font-weight: 600;
    }

    /* Row Content */
    tr:nth-child(even) {
      background: #fbf9f4;
    }
    tr:hover {
      background: #f5f0e4;
    }

    .td-rank {
      text-align: center;
      width: 50px;
    }
    .rank-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 10px;
      padding: 3px 7px;
      border-radius: 6px;
      white-space: nowrap;
    }
    .rank-1 {
      background: #fef3c7;
      color: #92400e;
      border: 1px solid #f59e0b;
      font-weight: 800;
    }
    .rank-2 {
      background: #f1f5f9;
      color: #334155;
      border: 1px solid #94a3b8;
    }
    .rank-3 {
      background: #ffedd5;
      color: #9a3412;
      border: 1px solid #ea580c;
    }
    .rank-normal {
      background: #f3ede2;
      color: #6b5847;
    }

    .td-team {
      min-width: 140px;
      max-width: 180px;
    }
    .team-name {
      font-weight: 700;
      font-size: 11.5px;
      color: #183a2b;
    }
    .team-subtheme {
      font-size: 9.5px;
      color: #8c735d;
      margin-top: 1px;
    }

    .td-score {
      text-align: center;
      font-weight: 600;
      font-family: 'Cinzel', serif;
      font-size: 11px;
      color: #2b1f14;
    }

    .td-total {
      text-align: center;
      width: 75px;
    }
    .total-pill {
      display: inline-block;
      font-family: 'Cinzel', serif;
      font-weight: 800;
      font-size: 12px;
      color: #78350f;
      background: #fef3c7;
      border: 1px solid #f59e0b;
      padding: 3px 8px;
      border-radius: 6px;
    }

    .td-notes {
      min-width: 180px;
      font-size: 9.5px;
      line-height: 1.35;
    }
    .notes-box {
      color: #4a3c2c;
      font-style: italic;
      background: #fffdf9;
      padding: 4px 6px;
      border-radius: 4px;
      border-left: 2px solid #d97706;
    }

    /* Footer / Signature Area */
    .camp-footer {
      margin-top: 24px;
      padding-top: 16px;
      border-top: 2px dashed #d1c7b7;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    .signature-card {
      text-align: center;
      width: 200px;
    }
    .signature-title {
      font-size: 9.5px;
      color: #8c735d;
      font-weight: 600;
      text-transform: uppercase;
    }
    .signature-space {
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Cinzel', serif;
      font-size: 9px;
      color: #b0a390;
      letter-spacing: 1px;
    }
    .signature-name {
      font-weight: 700;
      font-size: 11px;
      color: #183a2b;
      border-top: 1px solid #2b1f14;
      padding-top: 4px;
    }
    .signature-role {
      font-size: 9px;
      color: #6b5847;
    }

    /* Official Camp Seal Stamp */
    .camp-seal {
      width: 110px;
      height: 110px;
      border: 3px dashed #d97706;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      color: #b45309;
      transform: rotate(-7deg);
      opacity: 0.9;
      padding: 6px;
      margin: 0 auto;
    }
    .camp-seal-top {
      font-size: 7.5px;
      font-weight: 800;
      letter-spacing: 1px;
      text-transform: uppercase;
    }
    .camp-seal-icon {
      font-size: 18px;
      margin: 2px 0;
    }
    .camp-seal-mid {
      font-family: 'Cinzel', serif;
      font-size: 9.5px;
      font-weight: 900;
      letter-spacing: 0.5px;
    }
    .camp-seal-bot {
      font-size: 7px;
      font-weight: 700;
      letter-spacing: 0.5px;
    }

    /* Print Overrides */
    @media print {
      .toolbar {
        display: none !important;
      }
      body {
        background: #fff;
      }
      .document-wrapper {
        border: none;
        box-shadow: none;
        padding: 0;
        margin: 0;
        max-width: 100%;
      }
    }
  </style>
</head>
<body>

  <!-- Floating Toolbar for previewing and printing -->
  <div class="toolbar">
    <div class="toolbar-info">
      <span class="toolbar-title">
        🏕️ Pratinjau Dokumen PDF — Young Entrepreneur Camp 2026
      </span>
      <span>|</span>
      <span>Orientasi: <strong>Landscape (Mendatar)</strong></span>
    </div>
    <div class="btn-group">
      <button class="btn btn-secondary" onclick="window.close()">
        ✕ Tutup
      </button>
      <button class="btn btn-primary" onclick="window.print()">
        🖨️ Cetak / Simpan sebagai PDF
      </button>
    </div>
  </div>

  <div class="document-wrapper">
    <!-- Header with Camp Emblem -->
    <div class="camp-header">
      <div class="camp-brand">
        <div class="camp-logo-badge">
          <svg viewBox="0 0 24 24" width="30" height="30" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M12 2c1.5 3 4 5 4 8a6 6 0 0 1-12 0c0-3 2.5-5 4-8 1 2 2 3 4 0z" fill="#f59e0b" stroke="#d97706"/>
            <path d="M12 7c.8 1.5 2 2.5 2 4a3 3 0 0 1-6 0c0-1.5 1.2-2.5 2-4 .5 1 1 1.5 2 0z" fill="#ef4444" stroke="#dc2626"/>
            <path d="M4 21l16-4M20 21L4 17" stroke="#fde68a" stroke-width="2.5" stroke-linecap="round"/>
          </svg>
          <span style="font-size: 8px; font-weight: 800; letter-spacing: 0.5px; margin-top: 1px;">YEC 2026</span>
        </div>
        <div class="camp-titles">
          <h1>
            🏕️ YOUNG ENTREPRENEUR CAMP 2026
          </h1>
          <div class="subtitle">${title}</div>
          <div class="desc">${stageSubtitle} · Berdasarkan Akumulasi Skor Multi-Evaluator</div>
        </div>
      </div>

      <div class="camp-badge-info">
        <div class="badge-label">Tanggal Terbit & Status</div>
        <div class="badge-val">${currentDate}</div>
        <div style="font-size: 9.5px; color: #15803d; font-weight: 700; margin-top: 2px;">
          ✓ Dokumen Resmi Terverifikasi
        </div>
      </div>
    </div>

    <!-- Camp Stats Strip -->
    <div class="camp-stats-strip">
      <div class="strip-item">
        <span>🌲 Tahap Kompetisi:</span>
        <strong>${stage === "BMC" ? "Business Model Canvas (BMC)" : "Pitching & Presentation Day"}</strong>
      </div>
      <div class="strip-item">
        <span>⛺ Total Tim Dinilai:</span>
        <strong>${teams.length} Tim Peserta</strong>
      </div>
      <div class="strip-item">
        <span>🏆 Peringkat Tertinggi:</span>
        <strong>${teams[0] ? `${teams[0].name} (${teams[0].averageScore?.toFixed(1) || "-"})` : "-"}</strong>
      </div>
      <div class="strip-item">
        <span>🧭 Urutan Rekap:</span>
        <strong>Total Nilai Tertinggi ke Terendah</strong>
      </div>
    </div>

    <!-- Evaluations Table -->
    <table>
      <thead>
        <!-- Tier 1 Header: Merged Nilai column spanning all criteria -->
        <tr>
          <th rowspan="2" class="th-top-main" style="width: 50px;">No</th>
          <th rowspan="2" class="th-top-main" style="width: 170px;">Nama Tim Peserta</th>
          <th colspan="${Math.max(criteriaList.length, 1)}" class="th-top-criteria">
            🎯 Nilai Evaluasi Dewan Juri Berdasarkan Kriteria Rubrik
          </th>
          <th rowspan="2" class="th-top-main" style="width: 80px;">Total Nilai</th>
          <th rowspan="2" class="th-top-main">Catatan Evaluasi / Masukan Juri</th>
        </tr>
        <!-- Tier 2 Header: Individual Criteria Breakdown -->
        <tr>
          ${criteriaHeaderCols || '<th class="th-crit">Skor Evaluasi</th>'}
        </tr>
      </thead>
      <tbody>
        ${tableRows}
      </tbody>
    </table>

    <!-- Camp Official Signatures & Seal -->
    <div class="camp-footer">
      <div class="signature-card">
        <div class="signature-title">Koordinator Dewan Juri</div>
        <div class="signature-space">TANDA TANGAN & NAMA</div>
        <div class="signature-name">Prof. / Dr. Dewan Juri YEC</div>
        <div class="signature-role">Ketua Tim Evaluator</div>
      </div>

      <!-- Camp Center Seal Stamp -->
      <div class="camp-seal">
        <div class="camp-seal-top">★ YOUNG ENTREPRENEUR ★</div>
        <div class="camp-seal-icon">🏕️</div>
        <div class="camp-seal-mid">CAMP 2026</div>
        <div class="camp-seal-bot">LEMBAR RESMI TERVERIFIKASI</div>
      </div>

      <div class="signature-card">
        <div class="signature-title">Ketua Panitia Pelaksana</div>
        <div class="signature-space">TANDA TANGAN & NAMA</div>
        <div class="signature-name">Panitia Admin YEC 2026</div>
        <div class="signature-role">Young Entrepreneur Camp</div>
      </div>
    </div>
  </div>

  <script>
    // Automatically trigger print dialog on window open
    window.addEventListener('load', () => {
      setTimeout(() => {
        window.print();
      }, 500);
    });
  </script>
</body>
</html>
`

  // Open printable window with camp-themed PDF template
  const printWindow = window.open("", "_blank")
  if (printWindow) {
    printWindow.document.open()
    printWindow.document.write(htmlContent)
    printWindow.document.close()
  } else {
    // If popup blocked, create an iframe as fallback
    const iframe = document.createElement("iframe")
    iframe.style.position = "fixed"
    iframe.style.right = "0"
    iframe.style.bottom = "0"
    iframe.style.width = "0"
    iframe.style.height = "0"
    iframe.style.border = "none"
    document.body.appendChild(iframe)

    const doc = iframe.contentWindow?.document
    if (doc) {
      doc.open()
      doc.write(htmlContent)
      doc.close()
      setTimeout(() => {
        iframe.contentWindow?.focus()
        iframe.contentWindow?.print()
        setTimeout(() => {
          document.body.removeChild(iframe)
        }, 3000)
      }, 500)
    }
  }
}
