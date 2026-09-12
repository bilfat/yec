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
- [x] Buat project Next.js dengan TypeScript (`npx create-next-app@latest`)
- [x] Konfigurasi Tailwind CSS
- [x] Install dependencies: `framer-motion`, `gsap`, `@studio-freight/lenis`
- [x] Install dependencies: `react-hook-form`, `zod`, `@hookform/resolvers`
- [x] Install dependencies: `lucide-react`
- [x] Install dependencies: `axios` atau gunakan native `fetch`
- [x] Konfigurasi path alias (`@/` → `src/`)

### 0.2 Design Tokens (Tailwind Config)
- [x] Tambah custom color tokens di `tailwind.config.ts`:
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
- [x] Tambah custom font ke Tailwind: `Inter`, `DM Sans`, `DM Serif Display`
- [x] Tambah custom border-radius tokens: `sm(8px)`, `md(12px)`, `lg(20px)`, `xl(28px)`, `2xl(32px)`, `pill(999px)`
- [x] Tambah custom shadow tokens: `shadow-card`, `shadow-large`
- [x] Tambah custom spacing tokens (4px base rhythm)

### 0.3 Global CSS & Fonts
- [x] Import Google Fonts: `Inter`, `DM Sans`, `DM Serif Display` di `layout.tsx` atau `globals.css`
- [x] Set default background color ke `yec-paper (#FFF8EA)` di `globals.css`
- [x] Set default body font ke `Inter`
- [x] Tambah `prefers-reduced-motion` global rule:
  ```css
  @media (prefers-reduced-motion: reduce) {
    animation-duration: 0.01ms;
    transition-duration: 0.01ms;
    scroll-behavior: auto;
  }
  ```
- [x] Set typography scale dasar (hero, h1, h2, h3, body, small, caption)

### 0.4 Folder Structure
- [x] Buat struktur folder `src/components/ui/`
- [x] Buat struktur folder `src/components/landing/`
- [x] Buat struktur folder `src/components/participant/`
- [x] Buat struktur folder `src/components/admin/dashboard/`
- [x] Buat struktur folder `src/components/admin/settings/`
- [x] Buat struktur folder `src/components/admin/teams/`
- [x] Buat struktur folder `src/components/admin/judges/`
- [x] Buat struktur folder `src/components/admin/evaluations/`
- [x] Buat struktur folder `src/components/judge/dashboard/`
- [x] Buat struktur folder `src/components/judge/evaluation/`
- [x] Buat struktur folder `src/components/evaluation/` (shared/reusable)
- [x] Buat struktur folder `src/app/` (Next.js App Router)

---

## PHASE 1 — UI Primitives (Shared Components)

> Semua komponen di sini harus menggunakan design tokens, bukan nilai raw.

### 1.1 Button
- [x] Buat komponen `Button` dengan variants: `primary`, `secondary`, `dark`, `outline`, `ghost`
- [x] Implementasi state: `default`, `hover`, `focus`, `disabled`, `loading`
- [x] Ukuran: `sm`, `md`, `lg`
- [x] Primary: `bg-yec-amber hover:bg-yec-amber-dark text-white radius-md`
- [x] Secondary: `bg-yec-cream text-yec-brown`
- [x] Dark: `bg-yec-brown text-white`
- [x] Outline: `bg-transparent border-[#D9CFC2]`
- [x] Pastikan ada focus ring yang visible (accessibility)

### 1.2 Input & Form Elements
- [x] Buat komponen `Input` — height 44–48px, bg white, border `#DDD3C7`, radius 12px
- [x] Implementasi focus state: `border-yec-amber + subtle amber box-shadow`
- [x] Implementasi error state: `border-danger (#B54747)`
- [x] Buat komponen `Textarea`
- [x] Buat komponen `Select` (custom styled)
- [x] Buat komponen `Label` — selalu visible, tidak sebagai placeholder pengganti
- [x] Buat komponen `FormField` (wrapper Label + Input + HelperText/Error)
- [x] Buat komponen `HelperText` / `ErrorText`

