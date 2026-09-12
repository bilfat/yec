# YEC Frontend — Master TODO List

> **RULES PENGERJAAN:**
> - ✅ Tandai item selesai dengan mengganti `[ ]` menjadi `[x]`
> - ❌ **JANGAN menghapus file yang sudah ada** — append/modify saja
> - 📌 Acuan utama: `PRD_YEC_Frontend.md` untuk kebutuhan UI, `design-system.md` untuk visual
> - 🎨 Setiap komponen **wajib** mengikuti token warna, tipografi, spacing, dan radius dari `design-system.md`
> - 🚫 Tidak ada hardcode kriteria/bobot/point di React
> - 🚫 Tidak ada kalkulasi nilai di frontend sebagai source of truth

---

## PHASE 0 — Project Setup & Foundation

### 0.1 Inisialisasi Project
- [ ] Buat project Next.js dengan TypeScript (`npx create-next-app@latest`)
- [ ] Konfigurasi Tailwind CSS
- [ ] Install dependencies: `framer-motion`, `gsap`, `@studio-freight/lenis`
- [ ] Install dependencies: `react-hook-form`, `zod`, `@hookform/resolvers`
- [ ] Install dependencies: `lucide-react`
- [ ] Install dependencies: `axios` atau gunakan native `fetch`
- [ ] Konfigurasi path alias (`@/` → `src/`)

### 0.2 Design Tokens (Tailwind Config)
- [ ] Tambah custom color tokens di `tailwind.config.ts`:
  - `yec-amber: #DF7F06`
  - `yec-amber-dark: #A94F05`
  - `yec-forest: #18352B`
  - `yec-brown: #511E00`
  - `yec-cream: #FFF0C9`
  - `yec-paper: #FFF8EA`
  - `yec-white: #FFFFFF`
  - `yec-text: #24170F`
  - `yec-text-secondary: #6F6258`
  - `yec-text-muted: #9C9187`
  - `success: #26845A`
  - `warning: #D97706`
  - `danger: #B54747`
  - `info: #3478A6`
- [ ] Tambah custom font ke Tailwind: `Inter`, `DM Sans`, `DM Serif Display`
- [ ] Tambah custom border-radius tokens: `sm(8px)`, `md(12px)`, `lg(20px)`, `xl(28px)`, `2xl(32px)`, `pill(999px)`
- [ ] Tambah custom shadow tokens: `shadow-card`, `shadow-large`
- [ ] Tambah custom spacing tokens (4px base rhythm)

### 0.3 Global CSS & Fonts
- [ ] Import Google Fonts: `Inter`, `DM Sans`, `DM Serif Display` di `layout.tsx` atau `globals.css`
- [ ] Set default background color ke `yec-paper (#FFF8EA)` di `globals.css`
- [ ] Set default body font ke `Inter`
- [ ] Tambah `prefers-reduced-motion` global rule:
  ```css
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms;
    transition-duration: 0.01ms;
    scroll-behavior: auto;
  }
  ```
- [ ] Set typography scale dasar (hero, h1, h2, h3, body, small, caption)

### 0.4 Folder Structure
- [ ] Buat struktur folder `src/components/ui/`
- [ ] Buat struktur folder `src/components/landing/`
- [ ] Buat struktur folder `src/components/participant/`
- [ ] Buat struktur folder `src/components/admin/dashboard/`
- [ ] Buat struktur folder `src/components/admin/settings/`
- [ ] Buat struktur folder `src/components/admin/teams/`
- [ ] Buat struktur folder `src/components/admin/judges/`
- [ ] Buat struktur folder `src/components/admin/evaluations/`
- [ ] Buat struktur folder `src/components/judge/dashboard/`
- [ ] Buat struktur folder `src/components/judge/evaluation/`
- [ ] Buat struktur folder `src/components/evaluation/` (shared/reusable)
- [ ] Buat struktur folder `src/app/` (Next.js App Router)

---

## PHASE 1 — UI Primitives (Shared Components)

> Semua komponen di sini harus menggunakan design tokens, bukan nilai raw.

