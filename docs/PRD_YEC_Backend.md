# PRD — YEC Competition Platform — BACKEND (v2.0)

**Document:** Product Requirements Document — Backend
**Version:** 2.0 (Disempurnakan sesuai Frontend Flow)
**Status:** Ready for Implementation
**Stack:** Next.js Route Handlers + Supabase (PostgreSQL, Auth, Storage) + Next.js Route Handlers

---

## 1. Overview

Backend YEC mengelola seluruh proses lomba dari konfigurasi, koleksi karya, penugasan juri, penilaian, hingga pengumuman juara. Tiga aktor:

| Aktor | Autentikasi | Akses |
|---|---|---|
| **Admin** | Username + password (Supabase Auth JWT) | Full control |
| **Juri** | Username + password (Supabase Auth JWT) | Hanya assignment miliknya |
| **Peserta** | Nama Tim + PIN (cookie sendiri) | Hanya data tim sendiri |

> Admin dan Juri berbagi satu halaman login (`/login`). Redirect otomatis ke dashboard masing-masing berdasarkan role JWT.

---

## 2. Prinsip Desain

1. **Server-authoritative** — Authorization, state transition, kalkulasi nilai, dan lock semua dikontrol server.
2. **Resource-based API** — API dikelompokkan berdasarkan resource/domain. Tidak dibuat endpoint baru hanya karena ada halaman baru.
3. **Role-filtered response** — Response API otomatis membatasi field sesuai role. Frontend tidak boleh jadi filter terakhir.
4. **File di luar database** — PDF/PPT disimpan di object storage; database hanya menyimpan metadata.
5. **Kalkulasi di server** — Tidak ada perhitungan nilai di React sebagai source of truth.

---

## 3. Database Schema

### users
```
id              UUID PK
name            VARCHAR(120)
username        VARCHAR(80) UNIQUE
password_hash   TEXT
role            ENUM(ADMIN, JUDGE)
active          BOOLEAN DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### teams
```
id              UUID PK
name            VARCHAR(150) UNIQUE
pin_hash        TEXT         -- bcrypt/argon2, tidak pernah disimpan plaintext
subtheme_id     UUID FK → subthemes.id NULL
active          BOOLEAN DEFAULT true
created_at      TIMESTAMP
updated_at      TIMESTAMP
```

### competition_settings _(satu row)_
```
id                        UUID PK
competition_name          VARCHAR(200)
bmc_submission_open       BOOLEAN DEFAULT false
bmc_evaluation_open       BOOLEAN DEFAULT false
pitching_submission_open  BOOLEAN DEFAULT false
pitching_evaluation_open  BOOLEAN DEFAULT false
announcement_title        VARCHAR(200) NULL
announcement_content      TEXT NULL
participant_support_phone VARCHAR(30) NULL
updated_at                TIMESTAMP
```

### subthemes
```
id          UUID PK
name        VARCHAR(160)
active      BOOLEAN DEFAULT true
sort_order  INT DEFAULT 0
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### evaluation_templates
```
id          UUID PK
name        VARCHAR(160)
stage       ENUM(BMC, PITCHING)
description TEXT NULL
active      BOOLEAN DEFAULT false   -- maks 1 aktif per stage
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### criteria
```
id          UUID PK
template_id UUID FK → evaluation_templates.id (CASCADE DELETE)
name        VARCHAR(160)
weight      DECIMAL(5,2)  -- 0–100; total semua criteria dalam 1 template harus = 100
sort_order  INT
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

### criterion_points
```
id            UUID PK
criterion_id  UUID FK → criteria.id (CASCADE DELETE)
name          VARCHAR(200)
sort_order    INT
created_at    TIMESTAMP
updated_at    TIMESTAMP
```

### submissions
```
id                UUID PK
team_id           UUID FK → teams.id
stage             ENUM(BMC, PITCHING)
subtheme_id       UUID FK → subthemes.id NULL
original_filename VARCHAR(255)
storage_path      TEXT
mime_type         VARCHAR(100)
file_size         BIGINT
submitted_at      TIMESTAMP
updated_at        TIMESTAMP

UNIQUE (team_id, stage)   -- satu submission aktif per stage per tim
```

### assignments
```
id               UUID PK
judge_id         UUID FK → users.id
team_id          UUID FK → teams.id
stage            ENUM(BMC, PITCHING)
assignment_scope ENUM(ALL, CRITERIA)   -- ALL = nilai semua kriteria
created_at       TIMESTAMP
updated_at       TIMESTAMP
```

