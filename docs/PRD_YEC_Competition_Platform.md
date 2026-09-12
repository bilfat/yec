# PRD — Young Entrepreneur Camp (YEC) Competition Management Platform

**Document:** Product Requirements Document
**Version:** 1.0
**Status:** Baseline / Ready for Development
**Primary stack:** Next.js + React + TypeScript + Tailwind CSS + Prisma + PostgreSQL
**Animation stack:** Framer Motion + GSAP + Lenis
**Storage:** Supabase Storage / S3-compatible Object Storage
**Authentication:** Auth.js

---

## 1. Product Overview

### 1.1 Product Name

**Young Entrepreneur Camp (YEC) Competition Management Platform**

### 1.2 Product Purpose

Platform ini digunakan untuk mengelola seluruh proses lomba/proker YEC dari sisi administrasi, pengumpulan karya, penugasan juri, penilaian BMC, penilaian Pitching, hingga penentuan hasil dan juara.

Sistem dirancang dengan tiga role:

- **Admin** — mengelola konfigurasi lomba, tim, juri, penugasan, kriteria penilaian, hasil tahapan, dan juara.
- **Peserta/Tim** — tidak memiliki akun; mengakses portal menggunakan Nama Tim + PIN.
- **Juri** — memiliki akun username + password dan hanya dapat melihat serta menilai tim yang menjadi assignment-nya.

### 1.3 Product Principles

1. **Simple for participants.** Tidak ada registrasi akun peserta.
2. **Dynamic evaluation.** Kriteria, point indikator, dan bobot dibuat Admin melalui sistem; tidak hardcode di frontend.
3. **Resource-oriented API.** API dikelompokkan berdasarkan resource/domain, bukan berdasarkan halaman.
4. **Server-authoritative.** Semua authorization, state transition, perhitungan nilai, dan lock dikontrol server.
5. **File outside database.** PDF/PPT disimpan di object storage, database hanya menyimpan metadata/path.
6. **No unnecessary realtime.** Tidak menggunakan WebSocket/realtime kecuali kebutuhan baru benar-benar muncul.
7. **Premium public experience, functional app experience.** Landing page ekspresif; Admin/Juri fokus pada pekerjaan.
8. **Mobile-first for participant; desktop-first for admin/judge.**

---

## 2. Goals & Non-Goals

### 2.1 Goals

- Menyediakan landing page event yang kuat secara visual dan memiliki animasi modern.
- Memberikan portal tim sederhana berbasis PIN.
- Memungkinkan peserta mengunggah BMC dan, bila lolos, mengunggah karya Pitching.
- Memungkinkan Admin membuka/menutup tahap lomba.
- Memungkinkan Admin membuat sub-tema.
- Memungkinkan Admin membuat akun Juri.
- Memungkinkan Admin melakukan plotting Juri per tim dan per kelompok kriteria.
- Memungkinkan Admin membuat template penilaian dinamis.
- Memungkinkan Juri melihat karya secara langsung di browser dalam split-screen dengan form nilai.
- Menghitung nilai berdasarkan point + bobot secara konsisten di server.
- Mengunci penilaian ketika Admin sudah menetapkan hasil tahap.
- Memungkinkan Admin menetapkan Juara 1, 2, 3.
- Menyediakan security boundary yang jelas untuk file dan data.

### 2.2 Non-Goals untuk V1

- Chat antar role.
- Notifikasi realtime.
- Pembayaran.
- Video streaming.
- WebSocket.
- AI judging.
- Microservices.
- Mobile native app.
- Public leaderboard realtime.
- Sistem akun peserta individual.

---

## 3. User Roles

### 3.1 Admin

Admin dapat:

- Login.
- Melihat dashboard.
- Mengatur status tahapan.
- Mengelola sub-tema.
- Mengelola pengumuman.
- Mengelola akun Juri.
- Mengatur assignment Juri.
- Mengelola template penilaian.
- Melihat seluruh tim.
- Membuat tim + generate PIN.
- Export daftar PIN.
- Menghapus tim beserta data relasionalnya.
- Melihat karya.
- Melihat status penilaian.
- Menentukan Lolos/Tidak Lolos BMC jika seluruh nilai lengkap.
- Melihat nilai Pitching.
- Menentukan Juara.

### 3.2 Peserta

Peserta dapat:

- Melihat landing page.
- Mengakses portal dengan Nama Tim + PIN.
- Memilih sub-tema ketika BMC submission dibuka.
- Mengunggah BMC PDF.
- Melihat status submission.
- Melihat nilai/hasil BMC setelah dirilis.
- Mengunggah PPT/PDF Pitching jika lolos dan tahap dibuka.
- Melihat hasil akhir.

Peserta tidak dapat:

- Mengubah profil akun.
- Membuat akun.
- Melihat tim lain.
- Melihat penilaian detail juri sebelum hasil dirilis.
- Melihat data pribadi juri.
- Mengakses admin/juri portal.

### 3.3 Juri

Juri dapat:

- Login.
- Melihat dashboard tugas.
- Melihat tim yang ditugaskan.
- Melihat karya yang menjadi assignment.
- Mengisi nilai sesuai kriteria yang ditugaskan.
- Memberikan catatan.
- Mengedit nilai selama tahap belum dikunci Admin.

Juri tidak dapat:

- Melihat tim yang tidak di-assignment.
- Mengubah assignment.
- Membuat kriteria.
- Menentukan kelulusan.
- Menentukan juara.
- Mengelola akun juri lain.
- Membuka file tim lain secara langsung.

---

## 4. High-Level User Journey

```text
ADMIN PREPARATION
  ↓
Create settings
  ↓
Create subthemes
  ↓
Create evaluation templates
  ↓
Create judges
  ↓
Assign judges
  ↓
Create teams + PIN

PARTICIPANT
  ↓
Landing page
  ↓
Team + PIN
  ↓
BMC submission
  ↓
Wait for evaluation

JUDGE
  ↓
Login
  ↓
Assigned teams
  ↓
Open workspace
  ↓
PDF viewer + dynamic evaluation form
  ↓
Submit score

ADMIN
  ↓
Check evaluation completeness
  ↓
Pass / Fail BMC

PARTICIPANT
  ↓
If PASS → Pitching submission
  ↓
Pitching evaluation

ADMIN
  ↓
Review final rankings
  ↓
Set Champion 1/2/3

PARTICIPANT
  ↓
Final result
```

---

## 5. Competition Lifecycle

### Stage 1 — BMC Submission

```text
BMC_SUBMISSION_OPEN = true
```

Peserta dapat memilih sub-tema dan mengunggah BMC PDF.

### Stage 2 — BMC Evaluation

Admin menutup submission dan memastikan assignment Juri aktif.
Juri menilai karya yang ditugaskan.

### Stage 3 — BMC Result

Server memvalidasi seluruh assignment telah selesai.
Admin menentukan:

- PASSED
- FAILED

Setelah hasil disimpan, BMC evaluation dikunci.

### Stage 4 — Pitching Submission

Hanya tim PASSED yang dapat mengunggah PPT/PDF.

### Stage 5 — Pitching Evaluation

Juri Pitching menilai finalis menggunakan template Pitching.

### Stage 6 — Final Result

Admin melihat hasil final dan menetapkan ranking/juara.

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

Bisa tetap satu route utama atau route khusus, misalnya:

```text
/portal
```

State ditentukan server dari kondisi tim.

UI state:

- Access form.
- BMC ready to submit.
- BMC submitted.
- Waiting result.
- BMC passed + Pitching upload.
- BMC failed.
- Pitching submitted.
- Final result.

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

### Participant file constraints

BMC:

- PDF only.
- Configurable max size.
- One active submission per stage.

Pitching:

- PPT/PPTX/PDF.
- Configurable max size.
- One active submission per stage.

Server must validate MIME and extension; client validation is only for UX.

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

### Judge workspace

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

PDF ditampilkan langsung di browser, bukan membuka tab baru.

---

## 12. Dynamic Evaluation System

### 12.1 Principle

Admin membuat:

```text
Evaluation Template
    ↓
Criteria
    ↓
Criterion Points
```

Setiap Criteria mempunyai `weight`.

Total bobot aktif dalam satu template harus **100**.

### 12.2 Example

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

### 12.3 Score Input

Juri mengisi score per point, misalnya 0–100.

Nilai criteria:

```text
average(point_scores) × criteria_weight / 100
```

Nilai final:

```text
sum(all_weighted_criteria_scores)
```

### 12. 4 BMC Multi-Judge

Jika Admin melakukan plotting:

```text
Judge A → Innovation criteria
Judge B → Market criteria
```

Juri hanya mendapatkan point yang sesuai assignment.