### 1.3 Card
- [x] Buat komponen `Card` dengan variant: `public` (cream bg, strong radius, editorial), `app` (white, compact)
- [x] Public card: radius 28–32px, warm bg, optional decorative SVG
- [x] App card: white, radius 16–20px, shadow-card

### 1.4 Badge / Status
- [x] Buat komponen `Badge` dengan variant: `success`, `warning`, `danger`, `info`, `default`
- [x] Selalu tampilkan text label + warna (jangan warna saja)
- [x] Badge berbentuk pill (radius-pill)
- [x] Contoh labels: `SUBMITTED`, `PENDING`, `COMPLETED`, `LOLOS`, `TIDAK LOLOS`, `LOCKED`

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
- [x] Inisialisasi Lenis smooth scroll di layout landing page
- [x] Setup GSAP ScrollTrigger untuk scroll-driven animations
- [x] Buat `src/app/page.tsx` sebagai entry point landing page

### 2.2 PublicNavbar
- [x] Desktop: `YEC logo | About · Journey · FAQ · Contact | [Portal Tim]`
- [x] Mobile: `YEC logo | Hamburger Menu`
- [x] Behavior: transparent on hero, solid saat scroll
- [x] Animasi: fade in saat halaman load (Framer Motion)
- [x] Mobile drawer menu dengan animasi slide
- [x] `[Portal Tim]` button menggunakan Primary button style (yec-amber)
- [x] Sticky/fixed position

### 2.3 HeroSection
- [x] Layout 2 kolom: 60% editorial copy | 40% visual
- [x] Di bawah `lg` breakpoint: single column
- [x] Copy structure:
  ```
  [Eyebrow tag: YOUNG ENTREPRENEUR CAMP]
  BUILD YOUR IDEA.
  BUILD YOUR CHARACTER.
  [Deskripsi singkat event]
  [CTA: Akses Portal Tim]
  ```
- [x] Headline menggunakan `DM Serif Display`, ukuran 64–80px desktop / 40–44px mobile
- [x] Background: `yec-paper` atau warm gradient — bukan full-photo background

### 2.4 HeroVisual
- [x] Container gambar/visual dengan radius 28–32px
- [x] Opsional amber color overlay di atas foto
- [x] Generate/siapkan placeholder hero image (nature/camp/outdoor theme)
- [x] Decorative SVG elements: daun, ranting (opacity 5–15%)

### 2.5 Hero Animation Sequence (GSAP Timeline)
- [x] Background/visual enters (scale 1.04 → 1)
- [x] Navbar fades in
- [x] Eyebrow tag slides up
- [x] Main headline reveals (text reveal / clip-path)
- [x] Supporting text fades in
- [x] CTA button enters
- [x] Decorative elements start subtle loop animation
- [x] Pastikan: animasi tidak memblokir interaksi
- [x] Reduced-motion fallback: semua langsung tampil tanpa animasi

### 2.6 EventIntro Section
- [x] Section pengenalan YEC — apa itu, tujuan, siapa peserta
- [x] Background: `yec-forest (#18352B)` atau tetap paper (pilih salah satu kontras)
- [x] Scroll reveal animation (Framer Motion `whileInView`)
- [x] Typography menggunakan heading H2 + body

### 2.7 HighlightGrid & HighlightCard
- [x] 3 kartu highlight: **01 Mentorship**, **02 Leadership**, **03 Pitching**
- [x] Warna bergantian: Cream, Amber, Brown (jangan 3 kartu identik warnanya)
- [x] Editorial title style (DM Serif Display)
- [x] Stagger animation saat scroll reveal
- [x] Opsional: icon atau small illustration per kartu

### 2.8 JourneySection & JourneyNode
- [x] Tampilkan 4 tahapan sebagai journey visual:
  ```
  01 BUILD    — Business Model Canvas
  02 SELECT   — Evaluation & Selection
  03 PITCH    — Present Your Idea
  04 WIN      — Final Result
  ```
