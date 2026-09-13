# YEC SECOND SYSTEM AUDIT

## 1. Executive Summary

Audit kedua (Second Full Audit) pada YEC Competition Platform dilakukan secara menyeluruh terhadap seluruh *source code* aktual, skema Supabase database PostgreSQL, serta alur bisnis sesuai PRD.

Pengujian manual dan analisis mendalam menemukan beberapa **masalah kritis** dan **bug tersembunyi** yang menyebabkan sistem gagal berjalan *end-to-end* secara aman dan presisi. Seluruh *root cause* telah diidentifikasi dan disiapkan langkah perbaikan (*safe fix*) tanpa merusak struktur visual maupun fitur yang ada.

---

## 2. All Known Issues

Berikut rekapitulasi 9 isu utama serta isu tambahan hasil audit penuh:

1. **Issue 1 — Subtheme Delete**: Endpoint `DELETE /api/subthemes/[id]` menggunakan `createClient()` (RLS) alih-alih `createAdminClient()`, serta format JSON response tidak sesuai standar envelope API.
2. **Issue 2 — Stage Synchronization**: Sakelar *stage* di Admin Settings belum ditegakkan (*enforced*) secara ketat di server untuk pengumpulan karya Pitching dan penyuntingan evaluasi juri.
3. **Issue 3 — Pitching Admin 500**: Root cause disebabkan oleh pembacaan properti `created_at` yang tidak ada pada tabel `submissions` (seharusnya `submitted_at`), serta pengaksesan method `.toFixed(1)` pada `averageScore` yang bernilai `null`.
4. **Issue 4 — BMC Dummy Stats**: Halaman Admin BMC memuat angka *metric cards* statis ("4 Karya", "3 Tim", "1 Tim") secara hardcoded di JSX, dan API `summary` mengalami kesalahan query nama kolom.
5. **Issue 5 — Judge Assignment Filtering**: Admin Management Juri menampilkan seluruh tim tanpa memfilter kelayakan *stage* (seperti status `PASSED` dari BMC untuk tahap Pitching), serta server tidak memvalidasi pembuatan assignment Pitching bagi tim yang belum lolos.
6. **Issue 6 — Admin PDF Preview**: Admin tidak memiliki UI button/modal untuk melakukan pratinjau PDF BMC/Pitching melalui *signed URL*, dan API `/api/results` tidak mengembalikan `submissionId` atau `signedUrl`.
7. **Issue 7 — Judge Evaluation Not Found**: Di Next.js 15 App Router, properti `params` pada `src/app/juri/evaluation/[assignmentId]/page.tsx` bersifat `Promise` dan tidak di-`await`, menyebabkan `assignmentId` bernilai `undefined`. Selain itu, `GET /api/evaluations/[id]` menggunakan `.single()` pada pencarian template sehingga melempar error 500 jika template belum aktif.
8. **Issue 8 — Pitching Judge Flow**: Alur juri Pitching belum terintegrasi utuh karena tidak tersambungnya filter kualifikasi tim `PASSED` BMC dan fallback template Pitching.
9. **Issue 9 — Landing Subtheme UUID**: Komponen `HighlightGrid.tsx` merender `{item.id}` (UUID database) sebagai label nomor urut visual di Landing Page karena mismatch struktur respons API `/api/subthemes`.

---

## 3. Issue 1 — Subtheme Delete

* **Root Cause**: 
  - `src/app/api/subthemes/[id]/route.ts` menggunakan client standar `createClient()`. Tabel `subthemes` memiliki RLS aktif tanpa policy `DELETE` publik, sehingga query `DELETE` gagal atau terblokir.
  - Formatan response HTTP `DELETE` & `PUT` belum dibungkus envelope standar `{ success: true, data/message }` dan envelope error `{ success: false, error: { code, message } }`.
