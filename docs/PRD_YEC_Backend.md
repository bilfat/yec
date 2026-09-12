# PRD — Young Entrepreneur Camp (YEC) Competition Platform — **BACKEND**

**Document:** Product Requirements Document (Backend Scope)
**Version:** 1.0
**Status:** Baseline / Ready for Development
**Primary stack:** Next.js Route Handlers + Server Actions + Prisma + PostgreSQL
**Authentication:** Auth.js
**Storage:** Supabase Storage / S3-compatible Object Storage

> Dokumen ini adalah hasil pemisahan dari PRD utama YEC Competition Management Platform, difokuskan khusus pada kebutuhan **server, API, database, dan business logic**. Untuk kebutuhan UI/UX, lihat **PRD_YEC_Frontend.md**.

---

## 1. Product Overview (Ringkasan)

### 1.1 Product Name
**Young Entrepreneur Camp (YEC) Competition Management Platform**

### 1.2 Product Purpose
Backend mengelola seluruh proses lomba/proker YEC dari sisi administrasi, pengumpulan karya, penugasan juri, penilaian BMC, penilaian Pitching, hingga penentuan hasil dan juara — dengan tiga role:

- **Admin** — konfigurasi lomba, tim, juri, penugasan, kriteria penilaian, hasil tahapan, juara.
- **Peserta/Tim** — tanpa akun; autentikasi via Nama Tim + PIN yang di-hash.
- **Juri** — akun username + password, otorisasi dibatasi hanya ke assignment miliknya.

### 1.3 Backend-Relevant Product Principles

1. **Dynamic evaluation.** Kriteria, point indikator, dan bobot dibuat Admin melalui sistem dan disimpan di database; tidak hardcode di frontend.
2. **Resource-oriented API.** API dikelompokkan berdasarkan resource/domain, bukan berdasarkan halaman.
3. **Server-authoritative.** Semua authorization, state transition, perhitungan nilai, dan lock dikontrol server.
4. **File outside database.** PDF/PPT disimpan di object storage; database hanya menyimpan metadata/path.
5. **No unnecessary realtime.** Tidak menggunakan WebSocket/realtime kecuali kebutuhan baru benar-benar muncul.

---

## 2. Goals & Non-Goals (Backend Scope)

### 2.1 Goals
- Autentikasi Admin/Juri dan akses PIN peserta yang aman.
- CRUD sub-tema, template penilaian dinamis, juri, dan tim.
- Plotting Juri per tim dan per kelompok kriteria (assignment scope).
- Kalkulasi nilai berdasarkan point + bobot secara konsisten dan otoritatif di server.
- Mengunci penilaian ketika Admin sudah menetapkan hasil tahap.
- Business rule penentuan Juara 1, 2, 3.
- Security boundary yang jelas untuk file dan data (signed URL, authorization check).

### 2.2 Non-Goals untuk V1
- Chat antar role.
- Notifikasi realtime.
- Pembayaran.
- Video streaming.
- WebSocket.
- AI judging.
- Microservices.
- Public leaderboard realtime.
- Sistem akun peserta individual.

---

## 3. User Roles — Perspektif Authorization

### 3.1 Admin (Server-side permissions)
- Full CRUD: settings, subthemes, announcements, judges, assignments, evaluation templates, teams.
- Read all submissions, evaluations status.
- Otorisasi menentukan Lolos/Tidak Lolos BMC — hanya bila seluruh assignment evaluation berstatus COMPLETED.
- Otorisasi menentukan Juara — hanya untuk tim yang memenuhi syarat final.
- Delete tim beserta cascade data relasional + storage objects.

### 3.2 Peserta (Server-side permissions)
Diperbolehkan (setelah validasi PIN):
- Read state tim sendiri.
- Create submission (BMC/Pitching) sesuai state stage dan status kelulusan.
- Read hasil setelah dirilis Admin.

Tidak diperbolehkan (harus ditolak di server, bukan hanya disembunyikan di UI):
- Read data tim lain.
- Read detail penilaian juri sebelum hasil dirilis.
- Read data pribadi juri.
- Mutasi apapun di luar submission miliknya sendiri.

### 3.3 Juri (Server-side permissions)
Diperbolehkan:
- Read assignment miliknya saja (query harus authorization-aware, bukan filter di client).
- Read submission yang menjadi assignment-nya (via signed URL).
- Create/update evaluation scores untuk assignment miliknya, selama belum di-lock.