- [x] Desktop: horizontal path `●──────●──────●──────🏆`
- [x] Mobile: vertical timeline
- [x] Scroll-driven path drawing animation (GSAP DrawSVG atau CSS stroke-dashoffset)
- [x] Reduced-motion: static path, tanpa animasi

### 2.9 CompetitionStages Section
- [x] Detail tahapan lomba (BMC, Evaluasi, Pitching, Final)
- [x] Accordion atau card-based layout
- [x] Scroll reveal per item (Framer Motion `whileInView` + stagger)

### 2.10 AnnouncementSection & AnnouncementCard
- [x] Tampilkan pengumuman dari `competition_settings` (data dari API)
- [x] Handle empty state jika tidak ada pengumuman
- [x] Desain card yang menonjol (border accent amber atau bg cream)

### 2.11 FaqSection
- [x] Accordion FAQ (expand/collapse dengan animasi smooth)
- [x] Framer Motion `AnimatePresence` untuk content height animation
- [x] Minimal 5–8 pertanyaan umum placeholder

### 2.12 CtaSection
- [x] Section akhir sebelum footer — ajakan ke Portal Tim
- [x] Background kontras: `yec-forest` atau `yec-brown`
- [x] CTA button: besar, prominent
- [x] Copy yang warm & optimistic

### 2.13 PublicFooter
- [x] Background: `yec-brown (#511E00)`
- [x] Text: cream/white
- [x] Informasi: nama event, kontak support, copyright
- [x] Link navigasi singkat

---

## PHASE 3 — Participant Portal (`/portal`)

> Feel: friendly, guided journey, moderate animation  
> Mobile-first

### 3.1 Setup Portal Route
- [x] Buat `src/app/portal/page.tsx`
- [x] Fetch state peserta dari `GET /api/participant/portal`
- [x] Render UI berdasarkan state yang dikembalikan server (bukan logika client)

### 3.2 TeamAccessForm
- [x] `TeamSelect` — dropdown list nama tim (dari API, hanya `id` + `name`)
- [x] `PinInput` — input PIN (masked, 6 karakter)
- [x] Submit ke `POST /api/participant/access`
- [x] Error state: "Nama tim atau PIN tidak valid."
- [x] Loading state saat submit

### 3.3 PortalHeader
- [x] Tampilkan nama tim yang sedang login
- [x] Tombol logout
- [x] Desain sederhana, bukan Admin sidebar

### 3.4 CompetitionProgress (Journey Indicator)
- [x] Visualisasi tahap perjalanan tim:
  ```
  ● BMC
  │
  ● EVALUATION
  │
  ○ PITCHING
  │
  ○ FINAL
  ```
- [x] Node aktif/selesai: `yec-amber`; belum aktif: `yec-text-muted`
- [x] Update otomatis berdasarkan state dari server

### 3.5 SubmissionCard (BMC)
- [x] Tampilkan status submission BMC saat ini
- [x] State cards yang perlu dirender:
  - **BMC_READY**: form upload tersedia
  - **BMC_SUBMITTED**: tampilkan info file yang sudah disubmit
  - **BMC_WAITING_RESULT**: "Karyamu sedang dinilai, tunggu hasilnya ya!"
  - **PASSED**: "Tim kamu lolos ke tahap Pitching! 🎉"
  - **FAILED**: "Semangat terus! Terima kasih sudah berpartisipasi."

### 3.6 BmcSubmissionForm
- [x] Dropdown pilih sub-tema (dari API `/api/subthemes`)
- [x] `FileDropzone` untuk upload BMC PDF
- [x] Client validation: PDF only, max size dari config server (UX only)
- [x] Progress upload indicator
- [x] Submit ke `POST /api/submissions`
- [x] Hanya tampil jika `bmc_submission_open = true`

### 3.7 PitchingSubmissionForm
- [x] `FileDropzone` untuk upload PPT/PPTX/PDF
- [x] Client validation: PPT/PPTX/PDF, max size dari config server (UX only)
- [x] Submit ke `POST /api/submissions`
- [x] Hanya tampil jika peserta `PASSED` BMC DAN `pitching_submission_open = true`