* **Database & FK Constraint**:
  - FK pada `teams.subtheme_id` dan `submissions.subtheme_id` diset `ON DELETE SET NULL`, sehingga penghapusan baris di `subthemes` secara aman mengubah acuan tim/submission menjadi `NULL`.
* **Perbaikan**:
  - Gunakan `createAdminClient()` pada `DELETE /api/subthemes/[id]`.
  - Bungkus response dengan API Envelope standar.

---

## 4. Issue 2 — Stage Synchronization

* **Root Cause**:
  - Sakelar `bmc_submission_open`, `bmc_evaluation_open`, `pitching_submission_open`, `pitching_evaluation_open` di `competition_settings` sudah disimpan ke DB, namun endpoint juri `PUT /api/evaluations/[id]` belum memverifikasi status sakelar evaluasi di server.
  - Endpoint `POST /api/submissions` untuk stage Pitching belum memeriksa status `pitching_submission_open` dan kualifikasi kelulusan BMC tim.
* **Perbaikan**:
  - Tambahkan validasi server-side pada `POST /api/submissions` dan `PUT /api/evaluations/[id]` yang membaca `competition_settings` secara real-time dari database.

---

## 5. Issue 3 — Pitching Admin 500

* **Root Cause**:
  - `src/app/api/results/route.ts` memanggil `teamSub.created_at`. Kolom aktual pada tabel `submissions` di PostgreSQL adalah `submitted_at`.
  - Pada halaman `src/app/admin/evaluations/pitching/page.tsx`, eksekusi `{t.averageScore.toFixed(1)}` melempar `TypeError` runtime karena `averageScore` bernilai `null` saat belum ada nilai juri.
* **Perbaikan**:
  - Ganti `created_at` menjadi `submitted_at` di API `/api/results`.
  - Tambahkan defensive check `(t.averageScore ?? 0).toFixed(1)` atau penanganan `null` pada UI.

---

## 6. Issue 4 — BMC Dummy Stats

* **Root Cause**:
  - `src/app/admin/evaluations/bmc/page.tsx` merender teks statis di JSX ("4 Karya", "3 Tim", "1 Tim").
  - API `GET /api/dashboard/summary` mengalami runtime error saat mengambil `recentSubmissions` karena mencoba menyeleksi kolom `created_at` (seharusnya `submitted_at`).
* **Perbaikan**:
  - Perbaiki query `submitted_at` pada `summary/route.ts`.
  - Hitung statistik secara dinamis dari `evalList` di `src/app/admin/evaluations/bmc/page.tsx`.

---

## 7. Issue 5 — Judge Assignment Filtering

* **Root Cause**:
  - `src/app/admin/judges/page.tsx` memetakan seluruh tim dari endpoint `/api/teams` ke tab BMC dan Pitching tanpa memeriksa status submisi maupun status `PASSED` dari babak BMC.
  - Endpoint `POST /api/assignments` tidak menolak (*reject*) pembuatan assignment Pitching untuk tim yang belum berstatus `PASSED` di `team_stage_results`.
* **Perbaikan**:
  - Filter `bmcTeams` agar hanya menampilkan tim yang memiliki submisi BMC.
  - Filter `pitchingTeams` agar hanya menampilkan tim yang berstatus `PASSED` pada `team_stage_results` (stage `BMC`).
  - Tambahkan validasi server-side di `POST /api/assignments`.

---

## 8. Issue 6 — Admin PDF Preview

* **Root Cause**:
  - Halaman Admin Penilaian BMC & Pitching tidak memiliki tombol pratinjau PDF.
  - Endpoint `GET /api/results` tidak menyertakan `submissionId` atau `signedUrl` karya.
* **Perbaikan**:
  - Sertakan `submissionId` pada skema response `GET /api/results`.
  - Tambahkan modal viewer PDF dan tombol pratinjau yang memanfaatkan endpoint terproteksi `GET /api/submissions/[id]/view`.

---

## 9. Issue 7 — Judge Evaluation Not Found