### 12.5 Pitching Full-Judge

Untuk Pitching:

```text
Judge C → ALL criteria
Judge D → ALL criteria
```

---

## 13. Database Schema

### 13.1 users

```text
id                 UUID PK
name               VARCHAR(120)
username           VARCHAR(80) UNIQUE
password_hash      TEXT
role               ENUM(ADMIN, JUDGE)
active             BOOLEAN
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### 13.2 teams

```text
id                 UUID PK
name               VARCHAR(150) UNIQUE
pin_hash           TEXT
active             BOOLEAN
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

Catatan: PIN plaintext tidak disimpan.

### 13.3 competition_settings

Satu row aktif.

```text
id                         UUID PK
competition_name           VARCHAR(200)
bmc_submission_open        BOOLEAN
bmc_evaluation_open        BOOLEAN
pitching_submission_open   BOOLEAN
pitching_evaluation_open   BOOLEAN
announcement_title         VARCHAR(200)
announcement_content       TEXT
participant_support_phone  VARCHAR(30)
created_at                 TIMESTAMP
updated_at                 TIMESTAMP
```

### 13.4 subthemes

```text
id                 UUID PK
name               VARCHAR(160)
active             BOOLEAN
sort_order         INT
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### 13.5 evaluation_templates

```text
id                 UUID PK
name               VARCHAR(160)
stage              ENUM(BMC, PITCHING)
description        TEXT NULL
active             BOOLEAN
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

Rule: maksimal satu template aktif per stage.

### 13.6 criteria

```text
id                 UUID PK
template_id        UUID FK → evaluation_templates.id
name               VARCHAR(160)
weight             DECIMAL(5,2)
sort_order         INT
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

Constraint:

```text
weight >= 0
weight <= 100
```

### 13.7 criterion_points

```text
id                 UUID PK
criterion_id       UUID FK → criteria.id
name               VARCHAR(200)
sort_order          INT
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### 13.8 submissions

```text
id                 UUID PK
team_id            UUID FK → teams.id
stage              ENUM(BMC, PITCHING)
subtheme_id        UUID NULL FK → subthemes.id
original_filename  VARCHAR(255)
storage_path       TEXT
mime_type          VARCHAR(100)
file_size          BIGINT
submitted_at       TIMESTAMP
updated_at         TIMESTAMP
```

Unique rule:

```text
(team_id, stage)
```

satu submission aktif per stage.

### 13.9 assignments

```text
id                    UUID PK
judge_id              UUID FK → users.id
team_id               UUID FK → teams.id
stage                 ENUM(BMC, PITCHING)
assignment_scope      ENUM(ALL, CRITERIA)
created_at            TIMESTAMP
updated_at            TIMESTAMP
```

Untuk assignment scope `CRITERIA`, perlu tabel penghubung:

### 13.10 assignment_criteria

```text
assignment_id          UUID FK → assignments.id
criterion_id           UUID FK → criteria.id
PRIMARY KEY (assignment_id, criterion_id)
```

Dengan desain ini, satu Juri dapat menerima beberapa criteria.

### 13.11 evaluations

Satu record per assignment + submission.

```text
id                    UUID PK
assignment_id         UUID FK → assignments.id
submission_id         UUID FK → submissions.id
status                ENUM(PENDING, COMPLETED)
submitted_at          TIMESTAMP NULL
updated_at            TIMESTAMP
```

Unique:

```text
(assignment_id, submission_id)
```

### 13.12 evaluation_scores

Nilai per point.

```text
id                    UUID PK
evaluation_id         UUID FK → evaluations.id
criterion_point_id     UUID FK → criterion_points.id
score                 DECIMAL(5,2)
note                  TEXT NULL
created_at             TIMESTAMP
updated_at             TIMESTAMP
```

Constraint:

```text
score >= 0
score <= 100
```

### 13.13 team_stage_results

```text
id                    UUID PK
team_id               UUID FK → teams.id
stage                 ENUM(BMC, PITCHING)
final_score           DECIMAL(6,2) NULL
result_status         ENUM(PENDING, PASSED, FAILED)
locked_at             TIMESTAMP NULL
created_at             TIMESTAMP
updated_at             TIMESTAMP
```

Unique:

```text
(team_id, stage)
```

### 13.14 final_results