### 3.8 SubmissionStatus
- [x] Badge status submission: `SUBMITTED`, `PENDING`, dst.
- [x] Tanggal/waktu submit
- [x] Nama file yang diupload

### 3.9 ScoreSummary
- [x] Tampilkan nilai/skor setelah dirilis Admin
- [x] Desain sederhana — angka besar + label
- [x] Hanya tampil jika hasil sudah dirilis

### 3.10 ResultCard
- [x] Tampilkan hasil akhir (LOLOS / TIDAK LOLOS / Juara)
- [x] Jika juara: tampilkan ranking (1/2/3) dengan visual yang celebratory
- [x] Copy tone yang warm & optimistic

### 3.11 AnnouncementCard (Portal)
- [x] Tampilkan pengumuman dari settings di dalam portal
- [x] Desain compact (versi kecil dari landing page announcement)

### 3.12 SupportContact
- [x] Tampilkan kontak support dari `participant_support_phone`
- [x] Link ke WhatsApp atau phone

---

## PHASE 4 — Admin Panel (`/admin/*`)

> Feel: professional, data-oriented, calm operations console  
> Desktop-first, sidebar layout

### 4.1 AdminLayout
- [x] Buat `src/app/admin/layout.tsx`
- [x] Sidebar + main content area layout
- [x] Background: `#FFF8EA` (paper) untuk main, `#FFFFFF` untuk sidebar
- [x] Auth guard: redirect ke login jika bukan Admin

### 4.2 AdminSidebar
- [x] Logo YEC di atas sidebar
- [x] Menu navigasi dengan section labels uppercase/small:
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
- [x] Active state: `yec-amber` indicator/highlight di menu aktif
- [x] Desktop: fixed sidebar
- [x] Mobile: sidebar sebagai drawer (overlay) dengan tombol hamburger
- [x] Subtle hover animation per menu item

### 4.3 AdminHeader
- [x] Page title (dinamis sesuai halaman aktif)
- [x] Info nama admin
- [x] Tombol logout
- [x] Mobile: tombol toggle sidebar

### 4.4 Admin Dashboard (`/admin/dashboard`)
- [x] Buat `src/app/admin/dashboard/page.tsx`
- [x] Grid `StatCard` untuk metrics:
  - Total Tim
  - Total BMC Submitted
  - Total BMC Passed
  - Total Pitching Submitted
  - Total Evaluasi Pending
  - Total Final Teams
- [x] `StatCard`: icon + angka besar + label, bg white, shadow-card, radius-lg
- [x] Animasi subtle: stagger card masuk (Framer Motion)

### 4.5 Pengaturan Lomba (`/admin/settings`)
- [x] Buat `src/app/admin/settings/page.tsx`
- [x] `StageControl` — toggle switch untuk:
  - BMC Submission Open/Close
  - BMC Evaluation Open/Close
  - Pitching Submission Open/Close
  - Pitching Evaluation Open/Close
- [x] `SubthemeManager` — CRUD sub-tema:
  - List sub-tema dengan drag-to-reorder (sort_order)
  - Form tambah sub-tema (inline atau modal)
  - Toggle aktif/nonaktif per sub-tema
  - Hapus dengan `ConfirmDialog`
- [x] `AnnouncementEditor` — textarea untuk judul + konten pengumuman
- [x] Field: `competition_name`, `participant_support_phone`
- [x] Tombol Save Changes

### 4.6 Manajemen Tim (`/admin/teams`)
- [x] Buat `src/app/admin/teams/page.tsx`
- [x] `TeamTable` — kolom: No, Nama Tim, Status, Submission BMC, Submission Pitching, Result, Actions
- [x] Search/filter tim berdasarkan nama atau status
- [x] `TeamForm` — dialog/modal buat tim baru (nama tim saja; PIN di-generate server)
- [x] Tampilkan PIN setelah generate (one-time display, copy to clipboard)
- [x] `PinExportAction` — tombol export daftar PIN (CSV/Excel)
- [x] `DeleteTeamDialog` — `ConfirmDialog` hapus tim + warning cascade delete
- [x] Row click → drawer/modal detail tim