Tidak diperbolehkan (harus divalidasi server):
- Read/mutasi assignment/tim yang bukan miliknya.
- Mengubah assignment.
- Membuat/mengubah kriteria.
- Menentukan kelulusan atau juara.
- Mengelola akun juri lain.
- Mengakses file tim lain secara langsung (tanpa signed URL yang tervalidasi).

---

## 4. Competition Lifecycle — Server State & Business Rules

### Stage 1 — BMC Submission
```text
BMC_SUBMISSION_OPEN = true
```
Server memvalidasi sub-tema aktif dan stage terbuka sebelum menerima submission.

### Stage 2 — BMC Evaluation
Admin menutup submission dan mengaktifkan assignment Juri. Server membatasi akses evaluasi hanya untuk assignment yang valid.

### Stage 3 — BMC Result
Server memvalidasi seluruh assignment telah COMPLETED sebelum mengizinkan Admin menetapkan:
- PASSED
- FAILED

Setelah hasil disimpan, server mengunci (lock) BMC evaluation — tidak menerima update lagi dari endpoint evaluasi.

### Stage 4 — Pitching Submission
Server hanya menerima upload dari tim dengan `result_status = PASSED` pada stage BMC.

### Stage 5 — Pitching Evaluation
Sama seperti Stage 2, dengan template Pitching aktif.

### Stage 6 — Final Result
Server menghitung/menyediakan data ranking; Admin menetapkan juara melalui endpoint yang divalidasi (rank unik, tim memenuhi syarat).

---

## 5. Database Schema

### 5.1 users
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

### 5.2 teams
```text
id                 UUID PK
name               VARCHAR(150) UNIQUE
pin_hash           TEXT
active             BOOLEAN
created_at         TIMESTAMP
updated_at         TIMESTAMP
```
Catatan: PIN plaintext tidak disimpan.

### 5.3 competition_settings
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