* **Root Cause**:
  - `src/app/juri/evaluation/[assignmentId]/page.tsx` menerima `params` bertipe `Promise<{ assignmentId: string }>` di Next.js 15, tetapi tidak di-`await` sebelum dikirim ke `EvaluationWorkspace`. Hal ini menyebabkan `assignmentId` menjadi `undefined`.
  - `GET /api/evaluations/[id]/route.ts` memanggil `.single()` saat mencari template aktif. Jika template aktif belum dibuat di DB, query melempar exception 500 alih-alih me-return template kosong secara aman.
* **Perbaikan**:
  - Await `params` di `[assignmentId]/page.tsx`.
  - Gunakan `.maybeSingle()` untuk pencarian template di `GET /api/evaluations/[id]`.

---

## 10. Issue 8 — Pitching Judge Flow

* **Root Cause**:
  - Alur penilaian Pitching juri terkendala oleh penanganan kesalahan pada template Pitching yang belum aktif dan sinkronisasi status tim *finalist*.
* **Perbaikan**:
  - Pastikan engine evaluasi serbaguna (*reusable evaluation engine*) menangani stage `PITCHING` dengan tepat, termasuk verifikasi file submission Pitching dan penguncian (*locking*) nilai final.

---

## 11. Issue 9 — Landing Subtheme UUID

* **Root Cause**:
  - `src/components/landing/HighlightGrid.tsx` merender `{item.id}` yang berisi string UUID (misal: `"cb124b64-138e-473a-b2b0-801a3c9a401c"`) sebagai nomor urut visual card landing page.
  - Properti `name` dari API `/api/subthemes` tidak dipetakan ke `title` pada `HighlightGrid`.
* **Perbaikan**:
  - Map response `/api/subthemes` di `HighlightGrid.tsx` sehingga `id` visual diganti dengan nomor urut (`01`, `02`, dst.) dan `name` dipetakan ke `title`.

---

## 12. Additional Bugs Discovered

1. **Envelope Contract Mismatch**: Endpoint `PUT /api/subthemes/[id]`, `GET /api/assignments`, `POST /api/assignments`, `GET /api/evaluation-templates`, dan `POST /api/evaluation-templates` tidak menggunakan format envelope standar `{ success, data, message }` / `{ success: false, error: { code, message } }`.
2. **Participant Submission Subtheme Sync**: Dropdown pilihan subtema di `SubmissionCard.tsx` memiliki opsi hardcoded (`tech`, `creative`, dll.) yang tidak sesuai dengan ID UUID di database.
3. **Server Validation on Results Decision**: Endpoint `PUT /api/results/[id]` belum memverifikasi secara ketat bahwa seluruh juri yang di-assign telah menyelesaikan penilaian (`COMPLETED`) sebelum mengizinkan keputusan `PASSED`/`FAILED`.

---

## 13. Fix Plan

* **Phase 1**: Perbaiki API Envelope & Access Control (`subthemes`, `assignments`, `evaluation-templates`, `teams`).
* **Phase 2**: Perbaiki Next.js 15 `params` await di `[assignmentId]/page.tsx` & penanganan `.maybeSingle()` di `evaluations/[id]/route.ts`.
* **Phase 3**: Perbaiki query kolom `submitted_at` pada `results` & `dashboard/summary`.
* **Phase 4**: Perbaiki penanganan `averageScore` `null` & visual `HighlightGrid` di landing page.
* **Phase 5**: Integrasikan kualifikasi `PASSED` BMC untuk Pitching Assignment & enforce server validation.
* **Phase 6**: Tambahkan tombol & modal preview PDF pada Admin BMC & Pitching.

---

## 14. Verification Plan

* **Lint Check**: Jalankan `npm run lint` untuk memastikan tidak ada kesalahan TypeScript/ESLint.
* **Build Check**: Jalankan `npm run build` untuk memverifikasi kompilasi Next.js.
* **Functional Verification**: Pengujian cross-role (Admin settings -> Participant portal & Judge workspace).