### assignment_criteria _(untuk scope=CRITERIA)_
```
assignment_id  UUID FK → assignments.id (CASCADE DELETE)
criterion_id   UUID FK → criteria.id
PRIMARY KEY (assignment_id, criterion_id)
```

### evaluations
```
id             UUID PK
assignment_id  UUID FK → assignments.id
submission_id  UUID FK → submissions.id
status         ENUM(PENDING, COMPLETED) DEFAULT PENDING
notes          TEXT NULL
submitted_at   TIMESTAMP NULL
updated_at     TIMESTAMP

UNIQUE (assignment_id, submission_id)
```

### evaluation_scores
```
id                 UUID PK
evaluation_id      UUID FK → evaluations.id (CASCADE DELETE)
criterion_point_id UUID FK → criterion_points.id
score              DECIMAL(5,2)   -- 0–100
updated_at         TIMESTAMP

UNIQUE (evaluation_id, criterion_point_id)
```

### team_stage_results
```
id            UUID PK
team_id       UUID FK → teams.id
stage         ENUM(BMC, PITCHING)
final_score   DECIMAL(6,2) NULL   -- dihitung server
result_status ENUM(PENDING, PASSED, FAILED) DEFAULT PENDING
locked_at     TIMESTAMP NULL       -- setelah lock, evaluation tidak bisa diubah
created_at    TIMESTAMP
updated_at    TIMESTAMP

UNIQUE (team_id, stage)
```

### final_results
```
id          UUID PK
team_id     UUID FK → teams.id UNIQUE
rank        INT   -- hanya 1, 2, atau 3; maks satu tim per rank
final_score DECIMAL(6,2) NULL
created_at  TIMESTAMP
updated_at  TIMESTAMP
```

---

## 4. API Routes

Semua endpoint mengikuti pola resource/domain. Response dibatasi berdasarkan role session.

### 4.1 Auth (dikelola Supabase Auth)
```
POST  /api/auth/[...nextauth]   -- login, session, callback (Supabase Auth handler)
```
Halaman login: `/login` — satu form untuk Admin dan Juri.
Setelah login, middleware redirect berdasarkan `session.user.role`:
- `ADMIN` → `/admin/dashboard`
- `JUDGE` → `/juri/dashboard`

### 4.2 Participant Access _(session terpisah, bukan Supabase Auth)_
```
POST  /api/participant/access   -- validasi Nama Tim + PIN → set cookie yec_participant_session
POST  /api/participant/logout   -- clear cookie
GET   /api/participant/portal   -- state tim: stage, status, hasil (hanya tim sendiri)
```

Request `/api/participant/access`:
```json
{ "teamId": "uuid", "pin": "583921" }
```
Response `/api/participant/portal`:
```json
{
  "teamName": "Tim Alpha",
  "teamId": "uuid",
  "stage": "BMC_READY | BMC_WAITING_RESULT | PASSED | PITCHING_READY | PITCHING_WAITING_RESULT | FAILED | CHAMPION",
  "bmc_submission_open": true,
  "pitching_submission_open": false,
  "score": null,
  "rank": null,
  "announcement": { "title": "...", "content": "..." }
}
```

### 4.3 Settings
```
GET  /api/settings   -- public (field terbatas): competition_name, announcement, support_phone
PUT  /api/settings   -- Admin only: semua field
```

### 4.4 Subthemes
```
GET    /api/subthemes          -- public (hanya active=true)
POST   /api/subthemes          -- Admin only
PUT    /api/subthemes/:id      -- Admin only
DELETE /api/subthemes/:id      -- Admin only
```

### 4.5 Teams
```
GET    /api/teams              -- Admin: semua data; Participant: hanya id + name (untuk dropdown)
POST   /api/teams              -- Admin only; server generate PIN
DELETE /api/teams/:id          -- Admin only; cascade delete submission + storage
GET    /api/teams/export-pin   -- Admin only; CSV id,name,pin_plaintext (satu kali saja)
```

### 4.6 Judges
```
GET    /api/judges          -- Admin only
POST   /api/judges          -- Admin only
PUT    /api/judges/:id      -- Admin only
DELETE /api/judges/:id      -- Admin only
```

### 4.7 Assignments
```
GET    /api/assignments          -- Admin: semua; Judge: hanya miliknya (dari token)
POST   /api/assignments          -- Admin only
DELETE /api/assignments/:id      -- Admin only
```
Saat GET oleh Juri, server filter `WHERE judge_id = session.user.id`.