```text
id                    UUID PK
team_id               UUID FK → teams.id
rank                  INT NULL
final_score            DECIMAL(6,2) NULL
created_at             TIMESTAMP
updated_at             TIMESTAMP
```

Constraint:

```text
rank ∈ {1,2,3} OR NULL
```

### 13.15 Optional audit_logs

Untuk V1 dapat dibuat optional.
Jika dibutuhkan:

```text
id
actor_user_id
action
entity_type
entity_id
metadata_json
created_at
```

Tidak wajib untuk versi pertama agar sistem tetap ringan.

---

## 14. Database Relationship

```text
users
 ├── assignments
 │      └── assignment_criteria
 │
teams
 ├── submissions
 ├── assignments
 ├── team_stage_results
 └── final_results

submissions
 └── evaluations
      └── evaluation_scores

 evaluation_templates
 └── criteria
      └── criterion_points

criteria
 └── assignment_criteria
```

---

## 15. API Strategy

### 15.1 Principle

API berdasarkan resource/domain, bukan halaman.

Bad:

```text
/api/admin/bmc/dashboard
/api/admin/bmc/status
/api/juri/bmc/team-list
/api/peserta/bmc-status
```

Good:

```text
/api/teams
/api/submissions
/api/assignments
/api/evaluations
/api/results
```

Response dibatasi berdasarkan role dan authorization.

---

## 16. API Route Map

### Authentication

```text
POST   /api/auth/login
POST   /api/auth/logout
GET    /api/auth/session
```

Auth.js dapat menangani sebagian route internal; endpoint di atas hanya logical contract.

### Participant Access

```text
POST   /api/participant/access
POST   /api/participant/logout
GET    /api/participant/portal
```

`POST /api/participant/access` menerima:

```json
{
  "teamId": "uuid",
  "pin": "583921"
}
```

Response tidak mengembalikan `pin_hash`.

### Settings

```text
GET    /api/settings
PUT    /api/settings
```

Admin-only untuk update.
Public/participant hanya menerima fields yang memang boleh ditampilkan.

### Subthemes

```text
GET    /api/subthemes
POST   /api/subthemes
PUT    /api/subthemes/:id
DELETE /api/subthemes/:id
```

POST/PUT/DELETE: Admin only.

### Teams

```text
GET    /api/teams
POST   /api/teams
GET    /api/teams/:id
DELETE /api/teams/:id
GET    /api/teams/export-pin
```

Admin only kecuali endpoint yang dipakai participant untuk public team selection, dan response harus sangat terbatas.

### Judges

```text
GET    /api/judges
POST   /api/judges
PUT    /api/judges/:id
DELETE /api/judges/:id
```

Admin only.

### Assignments

```text
GET    /api/assignments
POST   /api/assignments
PUT    /api/assignments/:id
DELETE /api/assignments/:id
```

Admin only untuk mutasi.
Juri hanya dapat membaca assignment miliknya melalui authorization-aware query.

### Evaluation Templates

```text
GET    /api/evaluation-templates
POST   /api/evaluation-templates
GET    /api/evaluation-templates/:id
PUT    /api/evaluation-templates/:id
DELETE /api/evaluation-templates/:id
POST   /api/evaluation-templates/:id/activate
```

Admin only untuk perubahan.

### Submissions

```text
GET    /api/submissions
POST   /api/submissions
GET    /api/submissions/:id
```

Upload mutasi harus melalui signed upload/presigned upload atau secure server upload.
GET detail tetap authorization-aware.

### Evaluations

```text
GET    /api/evaluations
GET    /api/evaluations/:id
POST   /api/evaluations
PUT    /api/evaluations/:id
```

Juri hanya dapat membaca/mengubah evaluation yang merupakan assignment-nya dan belum lock.

### Results

```text
GET    /api/results
GET    /api/results/:id
PUT    /api/results/:id
```

Admin mengubah result stage.
Participant hanya membaca hasil tim sendiri melalui portal.

### Dashboard

```text
GET    /api/dashboard/summary
```

Endpoint summary adalah exception berbasis use case agregasi, bukan halaman CRUD. Data hanya berupa count/statistik.

---

## 17. API Authorization Matrix