### 5.4 subthemes
```text
id                 UUID PK
name               VARCHAR(160)
active             BOOLEAN
sort_order         INT
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### 5.5 evaluation_templates
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

### 5.6 criteria
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

### 5.7 criterion_points
```text
id                 UUID PK
criterion_id       UUID FK → criteria.id
name               VARCHAR(200)
sort_order          INT
created_at         TIMESTAMP
updated_at         TIMESTAMP
```

### 5.8 submissions
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

### 5.9 assignments
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

### 5.10 assignment_criteria
```text
assignment_id          UUID FK → assignments.id
criterion_id           UUID FK → criteria.id
PRIMARY KEY (assignment_id, criterion_id)
```
Dengan desain ini, satu Juri dapat menerima beberapa criteria.

### 5.11 evaluations
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

### 5.12 evaluation_scores
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

### 5.13 team_stage_results
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

### 5.14 final_results
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

### 5.15 Optional audit_logs
Untuk V1 dapat dibuat optional. Jika dibutuhkan:
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

## 6. Database Relationship

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

## 7. API Strategy

### 7.1 Principle
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

## 8. API Route Map

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
Admin-only untuk update. Public/participant hanya menerima fields yang memang boleh ditampilkan.

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
Admin only untuk mutasi. Juri hanya dapat membaca assignment miliknya melalui authorization-aware query.

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
Upload mutasi harus melalui signed upload/presigned upload atau secure server upload. GET detail tetap authorization-aware.

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
Admin mengubah result stage. Participant hanya membaca hasil tim sendiri melalui portal.

### Dashboard
```text
GET    /api/dashboard/summary
```
Endpoint summary adalah exception berbasis use case agregasi, bukan halaman CRUD. Data hanya berupa count/statistik.

---

## 9. API Authorization Matrix

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

## 10. File Storage Architecture

### 10.1 Storage
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

### 10.2 Upload Flow
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

### 10.3 Judge File Preview
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

### 10.4 Delete Team
Delete harus:
1. Delete database relations using cascade where safe.
2. Delete associated storage objects.
3. Commit/handle failures safely.
4. Return a clear result to Admin.

---

## 11. Business Rules

### Team
- Nama tim wajib unik.
- PIN dibuat server.
- PIN minimal 6 digit/alphanumeric sesuai keputusan final.
- PIN tidak boleh disimpan plaintext.

### BMC Submission
- Hanya dapat upload jika `bmc_submission_open = true`.
- Hanya satu submission aktif per tim.
- Sub-theme harus aktif.
- File harus memenuhi validasi format/size (server-side).
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

## 12. State Machines

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

## 13. Dashboard Metrics (Server Aggregation)

Admin dashboard minimal:
- Total Tim.
- Total BMC submitted.
- Total Pitching submitted.
- Total BMC passed.
- Total evaluation pending.
- Total final teams.

Jangan menjalankan query berat untuk setiap stat jika count dapat digabung menjadi query agregasi.

---

## 14. Performance Requirements (Backend Scope)

- Dashboard menggunakan aggregate query (bukan N+1).
- File tidak melewati database (langsung ke object storage).
- Preview PDF langsung dari object storage melalui signed URL.

### Database Index Minimum
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

## 15. Security Requirements

- Password Juri/Admin di-hash menggunakan Argon2 atau bcrypt.
- PIN peserta di-hash.
- Session menggunakan secure HTTP-only cookie.
- Role authorization dilakukan di server.
- Ownership/assignment check dilakukan di server.
- Tidak pernah mempercayai `teamId`, `judgeId`, atau `assignmentId` dari client tanpa validasi.
- File bucket private.
- Signed URL memiliki TTL pendek.
- Validasi file server-side (MIME + extension, bukan hanya client).
- Sanitize text yang ditampilkan bila ada rich text.
- Rate limit endpoint participant access dan login.
- CSRF protection mengikuti framework/session mechanism.
- Jangan mengirim password hash, PIN hash, internal storage path sensitif, atau data juri yang tidak diperlukan ke client.

---

## 16. Error Handling

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

## 17. Server-Side Validation Contract

Validasi berikut wajib ditegakkan ulang di server (tidak boleh hanya mengandalkan client):

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

## 18. Evaluation Calculation Contract

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

**Tidak boleh ada duplicate calculation logic di React/frontend.**

---

## 19. Recommended Server Structure

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

Route Handler digunakan untuk resource API. Server Actions digunakan untuk mutation internal yang cocok.

---

## 20. Backend Testing Strategy

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

## 21. Deployment Architecture

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

## 22. Backend Development Milestones

### Phase 1 — Foundation
- Next.js setup.
- TypeScript.
- Prisma.
- PostgreSQL.
- Auth.js.

### Phase 2 — Admin Core (API)
- Settings API.
- Subthemes API.
- Teams API + PIN generation/export.
- Judges API.
- Assignments API.

### Phase 3 — Participant API
- Team access (PIN validation).
- BMC submission API.
- Submission status API.
- BMC result API.
- Pitching submission API.
- Final result API.

### Phase 4 — Dynamic Evaluation Engine
- Templates API.
- Criteria API.
- Points API.
- Weights validation.
- Assignment criteria API.
- Scoring engine (`lib/scoring`).

### Phase 5 — Judge Workspace (API)
- Dashboard/assignment API.
- Submission signed URL API.
- Evaluation save/edit API.
- Lock handling logic.

### Phase 6 — Result Management (API)
- BMC pass/fail logic.
- Pitching summary API.
- Ranking calculation.
- Champion selection API.

### Phase 7 — Polish
- Security hardening.
- Error handling consistency.
- Backend testing.

---

## 23. Backend Definition of Done

Feature dinyatakan selesai jika:
- Role authorization bekerja di server.
- Validation bekerja di server (tidak hanya bergantung pada client).
- Semua state transition mengikuti business rules.
- Tidak ada score calculation di luar module `lib/scoring` sebagai source of truth.
- File private dan hanya dapat diakses sesuai authorization.
- Tidak ada API khusus yang dibuat hanya karena ada halaman baru jika resource sudah tersedia.
- Test utama (functional, authorization, file, scoring) lulus.

---

## 24. Final Backend Architecture Decision

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

## 25. Frontend–Backend Contract Notes

- Backend adalah satu-satunya source of truth untuk: authorization, validasi final, state transition, dan perhitungan nilai.
- Semua response API harus membatasi field sesuai role (lihat API Authorization Matrix) — jangan mengandalkan frontend untuk menyembunyikan data sensitif.
- Perubahan skema evaluasi (kriteria/point/bobot) cukup dilakukan lewat data (melalui Admin API), tanpa mengubah kontrak API yang dikonsumsi frontend.