### 4.8 Evaluation Templates
```
GET    /api/evaluation-templates          -- Admin & Judge (read only)
POST   /api/evaluation-templates          -- Admin only
GET    /api/evaluation-templates/:id      -- Admin & Judge; include criteria + points
PUT    /api/evaluation-templates/:id      -- Admin only
DELETE /api/evaluation-templates/:id      -- Admin only (hanya status DRAFT)
POST   /api/evaluation-templates/:id/activate  -- Admin only; validate total weight = 100
```

### 4.9 Submissions
```
POST  /api/submissions          -- Participant (via cookie session); server validates stage + team state
GET   /api/submissions/:id/view -- Judge (assigned only); returns short-lived signed URL untuk PDF Viewer
```
Server validasi sebelum menerima upload:
- `bmc_submission_open = true` untuk BMC
- `pitching_submission_open = true` untuk Pitching
- Tim harus PASSED BMC untuk bisa Pitching
- File: PDF only (BMC), PDF/PPT/PPTX (Pitching), max 10MB

### 4.10 Evaluations
```
GET  /api/evaluations            -- Judge: daftar assignment + status (dashboard juri)
GET  /api/evaluations/:id        -- Judge (assigned only): detail form penilaian + template
PUT  /api/evaluations/:id        -- Judge (assigned only): simpan skor; jika isSubmit=true → status COMPLETED
```

Request `PUT /api/evaluations/:id`:
```json
{
  "scores": { "point_id_1": 85, "point_id_2": 90 },
  "notes": "Catatan opsional",
  "isSubmit": false
}
```
Server validasi:
- Evaluation belum LOCKED
- Judge adalah pemilik assignment
- Score 0–100 per point

### 4.11 Results (Admin view)
```
GET  /api/results           -- Admin only; query param: ?stage=BMC|PITCHING
PUT  /api/results/:id       -- Admin only; set result_status: PASSED | FAILED
                            -- hanya jika semua assignment COMPLETED
                            -- setelah berhasil: lock evaluation, hitung final_score
```

### 4.12 Dashboard
```
GET  /api/dashboard/summary  -- Admin only; aggregate count stats
```
Response:
```json
{
  "totalTeams": 20,
  "bmcSubmitted": 18,
  "bmcPassed": 10,
  "pitchingSubmitted": 9,
  "evaluationPending": 3,
  "finalTeams": 9
}
```

---

## 5. Authorization Matrix

| Endpoint | Admin | Juri | Peserta |
|---|---|---|---|
| `GET /api/settings` | Full | — | Field terbatas |
| `PUT /api/settings` | ✅ | ❌ | ❌ |
| `GET /api/teams` | Full data | ❌ | id+name saja |
| `POST/DELETE /api/teams` | ✅ | ❌ | ❌ |
| `GET /api/judges` | ✅ | ❌ | ❌ |
| `POST/PUT/DELETE /api/judges` | ✅ | ❌ | ❌ |
| `GET /api/assignments` | Semua | Miliknya saja | ❌ |
| `POST/DELETE /api/assignments` | ✅ | ❌ | ❌ |
| `GET /api/evaluation-templates` | ✅ | Read only | ❌ |
| `POST /api/submissions` | ❌ | ❌ | Tim sendiri |
| `GET /api/submissions/:id/view` | ✅ | Assigned only | ❌ |
| `GET /api/evaluations` | ✅ | Miliknya saja | ❌ |
| `GET/PUT /api/evaluations/:id` | ✅ | Assigned only | ❌ |
| `GET /api/results` | ✅ | ❌ | ❌ |
| `PUT /api/results/:id` | ✅ | ❌ | ❌ |
| `GET /api/participant/portal` | ❌ | ❌ | Tim sendiri |
| `GET /api/dashboard/summary` | ✅ | ❌ | ❌ |

---

## 6. Competition Lifecycle & State Machine

### Peserta (State di server berdasarkan data DB)
```
LOGIN_REQUIRED
  ↓ (POST /api/participant/access berhasil)
BMC_READY          → bmc_submission_open = true
  ↓ (POST /api/submissions)
BMC_WAITING_RESULT → submission ada, result PENDING
  ↓ (Admin PUT /api/results/:id)
  ├── PASSED        → pitching_submission_open = true
  └── FAILED        → End

PITCHING_READY
  ↓ (POST /api/submissions stage=PITCHING)
PITCHING_WAITING_RESULT
  ↓ (Admin tetapkan juara)
CHAMPION / FINALIST / END
```

