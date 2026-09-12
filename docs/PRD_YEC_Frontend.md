# PRD — Young Entrepreneur Camp (YEC) Competition Platform — **FRONTEND**

**Document:** Product Requirements Document (Frontend Scope)
**Version:** 1.0
**Status:** Baseline / Ready for Development
**Primary stack:** Next.js + React + TypeScript + Tailwind CSS
**Animation stack:** Framer Motion + GSAP + Lenis
**Form/Validation:** React Hook Form + Zod
**Icons:** Lucide React

> Dokumen ini adalah hasil pemisahan dari PRD utama YEC Competition Management Platform, difokuskan khusus pada kebutuhan **antarmuka pengguna (UI/UX)**. Untuk kebutuhan API, database, dan business logic server, lihat **PRD_YEC_Backend.md**.

---

## 1. Product Overview (Ringkasan)

### 1.1 Product Name
**Young Entrepreneur Camp (YEC) Competition Management Platform**

### 1.2 Product Purpose
Platform ini mengelola seluruh proses lomba YEC. Dari sisi frontend, sistem menyediakan tiga pengalaman antarmuka berbeda untuk tiga role:

- **Admin** — dashboard kerja untuk mengelola konfigurasi lomba, tim, juri, penugasan, kriteria penilaian, dan hasil.
- **Peserta/Tim** — portal sederhana tanpa akun; akses menggunakan Nama Tim + PIN.
- **Juri** — workspace penilaian dengan login username + password, hanya melihat tim yang menjadi assignment-nya.

### 1.3 Frontend-Relevant Product Principles

1. **Simple for participants.** Tidak ada registrasi akun peserta — form akses harus sesederhana mungkin.
2. **Dynamic evaluation UI.** Form penilaian, kriteria, dan bobot dirender secara dinamis dari data server — **tidak boleh di-hardcode di frontend**.
3. **Server-authoritative.** Frontend tidak melakukan kalkulasi nilai sebagai source of truth; validasi client hanya untuk UX.
4. **No unnecessary realtime.** Tidak menggunakan WebSocket/realtime kecuali kebutuhan baru benar-benar muncul.
5. **Premium public experience, functional app experience.** Landing page ekspresif secara visual; Admin/Juri fokus pada efisiensi kerja.
6. **Mobile-first for participant; desktop-first for admin/judge.**

---

## 2. Goals & Non-Goals (Frontend Scope)

### 2.1 Goals
- Menyediakan landing page event yang kuat secara visual dan memiliki animasi modern.
- Memberikan portal tim sederhana berbasis PIN.
- Menyediakan UI unggah BMC dan Pitching yang jelas statusnya.
- Menyediakan UI Admin untuk mengatur tahapan, sub-tema, juri, assignment, dan template penilaian.
- Menyediakan workspace Juri dengan split-screen PDF viewer + form nilai dinamis.
- Menyediakan UI penetapan hasil dan Juara 1/2/3.

### 2.2 Non-Goals untuk V1
- Chat antar role.
- Notifikasi realtime.
- Pembayaran di UI.
- Video streaming.
- WebSocket-driven UI updates.
- Mobile native app.
- Public leaderboard realtime.

---

## 3. User Roles — Perspektif UI

### 3.1 Admin (UI)
Antarmuka admin menyediakan akses ke: dashboard, pengaturan tahapan, sub-tema, pengumuman, manajemen juri, assignment juri, template penilaian, daftar tim (buat/hapus/export PIN), tabel penilaian BMC & Pitching, dialog penentuan hasil dan juara.

### 3.2 Peserta (UI)
Antarmuka peserta menyediakan: landing page, form akses (Nama Tim + PIN), pemilihan sub-tema, form unggah BMC, status submission, tampilan nilai/hasil setelah dirilis, form unggah Pitching (jika lolos), dan halaman hasil akhir.

UI **tidak boleh** menampilkan: opsi ubah profil, opsi buat akun, data tim lain, detail penilaian juri sebelum hasil dirilis, atau data pribadi juri.