### 1.1 Button
- [ ] Buat komponen `Button` dengan variants: `primary`, `secondary`, `dark`, `outline`, `ghost`
- [ ] Implementasi state: `default`, `hover`, `focus`, `disabled`, `loading`
- [ ] Ukuran: `sm`, `md`, `lg`
- [ ] Primary: `bg-yec-amber hover:bg-yec-amber-dark text-white radius-md`
- [ ] Secondary: `bg-yec-cream text-yec-brown`
- [ ] Dark: `bg-yec-brown text-white`
- [ ] Outline: `bg-transparent border-[#D9CFC2]`
- [ ] Pastikan ada focus ring yang visible (accessibility)

### 1.2 Input & Form Elements
- [ ] Buat komponen `Input` — height 44–48px, bg white, border `#DDD3C7`, radius 12px
- [ ] Implementasi focus state: `border-yec-amber + subtle amber box-shadow`
- [ ] Implementasi error state: `border-danger (#B54747)`
- [ ] Buat komponen `Textarea`
- [ ] Buat komponen `Select` (custom styled)
- [ ] Buat komponen `Label` — selalu visible, tidak sebagai placeholder pengganti
- [ ] Buat komponen `FormField` (wrapper Label + Input + HelperText/Error)
- [ ] Buat komponen `HelperText` / `ErrorText`

### 1.3 Card
- [ ] Buat komponen `Card` dengan variant: `public` (cream bg, strong radius, editorial), `app` (white, compact)
- [ ] Public card: radius 28–32px, warm bg, optional decorative SVG
- [ ] App card: white, radius 16–20px, shadow-card

### 1.4 Badge / Status
- [ ] Buat komponen `Badge` dengan variant: `success`, `warning`, `danger`, `info`, `default`
- [ ] Selalu tampilkan text label + warna (jangan warna saja)
- [ ] Badge berbentuk pill (radius-pill)
- [ ] Contoh labels: `SUBMITTED`, `PENDING`, `COMPLETED`, `LOLOS`, `TIDAK LOLOS`, `LOCKED`

### 1.5 Modal / Dialog
- [ ] Buat komponen `Modal` dengan overlay backdrop
- [ ] Animasi: fade in + scale up (Framer Motion)
- [ ] Close on backdrop click & Esc key
- [ ] Accessible: `role="dialog"`, `aria-modal`, focus trap

### 1.6 Toast / Notification
- [ ] Buat komponen `Toast` dengan variant: `success`, `error`, `warning`, `info`
- [ ] Animasi slide in dari sudut kanan atas
- [ ] Auto dismiss setelah beberapa detik

### 1.7 Table
- [ ] Buat komponen `Table` dengan sticky header
- [ ] Row height 56–68px
- [ ] Actions selalu di kolom kanan
- [ ] Status menggunakan komponen `Badge`
- [ ] Mobile: horizontal scroll terkontrol

### 1.8 Skeleton / Loading
- [ ] Buat komponen `Skeleton` (shimmer effect, warm tone)
- [ ] Buat komponen `Spinner` (lightweight)

### 1.9 Empty State
- [ ] Buat komponen `EmptyState` — ilustrasi warm/neutral + pesan singkat
- [ ] Contoh: "Belum ada tim yang terdaftar."

### 1.10 Dropzone / File Upload
- [ ] Buat komponen `FileDropzone` — drag & drop + click to browse
- [ ] Tampilkan tipe file yang diterima dan max size
- [ ] State: idle, dragging, uploading, success, error
- [ ] Validasi client-side: mime type, extension, size (untuk UX only)

### 1.11 Miscellaneous UI
- [ ] Buat komponen `Divider`
- [ ] Buat komponen `Avatar` (initials-based)
- [ ] Buat komponen `Breadcrumb`
- [ ] Buat komponen `Tooltip`
- [ ] Buat komponen `ConfirmDialog` (wrapper Modal untuk konfirmasi hapus/aksi destruktif)

---

## PHASE 2 — Public Landing Page (`/`)

> Visual character: Adventure · Warm · Premium · Playful · Nature-inspired  
> Animasi: expressive — Framer Motion + GSAP + Lenis smooth scroll

### 2.1 Setup Landing Page
- [ ] Inisialisasi Lenis smooth scroll di layout landing page
- [ ] Setup GSAP ScrollTrigger untuk scroll-driven animations
- [ ] Buat `src/app/page.tsx` sebagai entry point landing page