### Evaluation (Juri)
```
PENDING     → juri belum mulai
COMPLETED   → juri submit (isSubmit: true)
LOCKED      → Admin lock setelah set PASSED/FAILED
```

---

## 7. Kalkulasi Nilai (Server Only)

Di `lib/scoring/`:

```ts
// Per criteria dari satu juri:
criteria_score = average(scores of all points in criteria)
criteria_contribution = criteria_score × (weight / 100)

// Final per juri:
judge_score = Σ criteria_contribution

// Final tim (multi-juri):
// Jika dua juri menilai criteria sama → rata-rata contribution
final_score = weighted_average(all judge contributions)
```

**Tidak ada kalkulasi ini di React.** Frontend hanya menampilkan angka dari server.

---

## 8. File Storage

### Struktur
```
private-bucket/
  submissions/
    {teamId}/
      bmc/    {uuid}.pdf
      pitching/ {uuid}.pdf|pptx
```

### Upload Flow
```
Peserta pilih file → POST /api/submissions →
Server validasi (role, stage, size, MIME) →
Upload ke storage →
Simpan metadata ke DB →
Response sukses ke client
```

### Judge Preview Flow
```
Judge buka workspace → GET /api/submissions/:id/view →
Server cek assignment milik judge →
Generate signed URL (TTL 15 menit) →
Frontend load PDF di iframe/viewer
```

---

## 9. Validasi Server

| Field | Rule |
|---|---|
| `team.name` | required, unique |
| `judge.username` | required, unique |
| `judge.password` | required saat create |
| `criteria.weight` | 0–100; total template = 100 sebelum activate |
| `score` | 0–100 per point |
| Upload file | MIME + extension + size (server-side, bukan hanya client) |
| Assignment PIN | bcrypt.compare, tidak pernah kirim hash ke client |

---

## 10. Error Response Format

```json
{
  "success": false,
  "error": "EVALUATION_LOCKED"
}
```

```json
{
  "success": true,
  "data": { ... },
  "message": "Berhasil disimpan."
}
```

Kode error standar:
```
UNAUTHORIZED       FORBIDDEN          NOT_FOUND
VALIDATION_ERROR   STAGE_CLOSED       INVALID_PIN
DUPLICATE_SUBMISSION  EVALUATION_LOCKED  INCOMPLETE_EVALUATION
INVALID_FILE       STORAGE_ERROR      CONFLICT
```

---

## 11. Middleware & Route Protection

File `middleware.ts`:
```
/admin/*    → session required, role = ADMIN
/juri/*     → session required, role = JUDGE | ADMIN
/login      → jika sudah login, redirect ke dashboard sesuai role
/portal/*   → cek cookie yec_participant_session
```

---

## 12. Environment Variables

```env
NEXT_PUBLIC_SUPABASE_URL
SUPABASE_SERVICE_ROLE_KEY
STORAGE_ENDPOINT
STORAGE_BUCKET
STORAGE_ACCESS_KEY
STORAGE_SECRET_KEY
```

---

## 13. Development Phases

| Phase | Scope |
|---|---|
| **1 — Foundation** | Supabase SQL Schema, migrations, Supabase Auth setup, middleware |
| **2 — Admin Core** | Settings, Subthemes, Teams (+ PIN gen), Judges, Assignments |
| **3 — Templates** | Evaluation templates, Criteria, Points, activate validation |
| **4 — Participant** | Access/PIN, Portal state, BMC + Pitching submission |
| **5 — Evaluations** | Juri dashboard, workspace data, save/submit scores, locking |
| **6 — Results** | BMC pass/fail + lock, scoring engine, Pitching result + champion |
| **7 — Polish** | Security hardening, error handling, index, signed URL, testing |

---

## 14. Definition of Done

Feature dinyatakan selesai jika:
- [ ] Role authorization bekerja di **server** (tidak hanya di UI)
- [ ] Validasi business rule ditegakkan di server
- [ ] State transition mengikuti lifecycle di section 6
- [ ] Kalkulasi nilai hanya ada di `lib/scoring/`
- [ ] File private, akses melalui signed URL dengan TTL
- [ ] Tidak ada endpoint baru yang dibuat hanya karena ada halaman baru
- [ ] Response tidak mengandung data sensitif (pin_hash, password_hash, path storage internal)