### 3.3 Juri (UI)
Antarmuka juri menyediakan: login, dashboard tugas, daftar tim assigned, workspace evaluasi (PDF viewer + form nilai dinamis), input catatan, dan status kunci penilaian.

UI **tidak boleh** menampilkan opsi untuk: melihat tim yang tidak di-assignment, mengubah assignment, membuat kriteria, menentukan kelulusan/juara, atau mengelola akun juri lain.

---

## 4. High-Level User Journey (UI Flow)

```text
ADMIN PREPARATION (UI)
  ↓
Form settings
  ↓
Form subthemes
  ↓
Builder evaluation templates
  ↓
Form create judges
  ↓
UI assign judges
  ↓
Form create teams + PIN

PARTICIPANT (UI)
  ↓
Landing page
  ↓
Form Team + PIN
  ↓
Form BMC submission
  ↓
Screen: Waiting for evaluation

JUDGE (UI)
  ↓
Login screen
  ↓
List assigned teams
  ↓
Open workspace
  ↓
PDF viewer + dynamic evaluation form
  ↓
Submit score button

ADMIN (UI)
  ↓
Table: evaluation completeness
  ↓
Dialog: Pass / Fail BMC

PARTICIPANT (UI)
  ↓
If PASS → Screen Pitching submission
  ↓
Screen: Pitching evaluation waiting

ADMIN (UI)
  ↓
Screen: final rankings
  ↓
Dialog: Set Champion 1/2/3

PARTICIPANT (UI)
  ↓
Screen: Final result
```

---

## 5. Competition Lifecycle — UI States

Frontend tidak mengontrol transisi tahap, namun harus merender UI sesuai state yang dikembalikan server.

### Stage 1 — BMC Submission
UI menampilkan form pemilihan sub-tema dan dropzone unggah BMC PDF ketika `bmc_submission_open = true`.

### Stage 2 — BMC Evaluation
UI peserta menampilkan status "Sedang dinilai". UI juri menampilkan daftar tim untuk dinilai.

### Stage 3 — BMC Result
UI admin menyediakan tombol/dialog untuk menetapkan PASSED/FAILED (aktif hanya jika data lengkap — validasi state datang dari server). UI peserta menampilkan hasil setelah dirilis.

### Stage 4 — Pitching Submission
UI menampilkan form unggah Pitching hanya untuk tim dengan status PASSED (ditentukan oleh state dari server, bukan logika frontend).

### Stage 5 — Pitching Evaluation
Sama seperti Stage 2, namun untuk template Pitching.

### Stage 6 — Final Result
UI admin menampilkan ranking dan form penentuan juara. UI peserta menampilkan hasil akhir.

---

## 6. Frontend Information Architecture

### 6.1 Public
Routes:
```text
/
```

Landing page berisi:
1. Navbar
2. Hero
3. Event introduction
4. Highlights: Mentorship, Leadership, Pitching
5. Competition Journey
6. Tahapan lomba
7. Announcement
8. FAQ
9. CTA Portal Tim
10. Footer

### 6.2 Participant
Akses via halaman:
```text
/portal
```

Alur Antarmuka Peserta (Single-Page Seamless Experience):
1. **Persistent Header/Navbar**: `PublicNavbar` (`Beranda | Tentang | Portal Tim`) tetap tampil di bagian atas halaman `/portal`.
2. **Pre-Login State**:
   - Menampilkan judul "Portal Tim" & penjelasan fungsi portal.
   - Layout 2 kolom: Kiri penjelasan fitur/manfaat, Kanan Form Login (Select Nama Tim + Input PIN 6 digit).
3. **In-Place Authentication**:
   - Pengguna submit login tanpa pindah halaman (tanpa full-page route redirect).
   - Form login bertransisi secara mulus (*in-place animation*) menampilkan Dashboard Tim langsung di bawah header.
4. **Interactive Demo Bar (Development/Testing Mode)**:
   - Panel switcher warna amber di bawah header untuk mensimulasikan seluruh kondisi tim:
     - `READY` (Unggah BMC + Sub-tema)
     - `SUBMITTED` (Konfirmasi BMC Tersubmit)
     - `WAITING_RESULT` (Banner status evaluasi sedang berlangsung)
     - `PASSED` (Banner celebratory Lolos + Unggah Presentasi Pitching)
     - `FAILED` (Banner motivasi warm & optimistic)