| Resource | Admin | Judge | Participant |
|---|---|---|---|
| Settings read | Yes | Limited | Public subset |
| Settings write | Yes | No | No |
| Teams read | All | Assigned only | Own only |
| Teams write | Yes | No | No |
| Judges | Yes | Own identity only | No |
| Assignments | Full | Own only | No |
| Evaluation template | Full | Read assigned structure | No |
| Submission create | Admin/Participant rules | No | Own team |
| Submission read | All | Assigned only | Own only |
| Evaluation write | No | Assigned only | No |
| Result write | Yes | No | No |
| Result read | All | As needed | Own only |

---

## 18. File Storage Architecture

### 18.1 Storage

Gunakan private bucket.

Example structure:

```text
competition/
  submissions/
    {teamId}/
      bmc/
        {uuid}.pdf
      pitching/
        {uuid}.pdf
```

### 18.2 Upload Flow

```text
Client
 ↓
Request upload permission
 ↓
Server validates role + stage + team state
 ↓
Signed upload URL
 ↓
Object Storage
 ↓
Client confirms upload
 ↓
Server writes submission metadata
```

### 18.3 Judge File Preview

```text
Judge
 ↓
GET /api/submissions/:id/view
 ↓
Server validates assignment
 ↓
Generate short-lived signed URL
 ↓
PDF Viewer loads URL
```

Jangan membuat PDF public permanent.

### 18.4 Delete Team

Delete harus:

1. Delete database relations using cascade where safe.
2. Delete associated storage objects.
3. Commit/handle failures safely.
4. Return a clear result to Admin.

---

## 19. Business Rules

### Team

- Nama tim wajib unik.
- PIN dibuat server.
- PIN minimal 6 digit/alphanumeric sesuai keputusan final.
- PIN tidak boleh disimpan plaintext.

### BMC Submission

- Hanya dapat upload jika `bmc_submission_open = true`.
- Hanya satu submission aktif per tim.
- Sub-theme harus aktif.
- File harus memenuhi validasi format/size.
- Setelah submitted, peserta tidak dapat mengganti file kecuali kebijakan revisi memang diaktifkan kemudian.

### BMC Evaluation

- Hanya assignment terkait yang dapat menilai.
- Score 0–100.
- Semua required point harus memiliki score sebelum evaluation berstatus COMPLETED.
- Hasil BMC tidak dapat ditentukan jika seluruh assignment belum COMPLETED.
- Setelah PASSED/FAILED, evaluation BMC dikunci.

### Pitching

- Hanya tim PASSED BMC.
- Submission stage harus open.
- Evaluation mengikuti template Pitching aktif.
- Semua assignment harus selesai sebelum final score dianggap complete.

### Champion

- Rank hanya 1, 2, 3.
- Satu rank hanya boleh dimiliki satu tim.
- Admin tidak dapat menetapkan rank pada tim yang tidak memenuhi syarat final.

---

## 20. State Machines

### Participant BMC

```text
NOT_ACCESS
  ↓
ACCESS_GRANTED
  ↓
BMC_READY
  ↓
BMC_SUBMITTED
  ↓
BMC_WAITING_RESULT
  ├── PASSED → PITCHING_READY
  └── FAILED → COMPLETED
```

### Pitching

```text
PITCHING_READY
  ↓
PITCHING_SUBMITTED
  ↓
PITCHING_WAITING_RESULT
  ↓
FINAL_RESULT
```

### Judge evaluation

```text
PENDING
  ↓
IN_PROGRESS (client state only; optional persistence)
  ↓
COMPLETED
  ↓
LOCKED
```

---

## 21. Dashboard Metrics

Admin dashboard minimal:

- Total Tim.
- Total BMC submitted.
- Total Pitching submitted.
- Total BMC passed.
- Total evaluation pending.
- Total final teams.

Jangan menjalankan query berat untuk setiap stat jika count dapat digabung menjadi query agregasi.

---

## 22. Performance Requirements

### 22.1 Target

- Fast initial render untuk landing page.
- Tidak ada polling realtime default.
- Dashboard menggunakan aggregate query.
- File tidak melewati database.
- Preview PDF langsung dari object storage melalui signed URL.
- Lazy-load komponen visual/animasi berat.
- Gunakan `next/image` untuk image assets.
- Gunakan compression untuk artwork yang memungkinkan.

### 22.2 Animation Performance

- Prioritaskan transform/opacity.
- Hindari animasi layout mahal.
- GSAP hanya di section yang membutuhkan.
- Disable/reduce effect untuk `prefers-reduced-motion`.
- Lazy-load decorative visual besar.

### 22.3 Database

Index minimum:

```text
users.username
teams.name
submissions.team_id
submissions.stage
assignments.judge_id
assignments.team_id
assignments.stage
evaluations.assignment_id
evaluations.submission_id
evaluation_scores.evaluation_id
team_stage_results.team_id
team_stage_results.stage
final_results.rank
```

---

## 23. Security Requirements

- Password Juri/Admin di-hash menggunakan Argon2 atau bcrypt.
- PIN peserta di-hash.
- Session menggunakan secure HTTP-only cookie.
- Role authorization dilakukan di server.
- Ownership/assignment check dilakukan di server.
- Tidak pernah mempercayai `teamId`, `judgeId`, atau `assignmentId` dari client tanpa validasi.
- File bucket private.
- Signed URL memiliki TTL pendek.
- Validasi file server-side.
- Sanitize text yang ditampilkan bila ada rich text.
- Rate limit endpoint participant access dan login.
- CSRF protection mengikuti framework/session mechanism.
- Jangan mengirim password hash, PIN hash, internal storage path sensitif, atau data juri yang tidak diperlukan ke client.

---

## 24. Error Handling

API menggunakan format konsisten:

```json
{
  "success": false,
  "error": {
    "code": "EVALUATION_LOCKED",
    "message": "Penilaian sudah dikunci dan tidak dapat diubah."
  }
}
```

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Penilaian berhasil disimpan."
}
```

Error code minimal:

```text
UNAUTHORIZED
FORBIDDEN
NOT_FOUND
VALIDATION_ERROR
STAGE_CLOSED
INVALID_PIN
DUPLICATE_SUBMISSION
EVALUATION_LOCKED
INCOMPLETE_EVALUATION
INVALID_FILE
STORAGE_ERROR
CONFLICT
```

---

## 25. Form Validation

Gunakan:

- React Hook Form.
- Zod.

Validasi minimal:

### Team

```text
name: required, unique
```

### Judge

```text
name: required
username: required, unique
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
stage permission
```

---

## 26. Evaluation Template UX

Admin membuat template seperti:

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

`Aktifkan` hanya boleh jika total bobot = 100 dan seluruh criteria memiliki minimal satu point.

---

## 27. Evaluation Calculation Contract

Untuk satu criteria:

```text
criteria_average = average(all score values)
criteria_contribution = criteria_average × (weight / 100)
```

Final:

```text
final_score = Σ criteria_contribution
```

Untuk multi-judge BMC:

1. Hitung nilai masing-masing assignment.
2. Gabungkan contribution yang memang telah diselesaikan.
3. Terapkan metode agregasi yang ditetapkan sistem.

Rekomendasi V1:

- Setiap juri menghasilkan sub-score berdasarkan kriteria yang menjadi assignment.
- Final score dijumlahkan dari contribution seluruh criteria.
- Jika dua juri menilai criteria yang sama, sistem menggunakan rata-rata score untuk criteria tersebut.

Metode ini harus diimplementasikan dalam satu module server, misalnya:

```text
lib/scoring/calculateEvaluation.ts
lib/scoring/calculateStageResult.ts
```

Tidak boleh ada duplicate calculation logic di React.

---

## 28. Recommended Server Structure

```text
src/
  app/
    api/
      auth/
      participant/
      settings/
      teams/
      judges/
      assignments/
      submissions/
      evaluations/
      evaluation-templates/
      results/
      dashboard/

  actions/
    admin/
    judge/
    participant/

  lib/
    auth/
    db/
    storage/
    scoring/
    validation/
    authorization/