### 2.2 PublicNavbar
- [ ] Desktop: `YEC logo | About · Journey · FAQ · Contact | [Portal Tim]`
- [ ] Mobile: `YEC logo | Hamburger Menu`
- [ ] Behavior: transparent on hero, solid saat scroll
- [ ] Animasi: fade in saat halaman load (Framer Motion)
- [ ] Mobile drawer menu dengan animasi slide
- [ ] `[Portal Tim]` button menggunakan Primary button style (yec-amber)
- [ ] Sticky/fixed position

### 2.3 HeroSection
- [ ] Layout 2 kolom: 60% editorial copy | 40% visual
- [ ] Di bawah `lg` breakpoint: single column
- [ ] Copy structure:
  ```
  [Eyebrow tag: YOUNG ENTREPRENEUR CAMP]
  BUILD YOUR IDEA.
  BUILD YOUR CHARACTER.
  [Deskripsi singkat event]
  [CTA: Akses Portal Tim]
  ```
- [ ] Headline menggunakan `DM Serif Display`, ukuran 64–80px desktop / 40–44px mobile
- [ ] Background: `yec-paper` atau warm gradient — bukan full-photo background

### 2.4 HeroVisual
- [ ] Container gambar/visual dengan radius 28–32px
- [ ] Opsional amber color overlay di atas foto
- [ ] Generate/siapkan placeholder hero image (nature/camp/outdoor theme)
- [ ] Decorative SVG elements: daun, ranting (opacity 5–15%)

### 2.5 Hero Animation Sequence (GSAP Timeline)
- [ ] Background/visual enters (scale 1.04 → 1)
- [ ] Navbar fades in
- [ ] Eyebrow tag slides up
- [ ] Main headline reveals (text reveal / clip-path)
- [ ] Supporting text fades in
- [ ] CTA button enters
- [ ] Decorative elements start subtle loop animation
- [ ] Pastikan: animasi tidak memblokir interaksi
- [ ] Reduced-motion fallback: semua langsung tampil tanpa animasi

### 2.6 EventIntro Section
- [ ] Section pengenalan YEC — apa itu, tujuan, siapa peserta
- [ ] Background: `yec-forest (#18352B)` atau tetap paper (pilih salah satu kontras)
- [ ] Scroll reveal animation (Framer Motion `whileInView`)
- [ ] Typography menggunakan heading H2 + body

### 2.7 HighlightGrid & HighlightCard
- [ ] 3 kartu highlight: **01 Mentorship**, **02 Leadership**, **03 Pitching**
- [ ] Warna bergantian: Cream, Amber, Brown (jangan 3 kartu identik warnanya)
- [ ] Editorial title style (DM Serif Display)
- [ ] Stagger animation saat scroll reveal
- [ ] Opsional: icon atau small illustration per kartu

### 2.8 JourneySection & JourneyNode
- [ ] Tampilkan 4 tahapan sebagai journey visual:
  ```
  01 BUILD    — Business Model Canvas
  02 SELECT   — Evaluation & Selection
  03 PITCH    — Present Your Idea
  04 WIN      — Final Result
  ```
- [ ] Desktop: horizontal path `●──────●──────●──────🏆`
- [ ] Mobile: vertical timeline
- [ ] Scroll-driven path drawing animation (GSAP DrawSVG atau CSS stroke-dashoffset)
- [ ] Reduced-motion: static path, tanpa animasi

### 2.9 CompetitionStages Section
- [ ] Detail tahapan lomba (BMC, Evaluasi, Pitching, Final)
- [ ] Accordion atau card-based layout
- [ ] Scroll reveal per item (Framer Motion `whileInView` + stagger)

### 2.10 AnnouncementSection & AnnouncementCard
- [ ] Tampilkan pengumuman dari `competition_settings` (data dari API)
- [ ] Handle empty state jika tidak ada pengumuman
- [ ] Desain card yang menonjol (border accent amber atau bg cream)

### 2.11 FaqSection
- [ ] Accordion FAQ (expand/collapse dengan animasi smooth)
- [ ] Framer Motion `AnimatePresence` untuk content height animation
- [ ] Minimal 5–8 pertanyaan umum placeholder