5. **Kontak Support**: Direct link WhatsApp ke Panitia (`081219843922`).


### 6.3 Admin
```text
/admin/dashboard
/admin/settings
/admin/teams
/admin/judges
/admin/evaluations
/admin/evaluations/templates
/admin/evaluations/bmc
/admin/evaluations/pitching
```

Menu sidebar:
```text
OVERVIEW
- Dashboard

MANAGEMENT
- Pengaturan Lomba
- Manajemen Tim
- Manajemen Juri

EVALUATION
- Template Penilaian
- Penilaian BMC
- Penilaian Pitching
```

### 6.4 Judge
```text
/juri/login
/juri/dashboard
/juri/evaluation/[assignmentId]
```

Navigation sangat minimal.

---

## 7. Frontend Design Requirements

### 7.1 Public Landing Page
Landing page harus menerapkan desain dari `design-system.md`.

Karakter visual:
- Adventure.
- Young entrepreneur.
- Warm.
- Premium.
- Playful namun tidak childish.
- Dominan cream/amber/brown/forest.
- Nature-inspired decorative elements.

### 7.2 Application UI
Admin/Juri/Portal peserta menggunakan versi yang lebih clean dari design system yang sama.

Do not:
- Menambahkan neon palette.
- Menggunakan glassmorphism berlebihan.
- Memakai animasi besar pada form/tabel.
- Memakai background foto penuh pada dashboard.

### 7.3 Animation
Gunakan:
- **Framer Motion** untuk UI transition, reveal, hover, stagger.
- **GSAP** hanya untuk cinematic hero/scroll journey yang kompleks.
- **Lenis** untuk smooth scrolling landing page.

Animation budget:
- Landing: expressive.
- Participant: moderate.
- Admin: subtle.
- Judge: minimal.

Semua animasi harus memiliki reduced-motion fallback.

---

## 8. Public Landing Page Components

```text
PublicNavbar
HeroSection
HeroVisual
EventIntro
HighlightGrid
HighlightCard
JourneySection
JourneyNode
CompetitionStages
AnnouncementSection
AnnouncementCard
FaqSection
CtaSection
PublicFooter
```

### Hero behavior
On first load:
1. Background/visual enters.
2. Navbar fades in.
3. Eyebrow enters.
4. Main headline reveals.
5. Supporting text enters.
6. CTA enters.
7. Decorative leaves/visual elements start a subtle loop.

Animation must not block interaction.

---

## 9. Participant Components

```text
ParticipantPortal
TeamAccessForm
TeamSelect
PinInput
PortalHeader
CompetitionProgress
SubmissionCard
BmcSubmissionForm
PitchingSubmissionForm
FileDropzone
SubmissionStatus
ScoreSummary
ResultCard
AnnouncementCard
SupportContact
```

### Participant file constraints (client-side UX validation)

BMC:
- PDF only.
- Configurable max size (dari config server).
- One active submission per stage.

Pitching:
- PPT/PPTX/PDF.
- Configurable max size.
- One active submission per stage.

> Catatan: Validasi ini di sisi client **hanya untuk UX** (mempercepat feedback ke user). Validasi final tetap dilakukan di server (lihat PRD Backend).

---

## 10. Admin Components

```text
AdminLayout
AdminSidebar
AdminHeader
StatCard
StageControl
SubthemeManager
AnnouncementEditor
JudgeTable
JudgeForm
AssignmentManager
TeamTable
TeamForm
PinExportAction
DeleteTeamDialog
EvaluationTemplateList
EvaluationTemplateEditor
CriteriaEditor
CriterionPointEditor
WeightSummary
BmcEvaluationTable
PitchingEvaluationTable
ResultDialog
ChampionSelector
```

---

## 11. Judge Components

```text
JudgeLoginForm
JudgeDashboard
StageTabs
AssignedTeamTable
EvaluationWorkspace
PdfViewer
EvaluationPanel
CriteriaSection
CriterionPointField
ScoreInput
NoteInput
EvaluationSummary
SaveEvaluationButton
ReadonlyEvaluation
```