```

Route Handler digunakan untuk resource API.
Server Actions digunakan untuk mutation internal yang cocok.

---

## 29. Recommended Component/Folder Structure

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

## 30. Accessibility

- Semua form field memiliki label.
- Keyboard navigation tersedia.
- Focus state jelas.
- Button tidak hanya mengandalkan warna.
- Status memiliki text label.
- PDF viewer memiliki fallback/open action.
- Animasi menghormati reduced motion.
- Kontras teks mengikuti WCAG AA sebagai baseline.

---

## 31. Responsive Rules

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

## 32. Accessibility & Motion Rules

Add:

```text
@media (prefers-reduced-motion: reduce) {
  animation-duration: 0.01ms;
  transition-duration: 0.01ms;
  scroll-behavior: auto;
}
```

Untuk GSAP/Framer Motion, cek media query reduced motion sebelum menjalankan loop/parallax.

---

## 33. Testing Strategy

### Functional

- Participant access dengan PIN valid/invalid.
- BMC upload ketika open/closed.
- Pitching hanya untuk PASS.
- Judge hanya melihat assignment sendiri.
- Score validation 0–100.
- Evaluation lock.
- Result lock.
- Champion uniqueness.
- Cascade delete.

### Authorization

Test matrix:

```text
Admin → all admin actions
Judge → only assigned actions
Participant → only own team actions
```

### File

- PDF valid.
- PPTX valid.
- File terlalu besar.
- MIME spoof.
- Unauthorized file access.

### UI

- Desktop.
- Tablet.
- Mobile.
- Reduced motion.

### Scoring

Siapkan test case untuk:

- satu criteria.
- beberapa point.
- multi criteria.
- multi judge.
- incomplete evaluation.
- duplicate criteria assignment.
- rounding.

---

## 34. Deployment Architecture

Recommended:

```text
Vercel
  │
  └── Next.js Application
       │
       ├── Server Actions
       ├── Route Handlers
       └── Prisma
            │
            ▼
       PostgreSQL

Supabase Storage / R2
       │
       ├── BMC files
       └── Pitching files
```

Environment variables minimal:

```text
DATABASE_URL
AUTH_SECRET
STORAGE_ENDPOINT / provider-specific vars
STORAGE_BUCKET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
```

---

## 35. Development Milestones

### Phase 1 — Foundation

- Next.js setup.
- TypeScript.
- Tailwind.
- Prisma.
- PostgreSQL.
- Auth.js.
- Design tokens.
- UI primitives.

### Phase 2 — Admin Core

- Dashboard.
- Settings.
- Subthemes.
- Teams.
- PIN generation/export.
- Judges.
- Assignments.

### Phase 3 — Participant Portal

- Team access.
- BMC submission.
- Submission status.
- BMC result.
- Pitching submission.
- Final result.

### Phase 4 — Dynamic Evaluation

- Templates.
- Criteria.
- Points.
- Weights.
- Assignment criteria.
- Scoring engine.

### Phase 5 — Judge Workspace

- Dashboard.
- Assigned teams.
- PDF viewer.
- Dynamic form.
- Save/edit.
- Lock handling.

### Phase 6 — Result Management

- BMC pass/fail.
- Pitching summary.
- Ranking.
- Champion selection.

### Phase 7 — Polish

- Landing page animation.
- Responsive.
- Accessibility.
- Security hardening.
- Loading/error/empty states.
- Testing.

---

## 36. Definition of Done

Feature dinyatakan selesai jika:

- UI sesuai `design-system.md`.
- Role authorization bekerja di server.
- Validation bekerja di client dan server.
- Semua state transition mengikuti business rules.
- Tidak ada score calculation di frontend sebagai source of truth.
- File private dan hanya dapat diakses sesuai authorization.
- Mobile layout dapat digunakan.
- Loading/error/empty state tersedia.
- Tidak ada API khusus yang dibuat hanya karena ada halaman baru jika resource sudah tersedia.
- Tidak ada hardcoded criteria/weight/point di React.
- Test utama lulus.

---

## 37. Final Architecture Decision

### Frontend

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

### Backend

```text
Next.js Route Handlers
Next.js Server Actions
Auth.js
Prisma
PostgreSQL
```

### Storage

```text
Supabase Storage / Cloudflare R2 / S3-compatible
```

### Architectural Style

```text
Modular Monolith
```

Bukan microservices.

### Core Rule

```text
One app
One backend
One relational database
One private object storage
Resource-based API
Server-authoritative business logic
```

---

## 38. Design System Reference

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

## 39. Product Summary

Platform ini sengaja dibuat **cukup besar dari sisi business flow tetapi tetap sederhana dari sisi arsitektur teknis**.

```text
PUBLIC
  Landing Page + Animation
          ↓
PARTICIPANT
  Team + PIN
          ↓
  BMC → Result → Pitching → Final

JUDGE
  Login
    ↓
  Assigned Teams
    ↓
  PDF + Dynamic Evaluation Form

ADMIN
  Settings
    ↓
  Teams + Judges + Assignments
    ↓
  Evaluation Templates
    ↓
  BMC Result
    ↓
  Pitching Result
    ↓
  Champions
```

The core complexity lives in the business rules and dynamic evaluation engine, not in unnecessary infrastructure.