### 4.7 Manajemen Juri (`/admin/judges`)
- [x] Buat `src/app/admin/judges/page.tsx`
- [x] `JudgeTable` — kolom: Nama, Username, Status Aktif, Jumlah Assignment, Actions
- [x] `JudgeForm` — modal form: nama, username, password (create only), toggle aktif
- [x] Edit juri (password opsional saat edit)
- [x] Hapus juri dengan `ConfirmDialog`
- [x] `AssignmentManager` — kelola assignment juri per tim:
  - Pilih Juri + pilih Tim + pilih Stage (BMC/Pitching)
  - Pilih scope: ALL atau CRITERIA (pilih criteria spesifik dari template aktif)
  - List assignment yang sudah ada (bisa hapus)

### 4.8 Template Penilaian (`/admin/evaluations/templates`)
- [x] Buat `src/app/admin/evaluations/templates/page.tsx`
- [x] `EvaluationTemplateList` — list template BMC dan Pitching
- [x] Status badge: DRAFT / ACTIVE
- [x] Tombol: Edit, Aktifkan, Hapus
- [x] Buat template baru → buka `EvaluationTemplateEditor`
- [x] `EvaluationTemplateEditor` — builder UI:
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
- [x] Buat `src/app/admin/evaluations/bmc/page.tsx`
- [x] `BmcEvaluationTable` — kolom: Tim, Sub-tema, Jumlah Juri, Status Evaluasi, Score, Result Status, Actions
- [x] Filter: by status evaluasi, by result status
- [x] Lihat detail evaluasi per tim (drawer/modal)
- [x] `ResultDialog` — dialog penetapan PASSED/FAILED:
  - Hanya aktif jika seluruh assignment COMPLETED (validasi dari server)
  - Konfirmasi + warning tidak bisa diubah

### 4.10 Penilaian Pitching (`/admin/evaluations/pitching`)
- [x] Buat `src/app/admin/evaluations/pitching/page.tsx`
- [x] `PitchingEvaluationTable` — kolom: Tim, Status Evaluasi, Score, Actions
- [x] Lihat detail evaluasi per tim
- [x] `ChampionSelector` — UI penetapan Juara 1, 2, 3:
  - Dropdown pilih tim per rank
  - Satu rank hanya boleh satu tim
  - Konfirmasi sebelum submit

---

## PHASE 5 — Judge (Juri) Portal (`/juri/*`)

> Feel: focused evaluation workspace, minimal animation  
> Desktop-first, tapi responsive

### 5.1 Juri Login (`/juri/login`)
- [x] Buat `src/app/juri/login/page.tsx`
- [x] `JudgeLoginForm`:
  - Input username
  - Input password (masked)
  - Submit ke `POST /api/auth/login`
  - Error state: "Username atau password salah."
  - Loading state saat submit
- [x] Background: clean, menggunakan `yec-paper`
- [x] Tidak ada opsi registrasi

### 5.2 Juri Dashboard (`/juri/dashboard`)
- [x] Buat `src/app/juri/dashboard/page.tsx`
- [x] `JudgeDashboard` — tampilkan nama juri + summary tugas
- [x] `StageTabs` — tab BMC / Pitching (tampil hanya jika ada assignment)
- [x] `AssignedTeamTable` — kolom: Nama Tim, Stage, Status Evaluasi, Actions
- [x] Status badge: PENDING, COMPLETED, LOCKED
- [x] Tombol "Mulai Nilai" → ke `/juri/evaluation/[assignmentId]`

### 5.3 Evaluation Workspace (`/juri/evaluation/[assignmentId]`)
- [x] Buat `src/app/juri/evaluation/[assignmentId]/page.tsx`
- [x] `EvaluationWorkspace` — split-screen layout:
  - **Desktop (≥ 1024px)**: 55% PDF Viewer | 45% Evaluation Form
  - **Tablet (768–1023px)**: 50% PDF | 50% Form
  - **Mobile (< 768px)**: PDF di atas → Form di bawah (stacked)