### 2.12 CtaSection
- [ ] Section akhir sebelum footer — ajakan ke Portal Tim
- [ ] Background kontras: `yec-forest` atau `yec-brown`
- [ ] CTA button: besar, prominent
- [ ] Copy yang warm & optimistic

### 2.13 PublicFooter
- [ ] Background: `yec-brown (#511E00)`
- [ ] Text: cream/white
- [ ] Informasi: nama event, kontak support, copyright
- [ ] Link navigasi singkat

---

## PHASE 3 — Participant Portal (`/portal`)

> Feel: friendly, guided journey, moderate animation  
> Mobile-first

### 3.1 Setup Portal Route
- [ ] Buat `src/app/portal/page.tsx`
- [ ] Fetch state peserta dari `GET /api/participant/portal`
- [ ] Render UI berdasarkan state yang dikembalikan server (bukan logika client)

### 3.2 TeamAccessForm
- [ ] `TeamSelect` — dropdown list nama tim (dari API, hanya `id` + `name`)
- [ ] `PinInput` — input PIN (masked, 6 karakter)
- [ ] Submit ke `POST /api/participant/access`
- [ ] Error state: "Nama tim atau PIN tidak valid."
- [ ] Loading state saat submit

### 3.3 PortalHeader
- [ ] Tampilkan nama tim yang sedang login
- [ ] Tombol logout
- [ ] Desain sederhana, bukan Admin sidebar

### 3.4 CompetitionProgress (Journey Indicator)
- [ ] Visualisasi tahap perjalanan tim:
  ```
  ● BMC
  │
  ● EVALUATION
  │
  ○ PITCHING
  │
  ○ FINAL
  ```
- [ ] Node aktif/selesai: `yec-amber`; belum aktif: `yec-text-muted`
- [ ] Update otomatis berdasarkan state dari server

### 3.5 SubmissionCard (BMC)
- [ ] Tampilkan status submission BMC saat ini
- [ ] State cards yang perlu dirender:
  - **BMC_READY**: form upload tersedia
  - **BMC_SUBMITTED**: tampilkan info file yang sudah disubmit
  - **BMC_WAITING_RESULT**: "Karyamu sedang dinilai, tunggu hasilnya ya!"
  - **PASSED**: "Tim kamu lolos ke tahap Pitching! 🎉"
  - **FAILED**: "Semangat terus! Terima kasih sudah berpartisipasi."

### 3.6 BmcSubmissionForm
- [ ] Dropdown pilih sub-tema (dari API `/api/subthemes`)
- [ ] `FileDropzone` untuk upload BMC PDF
- [ ] Client validation: PDF only, max size dari config server (UX only)
- [ ] Progress upload indicator
- [ ] Submit ke `POST /api/submissions`
- [ ] Hanya tampil jika `bmc_submission_open = true`

### 3.7 PitchingSubmissionForm
- [ ] `FileDropzone` untuk upload PPT/PPTX/PDF
- [ ] Client validation: PPT/PPTX/PDF, max size dari config server (UX only)
- [ ] Submit ke `POST /api/submissions`
- [ ] Hanya tampil jika peserta `PASSED` BMC DAN `pitching_submission_open = true`

### 3.8 SubmissionStatus
- [ ] Badge status submission: `SUBMITTED`, `PENDING`, dst.
- [ ] Tanggal/waktu submit
- [ ] Nama file yang diupload

### 3.9 ScoreSummary
- [ ] Tampilkan nilai/skor setelah dirilis Admin
- [ ] Desain sederhana — angka besar + label
- [ ] Hanya tampil jika hasil sudah dirilis

### 3.10 ResultCard
- [ ] Tampilkan hasil akhir (LOLOS / TIDAK LOLOS / Juara)
- [ ] Jika juara: tampilkan ranking (1/2/3) dengan visual yang celebratory
- [ ] Copy tone yang warm & optimistic

### 3.11 AnnouncementCard (Portal)
- [ ] Tampilkan pengumuman dari settings di dalam portal
- [ ] Desain compact (versi kecil dari landing page announcement)

### 3.12 SupportContact
- [ ] Tampilkan kontak support dari `participant_support_phone`
- [ ] Link ke WhatsApp atau phone

