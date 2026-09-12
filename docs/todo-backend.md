# YEC Backend — Master TODO List

> **RULES PENGERJAAN:**
> - ✅ Tandai item selesai dengan mengganti `[ ]` menjadi `[x]`
> - ❌ **JANGAN menghapus file yang sudah ada** — append/modify saja
> - 📌 Acuan utama: `PRD_YEC_Backend.md` v2.0 untuk arsitektur API, schema, dan business rules
> - 🔐 Server-authoritative: Semua otorisasi, validasi, dan state machine diproses di server
> - 🚫 Tidak ada kalkulasi nilai di client/React sebagai source of truth

---

## 🛠️ DATABASE & ENVIRONMENT SETUP (PETUNJUK UTAMA)

> **Catatan Database:** Project Supabase sudah dibuat. Silakan ikuti langkah penyiapan environment dan push schema berikut.

### 1. Set Environment Variables di `.env` / `.env.local`
Buka file `.env` (atau `.env.local`) dan masukkan URL koneksi Supabase Anda:

```env
# Connection Strings (dapatkan dari Supabase Dashboard -> Project Settings -> Database)
NEXT_PUBLIC_SUPABASE_URL="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
NEXT_PUBLIC_SUPABASE_ANON_KEY="postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase Auth (@supabase/ssr)
SUPABASE_SERVICE_ROLE_KEY="buat-secret-random-32-karakter-atau-bisa-generate-dengan-openssl"
NEXT_PUBLIC_SITE_URL="http://localhost:3000"

# Supabase Storage & Service API Key
SUPABASE_URL="https://[PROJECT_REF].supabase.co"
SUPABASE_SERVICE_ROLE_KEY="eyJ......" # Digunakan di server-side untuk bypass RLS pada storage private
STORAGE_BUCKET="yec-private-submissions"
```

### 2. Push Database Schema ke Supabase
Jalankan perintah berikut di terminal untuk menyelaraskan Supabase SQL Schema dengan Database Supabase Anda:

```bash
# Push schema ke Supabase database via Supabase CLI
npx supabase db push

# (Atau jika menggunakan Supabase SDK (@supabase/supabase-js) langsung)
npx Supabase db push
```

---

## PHASE 0 — Database Schema & Foundation Setup

### 0.1 Supabase Database Setup (`supabase/migrations/schema.sql`)
- [x] Inisialisasi Supabase dalam project (`npx supabase init`)
- [x] Buat enum: `Role` (`ADMIN`, `JUDGE`)
- [x] Buat enum: `CompetitionStage` (`BMC`, `PITCHING`)
- [x] Buat enum: `AssignmentScope` (`ALL`, `CRITERIA`)
- [x] Buat enum: `EvaluationStatus` (`PENDING`, `COMPLETED`)
- [x] Buat enum: `ResultStatus` (`PENDING`, `PASSED`, `FAILED`)
- [x] Buat model `User` (`id`, `name`, `username`, `password_hash`, `role`, `active`, timestamps)
- [x] Buat model `Team` (`id`, `name`, `pin_hash`, `subtheme_id`, `active`, timestamps)
- [x] Buat model `CompetitionSettings` (`id`, `competition_name`, toggle stages, announcements, `participant_support_phone`, `updated_at`)
- [x] Buat model `Subtheme` (`id`, `name`, `active`, `sort_order`, timestamps)
- [x] Buat model `EvaluationTemplate` (`id`, `name`, `stage`, `description`, `active`, timestamps)
- [x] Buat model `Criteria` (`id`, `template_id`, `name`, `weight`, `sort_order`, timestamps)
- [x] Buat model `CriterionPoint` (`id`, `criterion_id`, `name`, `sort_order`, timestamps)
- [x] Buat model `Submission` (`id`, `team_id`, `stage`, `subtheme_id`, `original_filename`, `storage_path`, `mime_type`, `file_size`, timestamps)
- [x] Buat model `Assignment` (`id`, `judge_id`, `team_id`, `stage`, `assignment_scope`, timestamps)
- [x] Buat model `AssignmentCriteria` (`assignment_id`, `criterion_id`)
- [x] Buat model `Evaluation` (`id`, `assignment_id`, `submission_id`, `status`, `notes`, `submitted_at`, `updated_at`)
- [x] Buat model `EvaluationScore` (`id`, `evaluation_id`, `criterion_point_id`, `score`, `updated_at`)
- [x] Buat model `TeamStageResult` (`id`, `team_id`, `stage`, `final_score`, `result_status`, `locked_at`, timestamps)
- [x] Buat model `FinalResult` (`id`, `team_id`, `rank`, `final_score`, timestamps)