- [x] Fetch assignment detail + submission + template dari API

### 5.4 PdfViewer
- [x] Embed PDF langsung di browser (bukan buka tab baru sebagai primary workflow)
- [x] Gunakan `<iframe>` atau library PDF viewer (react-pdf / PDF.js)
- [x] PDF dimuat dari signed URL (`GET /api/submissions/:id/view`)
- [x] Support scroll + zoom
- [x] Fallback: tombol "Buka di Tab Baru" jika embedded gagal

### 5.5 EvaluationPanel
- [x] `EvaluationPanel` — form di sisi kanan workspace
- [x] Header: nama tim + nama juri + stage
- [x] `CriteriaSection` per criteria yang menjadi assignment:
  - Label criteria + bobot (%)
  - List `CriterionPointField` per point:
    - Label nama point
    - `ScoreInput` — input angka 0–100 dengan validasi client
- [x] `NoteInput` — textarea catatan (optional)
- [x] `EvaluationSummary` — preview estimasi score (non-otoritatif, clearly labeled)
- [x] `SaveEvaluationButton`:
  - Aktif selama belum LOCKED
  - Loading state saat save
  - Success feedback (toast + checkmark)
- [x] `ReadonlyEvaluation` — tampilan jika sudah LOCKED (read-only)

---

## PHASE 6 — Shared / Reusable Evaluation UI

> `src/components/evaluation/` — dipakai oleh Admin & Juri, agar tidak duplikasi

- [x] Buat komponen `EvaluationFormRenderer` — render form evaluasi secara dinamis dari data API
- [x] Buat komponen `CriteriaSection` — reusable per criteria
- [x] Buat komponen `CriterionPointField` — reusable per point
- [x] Buat komponen `ScoreInput` — input angka 0–100 dengan validasi
- [x] Buat komponen `WeightBadge` — tampilkan bobot criteria
- [x] Buat komponen `ScorePreview` — estimasi non-otoritatif (frontend only, clearly labeled)

---

## PHASE 7 — Auth & Route Protection

- [x] Setup Supabase Auth di Next.js (session, JWT, HTTP-only cookie)
- [x] Buat middleware untuk proteksi route `/admin/*` — hanya role ADMIN
- [x] Buat middleware untuk proteksi route `/juri/*` — hanya role JUDGE (kecuali `/juri/login`)
- [x] Participant portal: session berbeda (cookie dari `POST /api/participant/access`)
- [x] Redirect ke halaman yang sesuai jika sudah login:
  - Admin → `/admin/dashboard`
  - Juri → `/juri/dashboard`
- [x] Handle session expired dengan redirect ke login

---

## PHASE 8 — API Integration (Data Fetching)

> Semua data dari server. Tidak ada data dummy di production.

### 8.1 API Client Setup
- [x] Buat utility `src/lib/api.ts` — wrapper fetch dengan error handling konsisten
- [x] Handle format error: `{ success: false, error: { code, message } }`
- [x] Handle format success: `{ success: true, data: {}, message: "" }`

### 8.2 Data Fetching per Feature
- [x] Landing: `GET /api/settings` (public — announcement, competition name)
- [x] Landing: `GET /api/subthemes` (public — untuk tampilan)
- [x] Portal access: `POST /api/participant/access`
- [x] Portal state: `GET /api/participant/portal`
- [x] Admin dashboard: `GET /api/dashboard/summary`
- [ ] Admin settings: `GET /api/settings` + `PUT /api/settings`
- [x] Teams: `GET /api/teams` + `POST /api/teams` + `DELETE /api/teams/:id`
- [x] Teams export: `GET /api/teams/export-pin`
- [x] Judges: CRUD `/api/judges`
- [x] Assignments: CRUD `/api/assignments`
- [x] Templates: CRUD `/api/evaluation-templates` + activate
- [x] Submissions: `POST /api/submissions` (upload flow)
- [x] Evaluations: `GET /api/evaluations` + `GET /api/evaluations/:id` + `PUT /api/evaluations/:id`
- [x] Results: `GET /api/results` + `PUT /api/results/:id`
- [x] File view: `GET /api/submissions/:id/view` (signed URL untuk PDF viewer)