---

## PHASE 4 — Admin Panel (`/admin/*`)

> Feel: professional, data-oriented, calm operations console  
> Desktop-first, sidebar layout

### 4.1 AdminLayout
- [ ] Buat `src/app/admin/layout.tsx`
- [ ] Sidebar + main content area layout
- [ ] Background: `#FFF8EA` (paper) untuk main, `#FFFFFF` untuk sidebar
- [ ] Auth guard: redirect ke login jika bukan Admin

### 4.2 AdminSidebar
- [ ] Logo YEC di atas sidebar
- [ ] Menu navigasi dengan section labels uppercase/small:
  ```
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
- [ ] Active state: `yec-amber` indicator/highlight di menu aktif
- [ ] Desktop: fixed sidebar
- [ ] Mobile: sidebar sebagai drawer (overlay) dengan tombol hamburger
- [ ] Subtle hover animation per menu item

### 4.3 AdminHeader
- [ ] Page title (dinamis sesuai halaman aktif)
- [ ] Info nama admin
- [ ] Tombol logout
- [ ] Mobile: tombol toggle sidebar

### 4.4 Admin Dashboard (`/admin/dashboard`)
- [ ] Buat `src/app/admin/dashboard/page.tsx`
- [ ] Grid `StatCard` untuk metrics:
  - Total Tim
  - Total BMC Submitted
  - Total BMC Passed
  - Total Pitching Submitted
  - Total Evaluasi Pending
  - Total Final Teams
- [ ] `StatCard`: icon + angka besar + label, bg white, shadow-card, radius-lg
- [ ] Animasi subtle: stagger card masuk (Framer Motion)

### 4.5 Pengaturan Lomba (`/admin/settings`)
- [ ] Buat `src/app/admin/settings/page.tsx`
- [ ] `StageControl` — toggle switch untuk:
  - BMC Submission Open/Close
  - BMC Evaluation Open/Close
  - Pitching Submission Open/Close
  - Pitching Evaluation Open/Close
- [ ] `SubthemeManager` — CRUD sub-tema:
  - List sub-tema dengan drag-to-reorder (sort_order)
  - Form tambah sub-tema (inline atau modal)
  - Toggle aktif/nonaktif per sub-tema
  - Hapus dengan `ConfirmDialog`
- [ ] `AnnouncementEditor` — textarea untuk judul + konten pengumuman
- [ ] Field: `competition_name`, `participant_support_phone`
- [ ] Tombol Save Changes

### 4.6 Manajemen Tim (`/admin/teams`)
- [ ] Buat `src/app/admin/teams/page.tsx`
- [ ] `TeamTable` — kolom: No, Nama Tim, Status, Submission BMC, Submission Pitching, Result, Actions
- [ ] Search/filter tim berdasarkan nama atau status
- [ ] `TeamForm` — dialog/modal buat tim baru (nama tim saja; PIN di-generate server)
- [ ] Tampilkan PIN setelah generate (one-time display, copy to clipboard)
- [ ] `PinExportAction` — tombol export daftar PIN (CSV/Excel)
- [ ] `DeleteTeamDialog` — `ConfirmDialog` hapus tim + warning cascade delete
- [ ] Row click → drawer/modal detail tim

### 4.7 Manajemen Juri (`/admin/judges`)
- [ ] Buat `src/app/admin/judges/page.tsx`
- [ ] `JudgeTable` — kolom: Nama, Username, Status Aktif, Jumlah Assignment, Actions
- [ ] `JudgeForm` — modal form: nama, username, password (create only), toggle aktif
- [ ] Edit juri (password opsional saat edit)
- [ ] Hapus juri dengan `ConfirmDialog`
- [ ] `AssignmentManager` — kelola assignment juri per tim:
  - Pilih Juri + pilih Tim + pilih Stage (BMC/Pitching)
  - Pilih scope: ALL atau CRITERIA (pilih criteria spesifik dari template aktif)
  - List assignment yang sudah ada (bisa hapus)

### 4.8 Template Penilaian (`/admin/evaluations/templates`)
- [ ] Buat `src/app/admin/evaluations/templates/page.tsx`
- [ ] `EvaluationTemplateList` — list template BMC dan Pitching
- [ ] Status badge: DRAFT / ACTIVE
- [ ] Tombol: Edit, Aktifkan, Hapus
- [ ] Buat template baru → buka `EvaluationTemplateEditor`
- [ ] `EvaluationTemplateEditor` — builder UI:
  - Nama template + stage (BMC/Pitching)
  - `CriteriaEditor`:
    - Tambah criteria (nama + bobot/weight)
    - `CriterionPointEditor`: tambah point per criteria
    - Reorder criteria dan point (drag atau up/down)
    - Hapus criteria/point
  - `WeightSummary`: tampilkan total bobot secara real-time — harus = 100 untuk Aktifkan
  - Tombol `[Simpan Draft]` — selalu tersedia
  - Tombol `[Aktifkan]` — disabled jika total bobot ≠ 100 atau ada criteria tanpa point

### 4.9 Penilaian BMC (`/admin/evaluations/bmc`)
- [ ] Buat `src/app/admin/evaluations/bmc/page.tsx`
- [ ] `BmcEvaluationTable` — kolom: Tim, Sub-tema, Jumlah Juri, Status Evaluasi, Score, Result Status, Actions
- [ ] Filter: by status evaluasi, by result status
- [ ] Lihat detail evaluasi per tim (drawer/modal)
- [ ] `ResultDialog` — dialog penetapan PASSED/FAILED:
  - Hanya aktif jika seluruh assignment COMPLETED (validasi dari server)
  - Konfirmasi + warning tidak bisa diubah

### 4.10 Penilaian Pitching (`/admin/evaluations/pitching`)
- [ ] Buat `src/app/admin/evaluations/pitching/page.tsx`
- [ ] `PitchingEvaluationTable` — kolom: Tim, Status Evaluasi, Score, Actions
- [ ] Lihat detail evaluasi per tim
- [ ] `ChampionSelector` — UI penetapan Juara 1, 2, 3:
  - Dropdown pilih tim per rank
  - Satu rank hanya boleh satu tim
  - Konfirmasi sebelum submit

---

## PHASE 5 — Judge (Juri) Portal (`/juri/*`)

> Feel: focused evaluation workspace, minimal animation  
> Desktop-first, tapi responsive

### 5.1 Juri Login (`/juri/login`)
- [ ] Buat `src/app/juri/login/page.tsx`
- [ ] `JudgeLoginForm`:
  - Input username
  - Input password (masked)
  - Submit ke `POST /api/auth/login`
  - Error state: "Username atau password salah."
  - Loading state saat submit
- [ ] Background: clean, menggunakan `yec-paper`
- [ ] Tidak ada opsi registrasi

### 5.2 Juri Dashboard (`/juri/dashboard`)
- [ ] Buat `src/app/juri/dashboard/page.tsx`
- [ ] `JudgeDashboard` — tampilkan nama juri + summary tugas
- [ ] `StageTabs` — tab BMC / Pitching (tampil hanya jika ada assignment)
- [ ] `AssignedTeamTable` — kolom: Nama Tim, Stage, Status Evaluasi, Actions
- [ ] Status badge: PENDING, COMPLETED, LOCKED
- [ ] Tombol "Mulai Nilai" → ke `/juri/evaluation/[assignmentId]`

### 5.3 Evaluation Workspace (`/juri/evaluation/[assignmentId]`)
- [ ] Buat `src/app/juri/evaluation/[assignmentId]/page.tsx`
- [ ] `EvaluationWorkspace` — split-screen layout:
  - **Desktop (≥ 1024px)**: 55% PDF Viewer | 45% Evaluation Form
  - **Tablet (768–1023px)**: 50% PDF | 50% Form
  - **Mobile (< 768px)**: PDF di atas → Form di bawah (stacked)
- [ ] Fetch assignment detail + submission + template dari API

### 5.4 PdfViewer
- [ ] Embed PDF langsung di browser (bukan buka tab baru sebagai primary workflow)
- [ ] Gunakan `<iframe>` atau library PDF viewer (react-pdf / PDF.js)
- [ ] PDF dimuat dari signed URL (`GET /api/submissions/:id/view`)
- [ ] Support scroll + zoom
- [ ] Fallback: tombol "Buka di Tab Baru" jika embedded gagal

### 5.5 EvaluationPanel
- [ ] `EvaluationPanel` — form di sisi kanan workspace
- [ ] Header: nama tim + nama juri + stage
- [ ] `CriteriaSection` per criteria yang menjadi assignment:
  - Label criteria + bobot (%)
  - List `CriterionPointField` per point:
    - Label nama point
    - `ScoreInput` — input angka 0–100 dengan validasi client
- [ ] `NoteInput` — textarea catatan (optional)
- [ ] `EvaluationSummary` — preview estimasi score (non-otoritatif, clearly labeled)
- [ ] `SaveEvaluationButton`:
  - Aktif selama belum LOCKED
  - Loading state saat save
  - Success feedback (toast + checkmark)
- [ ] `ReadonlyEvaluation` — tampilan jika sudah LOCKED (read-only)

---

## PHASE 6 — Shared / Reusable Evaluation UI

> `src/components/evaluation/` — dipakai oleh Admin & Juri, agar tidak duplikasi

- [ ] Buat komponen `EvaluationFormRenderer` — render form evaluasi secara dinamis dari data API
- [ ] Buat komponen `CriteriaSection` — reusable per criteria
- [ ] Buat komponen `CriterionPointField` — reusable per point
- [ ] Buat komponen `ScoreInput` — input angka 0–100 dengan validasi
- [ ] Buat komponen `WeightBadge` — tampilkan bobot criteria
- [ ] Buat komponen `ScorePreview` — estimasi non-otoritatif (frontend only, clearly labeled)

---

## PHASE 7 — Auth & Route Protection

- [ ] Setup Auth.js di Next.js (session, JWT, HTTP-only cookie)
- [ ] Buat middleware untuk proteksi route `/admin/*` — hanya role ADMIN
- [ ] Buat middleware untuk proteksi route `/juri/*` — hanya role JUDGE (kecuali `/juri/login`)
- [ ] Participant portal: session berbeda (cookie dari `POST /api/participant/access`)
- [ ] Redirect ke halaman yang sesuai jika sudah login:
  - Admin → `/admin/dashboard`
  - Juri → `/juri/dashboard`
- [ ] Handle session expired dengan redirect ke login

---

## PHASE 8 — API Integration (Data Fetching)

> Semua data dari server. Tidak ada data dummy di production.

### 8.1 API Client Setup
- [ ] Buat utility `src/lib/api.ts` — wrapper fetch dengan error handling konsisten
- [ ] Handle format error: `{ success: false, error: { code, message } }`
- [ ] Handle format success: `{ success: true, data: {}, message: "" }`

### 8.2 Data Fetching per Feature
- [ ] Landing: `GET /api/settings` (public — announcement, competition name)
- [ ] Landing: `GET /api/subthemes` (public — untuk tampilan)
- [ ] Portal access: `POST /api/participant/access`
- [ ] Portal state: `GET /api/participant/portal`
- [ ] Admin dashboard: `GET /api/dashboard/summary`
- [ ] Admin settings: `GET /api/settings` + `PUT /api/settings`
- [ ] Teams: `GET /api/teams` + `POST /api/teams` + `DELETE /api/teams/:id`
- [ ] Teams export: `GET /api/teams/export-pin`
- [ ] Judges: CRUD `/api/judges`
- [ ] Assignments: CRUD `/api/assignments`
- [ ] Templates: CRUD `/api/evaluation-templates` + activate
- [ ] Submissions: `POST /api/submissions` (upload flow)
- [ ] Evaluations: `GET /api/evaluations` + `GET /api/evaluations/:id` + `PUT /api/evaluations/:id`
- [ ] Results: `GET /api/results` + `PUT /api/results/:id`
- [ ] File view: `GET /api/submissions/:id/view` (signed URL untuk PDF viewer)

---

## PHASE 9 — Loading, Error & Empty States

> Wajib tersedia di setiap halaman/komponen yang fetch data.

- [ ] Setiap halaman admin memiliki `loading.tsx` (Next.js) atau skeleton
- [ ] Setiap tabel memiliki `EmptyState` component
- [ ] Setiap form memiliki error state dari server (toast + field-level error)
- [ ] Halaman 404 custom dengan design YEC
- [ ] Halaman error 500 custom
- [ ] Koneksi gagal: pesan retry yang friendly

---

## PHASE 10 — Responsive & Accessibility Pass

### 10.1 Responsive
- [ ] Landing page: mobile layout < 1024px (single column hero, reduced decorative)
- [ ] Portal peserta: full single column di semua ukuran
- [ ] Admin sidebar: drawer di mobile (< 768px), collapsible di tablet (768–1023px)
- [ ] Admin tables: horizontal scroll di mobile, atau konversi ke card
- [ ] Judge split-screen: stacked di mobile, 50/50 di tablet, 55/45 di desktop
- [ ] CTA button full-width di mobile jika diperlukan

### 10.2 Accessibility
- [ ] Semua form field memiliki `<label>` visible
- [ ] Keyboard navigation di semua interaksi (Tab, Enter, Esc)
- [ ] Focus state visible di semua elemen interaktif
- [ ] Tombol tidak hanya mengandalkan warna untuk konveying state
- [ ] Status selalu memiliki text label (bukan hanya badge warna)
- [ ] `aria-*` ditambahkan hanya jika memang diperlukan (modal, dialog, dll.)
- [ ] PDF viewer memiliki fallback action jika browser tidak support embed
- [ ] Kontras warna WCAG AA minimum

### 10.3 Reduced Motion
- [ ] Semua animasi Framer Motion mengecek `useReducedMotion()` hook
- [ ] Semua GSAP animation mengecek `window.matchMedia('(prefers-reduced-motion: reduce)')`
- [ ] Landing page hero sequence: skip ke final state jika reduced motion aktif
- [ ] Decorative loop animation: dihentikan jika reduced motion aktif
- [ ] Lenis scroll: dinonaktifkan jika reduced motion aktif

---

## PHASE 11 — Polish & Final QA

### 11.1 Design QA Checklist
- [ ] Semua halaman menggunakan YEC color tokens (tidak ada raw hex di luar tokens)
- [ ] Typography mengikuti hierarchy yang didefinisikan (hero/h1/h2/h3/body/small/caption)
- [ ] Border radius konsisten menggunakan tokens
- [ ] Shadows menggunakan `shadow-card` atau `shadow-large` (warm, soft)
- [ ] Button states lengkap: hover, focus, disabled, loading
- [ ] Form labels selalu visible (bukan hanya placeholder)
- [ ] Status colors menggunakan semantic tokens
- [ ] Desktop layout semua halaman berfungsi
- [ ] Mobile layout semua halaman berfungsi
- [ ] Reduced motion semua animasi berfungsi
- [ ] Landing animation tidak menghambat performance (Lighthouse check)
- [ ] Admin/Juri animation tidak mengganggu workflow

### 11.2 Cross-browser & Performance
- [ ] Test di Chrome, Firefox, Safari
- [ ] Lazy-load komponen visual/animasi berat di landing page
- [ ] Gunakan `next/image` untuk semua gambar (optimasi otomatis)
- [ ] Cleanup Lenis/GSAP di `useEffect` return (prevent memory leak)

### 11.3 SEO (Landing Page)
- [ ] Title tag: "Young Entrepreneur Camp — Competition Platform"
- [ ] Meta description yang deskriptif
- [ ] Satu `<h1>` per halaman
- [ ] Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- [ ] Unique ID untuk elemen interaktif penting

---

## ⚠️ Constraint Penting — JANGAN Dilanggar

1. **JANGAN hardcode** kriteria, bobot, atau point evaluasi di React — semua dari API
2. **JANGAN hitung** nilai akhir di frontend sebagai source of truth — tampilkan dari server
3. **JANGAN tampilkan** data tim lain di portal peserta
4. **JANGAN tampilkan** detail penilaian sebelum Admin merilis hasil
5. **JANGAN buat** buka tab baru sebagai primary workflow di judge workspace — PDF harus embedded
6. **JANGAN gunakan** warna neon atau palette di luar design system
7. **JANGAN hapus** file yang sudah ada — append/modify saja
8. **JANGAN** glassmorphism berlebihan di Admin/Juri
9. **SELALU** sediakan loading, error, dan empty state di setiap halaman
10. **SELALU** respek `prefers-reduced-motion`