### 0.2 Database Migration & Push
- [x] Daftarkan URL database Supabase di `.env` (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`)
- [x] Jalankan `npx supabase db push` atau `npx supabase db push` untuk membuat tabel di Supabase
- [x] Jalankan `npx supabase gen types typescript --local > types/supabase.ts` untuk memperbarui supabase types

### 0.3 Seeder Initial Data (`supabase/seed.sql`)
- [x] Buat script seed untuk akun **Admin Default** (`admin` / `admin123`)
- [x] Buat script seed untuk **CompetitionSettings** awal
- [x] Buat script seed untuk **Subthemes** awal (misal: *Teknologi & Digital*, *Ekonomi Kreatif*, *Agribisnis*)
- [x] Buat script seed untuk **EvaluationTemplate** default BMC & Pitching beserta Criteria & Points
- [x] Tambahkan script `"supabase:reset": "npx supabase db reset"` di `package.json`

---

## PHASE 1 — Authentication & Authorization Infrastructure

### 1.1 Supabase Auth (@supabase/ssr) Setup (Admin & Juri)
- [x] Buat konfigurasi NextAuth (`src/lib/auth.ts` / `src/app/api/auth/[...nextauth]/route.ts`)
- [x] Konfigurasi Credentials Provider untuk validasi username & password via Supabase
- [x] Enkripsi password menggunakan `bcrypt` / `argon2`
- [x] Tambahkan custom claims pada Session JWT: `role`, `id`, `username`
- [x] Integrasikan middleware untuk proteksi route:
  - `/admin/*` → wajib login role `ADMIN`
  - `/juri/*` → wajib login role `JUDGE` atau `ADMIN`
  - Redirect otomatis ke dashboard masing-masing setelah `/login`

### 1.2 Participant PIN Authentication
- [x] Buat helper hashing & perbandingan PIN (`src/lib/security/pin.ts`)
- [x] Buat endpoint `POST /api/participant/access`:
  - Receives `{ teamId, pin }`
  - Verifikasi PIN tim menggunakan hash
  - Set encrypted HTTP-Only Cookie (`yec_participant_session`)
- [x] Buat endpoint `POST /api/participant/logout` (clear cookie)
- [x] Buat helper `getParticipantSession()` untuk memverifikasi session peserta dari cookie

---

## PHASE 2 — Core Admin APIs

### 2.1 Settings API
- [x] Buat `GET /api/settings`:
  - Jika public/participant → kembalikan `competition_name`, `announcement`, `participant_support_phone`, toggle status submission
  - Jika Admin → kembalikan semua field
- [x] Buat `PUT /api/settings` (Admin only):
  - Update toggle status `bmc_submission_open`, `bmc_evaluation_open`, `pitching_submission_open`, `pitching_evaluation_open`
  - Update pengumuman dan kontak support

### 2.2 Subthemes API
- [x] Buat `GET /api/subthemes` (Public/Admin filter active)
- [x] Buat `POST /api/subthemes` (Admin only)
- [x] Buat `PUT /api/subthemes/:id` (Admin only)
- [x] Buat `DELETE /api/subthemes/:id` (Admin only)

### 2.3 Teams & PIN Management API
- [x] Buat `GET /api/teams`:
  - Admin → kembalikan list lengkap tim + subtema + status submission
  - Peserta → kembalikan list ringkas `{ id, name }` untuk dropdown login
- [x] Buat `POST /api/teams` (Admin only):
  - Generate PIN 6 digit unik
  - Simpan `pin_hash` ke DB
  - Simpan temporary plaintext PIN untuk diexport
- [x] Buat `DELETE /api/teams/:id` (Admin only, cascade delete)
- [x] Buat `GET /api/teams/export-pin` (Admin only):
  - Kembalikan CSV file berisi `id, name, pin`

### 2.4 Judges API
- [x] Buat `GET /api/judges` (Admin only)
- [x] Buat `POST /api/judges` (Admin only, create account dengan role `JUDGE`)
- [x] Buat `PUT /api/judges/:id` (Admin only, update nama/password)
- [x] Buat `DELETE /api/judges/:id` (Admin only)

### 2.5 Assignments API
- [x] Buat `GET /api/assignments`:
  - Admin → list semua penugasan juri ke tim
  - Juri → list penugasan khusus juri tersebut
- [x] Buat `POST /api/assignments` (Admin only):
  - Assign juri ke tim per stage (`BMC` / `PITCHING`)
  - Set scope `ALL` atau `CRITERIA`
- [x] Buat `DELETE /api/assignments/:id` (Admin only)



## PHASE 3 — Evaluation Templates & Criteria APIs

### 3.1 Templates & Criteria Management
- [x] Buat `GET /api/evaluation-templates` (Admin & Juri)
- [x] Buat `POST /api/evaluation-templates` (Admin only - Smart Upsert & Activate)
- [x] Buat `GET /api/evaluation-templates/:id` (Include Criteria & Points)
- [x] Buat `PUT /api/evaluation-templates/:id` (Admin only, update kriteria, point & bobot)
- [x] Buat `DELETE /api/evaluation-templates/:id` (Admin only, hanya jika belum aktif/draft)
- [x] Buat `POST /api/evaluation-templates/:id/activate` (Admin only):
  - Validasi: Total bobot (`weight`) seluruh kriteria dalam template HARUS 100%
  - Nonaktifkan template lain pada stage yang sama

---

## PHASE 4 — Participant Portal & Submissions APIs

### 4.1 Participant Portal State API
- [x] Buat `GET /api/participant/portal` (Participant Session Required):
  - Hitung state tim: `BMC_READY`, `BMC_WAITING_RESULT`, `PASSED`, `PITCHING_READY`, `PITCHING_WAITING_RESULT`, `FAILED`, `CHAMPION`
  - Kembalikan data pengumuman & status pengumpulan file

### 4.2 File Upload & Submission API
- [x] Integrasikan Client SDK Supabase Storage di Server-Side (`src/lib/storage/supabase.ts`)
- [x] Buat bucket private di Supabase: `yec-private-submissions`
- [x] Buat `POST /api/submissions` (Participant Session Required):
  - Validasi window submission (misal: `bmc_submission_open = true`)
  - Validasi ukuran file (Max 10MB) dan extension (PDF untuk BMC, PDF/PPT/PPTX untuk Pitching)
  - Upload file ke Supabase Storage (`submissions/{teamId}/{stage}/{uuid}.pdf`)
  - Simpan metadata ke tabel `submissions` (Upsert per team & stage)


---

## PHASE 5 — Judge Evaluation Workspace & Scoring APIs

### 5.1 Judge Workspace API
- [x] Buat `GET /api/evaluations` (Judge Session Required):
  - Ambil list assignment untuk juri yang sedang login
  - Sertakan status tim, nama tim, subtema, dan status penilaian (`PENDING` / `COMPLETED`)
- [x] Buat `GET /api/evaluations/:id` (Judge Session Required):
  - Validasi otorisasi: Assignment harus milik Juri yang login
  - Kembalikan detail berkas peserta, template penilaian aktif, kriteria, dan point skor yang tersimpan

### 5.2 Storage Preview / Signed URL API
- [x] Buat `GET /api/submissions/:id/view` (Judge/Admin Session Required):
  - Validasi hak akses penugasan juri ke submission ini
  - Generate short-lived Signed URL Supabase Storage (TTL: 15 menit)
  - Return URL untuk digunakan pada PDF viewer frontend

### 5.3 Save & Submit Evaluation API
- [x] Buat `PUT /api/evaluations/:id` (Judge Session Required):
  - Validasi: Evaluation belum dikunci (`locked_at == null`)
  - Terima data `{ scores: { [pointId]: number }, notes, isSubmit }`
  - Simpan / Upsert ke `evaluation_scores`
  - Jika `isSubmit == true`: Ubah status evaluation menjadi `COMPLETED` dan catat `submitted_at`


---

## PHASE 6 — Results & Automated Scoring Engine

### 6.1 Server Scoring Engine (`src/lib/scoring/index.ts`)
- [x] Buat fungsi kalkulasi nilai kriteria:
  $$\text{Score}_{\text{criteria}} = \text{Average}(\text{Score}_{\text{points}})$$
- [x] Buat fungsi kalkulasi kontribusi bobot:
  $$\text{Contribution} = \text{Score}_{\text{criteria}} \times \left(\frac{\text{Weight}}{100}\right)$$
- [x] Buat fungsi kalkulasi total skor juri per tim:
  $$\text{JudgeScore} = \sum \text{Contribution}$$
- [x] Buat fungsi agregasi multi-juri per tim:
  $$\text{FinalScore} = \text{Average}(\text{JudgeScores})$$

### 6.2 Results Management API
- [x] Buat `GET /api/results?stage=BMC|PITCHING` (Admin only):
  - Tampilkan list tim, total juri yang menugaskan, juri yang sudah selesai, dan preview kalkulasi `final_score`
- [x] Buat `PUT /api/results/:id` (Admin only):
  - Ubah `result_status` tim (`PASSED` / `FAILED`)
  - Hitung dan kunci `final_score` pada `team_stage_results`
  - Lock semua evaluation juri terkait tim ini (`locked_at = now()`)

### 6.3 Final Champion API
- [x] Buat `POST /api/results/champion` (Admin only):
  - Set Juara 1, Juara 2, Juara 3 ke tabel `final_results`
  - Kunci pengumuman akhir


---

## PHASE 7 — Dashboard Summary, Security & Polish

### 7.1 Admin Dashboard Aggregates API
- [x] Buat `GET /api/dashboard/summary` (Admin only):
  - Aggregate total tim, file terupload, penugasan juri, penilaian completed, dan tim lolos

### 7.2 Data Scrubbing & Security Audit
- [x] Pastikan response API tim **TIDAK PERNAH** membocorkan `pin_hash`
- [x] Pastikan response API user **TIDAK PERNAH** membocorkan `password_hash`
- [x] Pastikan path internal Supabase Storage tidak diexpose langsung tanpa signed URL
- [x] Rate limiting sederhana pada route login & PIN access

---

## 📋 Definition of Done (Backend)

- [x] Schema database berhasil di-push ke Supabase dengan `npx supabase db push`
- [x] Role-based authorization aktif dan diuji di level Server Route Handler / Middleware
- [x] Peserta login via PIN terlindungi dengan HTTP-Only Cookie
- [x] Upload berkas tersimpan aman di Supabase Private Storage dan hanya bisa diakses via Signed URL
- [x] Kalkulasi skor sepenuhnya berjalan di server (`lib/scoring/`)
- [x] Semua endpoint sesuai dengan kontrak `PRD_YEC_Backend.md` v2.0