---

### 🔹 Phase 9: Loading, Error & Empty States (UX Polish)
- [x] Skeletons & Loading UI: `loading.tsx` untuk dashboard admin dan portal.
- [x] Empty States: Ilustrasi jika belum ada tim/juri yang terdaftar.
- [x] Error Boundary & Error Pages: `error.tsx`, `not-found.tsx` custom.
- [x] Toast Notifications: Notifikasi sukses/error yang dinamis dari API response.rver (toast + field-level error)
- [x] Halaman 404 custom dengan design YEC
- [x] Halaman error 500 custom
- [x] Koneksi gagal: pesan retry yang friendly

---

## PHASE 10 — Responsive & Accessibility Pass

### 10.1 Responsive
- [x] Landing page: mobile layout < 1024px (single column hero, reduced decorative)
- [x] Portal peserta: full single column di semua ukuran
- [x] Admin sidebar: drawer di mobile (< 768px), collapsible di tablet (768–1023px)
- [x] Admin tables: horizontal scroll di mobile, atau konversi ke card
- [x] Judge split-screen: stacked di mobile, 50/50 di tablet, 55/45 di desktop
- [x] CTA button full-width di mobile jika diperlukan

### 10.2 Accessibility
- [x] Semua form field memiliki `<label>` visible
- [x] Keyboard navigation di semua interaksi (Tab, Enter, Esc)
- [x] Focus state visible di semua elemen interaktif
- [x] Tombol tidak hanya mengandalkan warna untuk konveying state
- [x] Status selalu memiliki text label (bukan hanya badge warna)
- [x] `aria-*` ditambahkan hanya jika memang diperlukan (modal, dialog, dll.)
- [x] PDF viewer memiliki fallback action jika browser tidak support embed
- [x] Kontras warna WCAG AA minimum

### 10.3 Reduced Motion
- [ ] Semua animasi Framer Motion mengecek `useReducedMotion()` hook
- [ ] Semua GSAP animation mengecek `window.matchMedia('(prefers-reduced-motion: reduce)')`
- [ ] Landing page hero sequence: skip ke final state jika reduced motion aktif
- [ ] Decorative loop animation: dihentikan jika reduced motion aktif
- [ ] Lenis scroll: dinonaktifkan jika reduced motion aktif

---

## PHASE 11 — Polish & Final QA

### 11.1 Design QA Checklist
- [x] Semua halaman menggunakan YEC color tokens (tidak ada raw hex di luar tokens)
- [x] Typography mengikuti hierarchy yang didefinisikan (hero/h1/h2/h3/body/small/caption)
- [x] Border radius konsisten menggunakan tokens
- [x] Shadows menggunakan `shadow-card` atau `shadow-large` (warm, soft)
- [x] Button states lengkap: hover, focus, disabled, loading
- [x] Form labels selalu visible (bukan hanya placeholder)
- [x] Status colors menggunakan semantic tokens
- [x] Desktop layout semua halaman berfungsi
- [x] Mobile layout semua halaman berfungsi
- [x] Reduced motion semua animasi berfungsi
- [x] Landing animation tidak menghambat performance (Lighthouse check)
- [x] Admin/Juri animation tidak mengganggu workflow

### 11.2 Cross-browser & Performance
- [x] Test di Chrome, Firefox, Safari
- [x] Lazy-load komponen visual/animasi berat di landing page
- [x] Gunakan `next/image` untuk semua gambar (optimasi otomatis)
- [x] Cleanup Lenis/GSAP di `useEffect` return (prevent memory leak)

### 11.3 SEO (Landing Page)
- [x] Title tag: "Young Entrepreneur Camp — Competition Platform"
- [x] Meta description yang deskriptif
- [x] Satu `<h1>` per halaman
- [x] Semantic HTML (`<nav>`, `<main>`, `<section>`, `<article>`, `<footer>`)
- [x] Unique ID untuk elemen interaktif penting

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