### Judge workspace layout

Desktop:
```text
55% PDF Viewer | 45% Evaluation Form
```

Tablet:
```text
50% PDF | 50% Form
```

Mobile:
```text
PDF
↓
Evaluation Form
```

PDF ditampilkan langsung di browser (embedded viewer), bukan membuka tab baru.

---

## 12. Dynamic Evaluation UI

### 12.1 Principle
Form evaluasi harus **dirender dinamis** berdasarkan data yang diambil dari API (Template → Criteria → Criterion Points). Tidak boleh ada kriteria, point, atau bobot yang di-hardcode di komponen React.

### 12.2 Contoh Struktur yang Harus Bisa Dirender Dinamis

```text
Template: BMC 2026

Criteria: Inovasi Produk
Weight: 30
Points:
- Keunikan ide
- Solusi masalah
- Tingkat inovasi

Criteria: Market
Weight: 25
Points:
- Target pasar
- Potensi pasar
- Strategi pemasaran
```

### 12.3 Score Input (UI)
Juri mengisi score per point (misal input 0–100) melalui `ScoreInput` komponen dinamis. Nilai agregasi/kalkulasi **tidak dihitung di frontend sebagai source of truth** — frontend hanya boleh menampilkan preview/estimasi non-otoritatif jika diperlukan; nilai final berasal dari server.

### 12.4 BMC Multi-Judge (UI)
Jika Admin melakukan plotting assignment per kriteria, form yang dirender ke Juri hanya menampilkan point yang sesuai assignment-nya (data ini datang dari API assignment, bukan logika filter di frontend).

### 12.5 Pitching Full-Judge (UI)
Untuk Pitching, form menampilkan seluruh kriteria jika assignment scope = ALL.

---

## 13. Evaluation Template Builder UX

Admin membuat template melalui builder UI seperti berikut:

```text
Penilaian BMC 2026

[ + Tambah Kriteria ]

Kriteria 1
Nama: Inovasi Produk
Bobot: 30%

Point:
  Keunikan ide
  Solusi terhadap masalah
  Tingkat inovasi

[ + Tambah Point ]

────────────────────

Kriteria 2
Nama: Market
Bobot: 25%
...

Total Bobot: 55%

[ Simpan Draft ] [ Aktifkan ]
```

Tombol `Aktifkan` di UI harus disabled/divalidasi jika total bobot ≠ 100 atau ada criteria tanpa point — namun validasi otoritatif tetap dilakukan server saat request `activate` dikirim.

---

## 14. Form Validation (Client-Side UX)

Gunakan:
- **React Hook Form**
- **Zod**

Validasi client (untuk UX, bukan source of truth):

### Team
```text
name: required, unique (cek via API)
```

### Judge
```text
name: required
username: required, unique (cek via API)
password: required on create
```

### Criteria
```text
name: required
weight: 0–100
```

### Score
```text
score: 0–100
```

### Upload
```text
mime type
extension
size
stage permission (berdasarkan state dari server)
```

---

## 15. Accessibility

- Semua form field memiliki label.
- Keyboard navigation tersedia.
- Focus state jelas.
- Button tidak hanya mengandalkan warna.
- Status memiliki text label (bukan hanya warna/icon).
- PDF viewer memiliki fallback/open action.
- Animasi menghormati reduced motion.
- Kontras teks mengikuti WCAG AA sebagai baseline.

---

## 16. Responsive Rules

### Desktop ≥ 1024px
- Admin sidebar fixed/collapsible.
- Judge split-screen.
- Landing hero 2-column.

### Tablet 768–1023px
- Admin sidebar collapsible.
- Judge split-screen 50/50.
- Reduced decorative assets.

### Mobile < 768px
- Participant single column.
- Admin sidebar drawer.
- Judge PDF di atas form.
- Tables menjadi card/list atau horizontal scroll terkontrol.
- CTA full width bila diperlukan.

---

## 17. Accessibility & Motion Rules

```css
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms;
  transition-duration: 0.01ms;
  scroll-behavior: auto;
}
```

Untuk GSAP/Framer Motion, cek media query reduced motion sebelum menjalankan loop/parallax.

---

## 18. Frontend Testing Strategy

### UI
- Desktop.
- Tablet.
- Mobile.
- Reduced motion.

### Functional (UI-level)
- Form akses PIN valid/invalid — pesan error jelas.
- State dropzone upload ketika stage open/closed.
- Kondisi tampil form Pitching hanya untuk status PASS (berdasarkan data dari server).
- Judge workspace hanya menampilkan assignment miliknya (data-driven dari API, tapi UI test memastikan tidak ada kebocoran render).
- Validasi form score 0–100 di client.

---

## 19. Recommended Component/Folder Structure

```text
src/components/
  ui/
  landing/
  participant/
  admin/
    dashboard/
    settings/
    teams/
    judges/
    evaluations/
  judge/
    dashboard/
    evaluation/
  evaluation/
```

`components/evaluation` berisi reusable evaluation UI agar BMC dan Pitching tidak membuat engine form terpisah.

---

## 20. Frontend Development Milestones

### Phase 1 — Foundation
- Next.js setup.
- TypeScript.
- Tailwind.
- Design tokens.
- UI primitives.

### Phase 2 — Admin Core UI
- Dashboard.
- Settings.
- Subthemes.
- Teams table & form.
- PIN export UI.
- Judges table & form.
- Assignment manager UI.

### Phase 3 — Participant Portal UI
- Team access form.
- BMC submission UI.
- Submission status UI.
- BMC result UI.
- Pitching submission UI.
- Final result UI.

### Phase 4 — Dynamic Evaluation UI
- Template builder.
- Criteria editor.
- Point editor.
- Weight summary UI.

### Phase 5 — Judge Workspace UI
- Dashboard.
- Assigned team list.
- PDF viewer integration.
- Dynamic form rendering.
- Save/edit UI states.
- Lock state UI.

### Phase 6 — Result Management UI
- BMC pass/fail dialog.
- Pitching summary UI.
- Ranking table.
- Champion selector UI.

### Phase 7 — Polish
- Landing page animation.
- Responsive pass.
- Accessibility pass.
- Loading/error/empty states.
- UI testing.

---

## 21. Frontend Definition of Done

Feature dinyatakan selesai jika:
- UI sesuai `design-system.md`.
- Validation bekerja di client (UX layer) selaras dengan kontrak backend.
- Tidak ada score calculation di frontend sebagai source of truth.
- Mobile layout dapat digunakan.
- Loading/error/empty state tersedia.
- Tidak ada hardcoded criteria/weight/point di React — semua dari API.
- Reduced-motion fallback tersedia di semua animasi.

---

## 22. Final Frontend Architecture Decision

```text
Next.js
React
TypeScript
Tailwind CSS
Framer Motion
GSAP
Lenis
React Hook Form
Zod
Lucide React
```

---

## 23. Design System Reference

**Wajib mengikuti dokumen:** `design-system.md`

Setiap developer/designer harus menganggap `design-system.md` sebagai sumber kebenaran untuk:
- Color tokens.
- Typography.
- Spacing.
- Radius.
- Shadows.
- Buttons.
- Inputs.
- Cards.
- Badges.
- Layout.
- Motion.
- Landing-page visual language.
- Responsive behavior.

Jika terdapat konflik antara implementasi komponen dan design-system, design-system menjadi acuan dan komponen harus disesuaikan kecuali ada keputusan produk baru yang terdokumentasi.

---

## 24. Frontend–Backend Contract Notes

- Frontend **selalu** mengasumsikan bahwa authorization, validasi final, state transition, dan perhitungan nilai dikontrol oleh server (lihat PRD_YEC_Backend.md, khususnya bagian API Route Map, API Authorization Matrix, dan Evaluation Calculation Contract).
- Frontend hanya bertanggung jawab menampilkan state, memberi UX yang responsif, dan mengirim request sesuai kontrak API.
- Perubahan skema evaluasi (kriteria/point/bobot baru) tidak boleh membutuhkan perubahan kode React — cukup perubahan data melalui Admin UI.
