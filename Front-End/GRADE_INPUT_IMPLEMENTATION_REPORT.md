# EduTrack Grade Input Implementation Report

Tanggal verifikasi: 5 Agustus 2026

## 1. Halaman dan komponen yang dibuat

Halaman baru tersedia di route terlindungi `/teacher/grades` dan menggunakan shell dashboard EduTrack yang sudah ada. Menu **Input Nilai** aktif dengan ikon `FilePenLine`.

Implementasi dipecah ke dalam komponen berikut:

- `TeacherGradesPage`
- `GradePageHeader`
- `GradeFilters`
- `GradeEmptyState`
- `GradeTable`, `GradeTableHeader`, `GradeStudentCell`, `GradeInputCell`, dan `FinalGradeCell`
- `GradeActionBar` dan `GradeSaveStatus`
- `LearningTopicModal`, `UnsavedChangesModal`, dan `ConfirmDialog`
- `HomeroomInformation`

Halaman mendukung initial, loading, loaded/view, edit, dirty, autosaving, draft saved, official saving, success, validation error, incomplete, fetch error, no students, one-student, dan locked state.

## 2. Struktur data nilai

Data nilai dipisahkan menjadi:

- data siswa dan nilai demo di `src/data/gradeData.js`;
- definisi komponen serta bobot penilaian di `src/data/assessmentComponents.js`;
- akses data asinkron di `src/services/gradeService.js`;
- operasi record localStorage di `src/stores/gradeStore.js`;
- serialisasi dan key storage di `src/utils/gradeStorage.js`.

Komponen penilaian adalah T1 10%, T2 10%, UH1 15%, UH2 15%, UTS 20%, dan UAS 30%. Total bobot divalidasi harus tepat 100%. Data karakter/sikap dinonaktifkan melalui `ENABLE_CHARACTER_ASSESSMENT = false`.

## 3. Rumus nilai akhir

`calculateFinalGrade(scores, components)` menghitung jumlah `nilai × bobot/100` dan membulatkan hasil menjadi satu angka desimal. Nilai akhir demo terverifikasi sebagai 83.7, 89.5, dan 73.7. Jika satu komponen wajib kosong atau invalid, fungsi mengembalikan `null` dan UI menampilkan **Belum Lengkap**.

## 4. Validasi input

- Input menggunakan `type="number"`, `min=0`, `max=100`, `step=1`, dan `inputMode="numeric"`.
- Nilai kosong disimpan sebagai `null`, bukan nol.
- Nilai di luar 0–100 menampilkan pesan **Nilai harus berada pada rentang 0–100.** dan menghentikan penyimpanan resmi.
- Penyimpanan data yang belum lengkap hanya diteruskan setelah konfirmasi pengguna dan tetap berstatus draft.
- KKM 75 digunakan sebagai indikator: **Tuntas**, **Di bawah KKM**, atau **Belum Lengkap**; indikator tidak hanya mengandalkan warna.

## 5. Mekanisme autosave draft

Setiap perubahan draft memulai debounce 800 ms. Status berubah dari **Menyimpan draft...** menjadi **Draft tersimpan otomatis**, lalu data ditulis ke `edutrack_grade_drafts`. Draft ini tidak mengubah record nilai resmi dan dapat dipulihkan saat guru kembali ke mode edit.

## 6. Mekanisme Simpan Perubahan

Tombol **Simpan Perubahan** melakukan validasi sheet, meminta konfirmasi jika data belum lengkap, menonaktifkan kontrol selama simulasi API 800 ms, menyimpan record ke `edutrack_grade_records`, menghapus draft lokal, lalu kembali ke mode lihat. Toast **Perubahan nilai berhasil disimpan.** dan status hijau **Nilai Tersimpan** ditampilkan setelah berhasil.

Tombol **Batal** mengembalikan `draftGrades` ke `savedGrades`. Jika ada perubahan, dialog konfirmasi tampil terlebih dahulu. `beforeunload` dan blocker React Router melindungi perubahan saat refresh, back, penutupan browser, atau navigasi sidebar.

## 7. Modal Input Materi

Modal memuat T1, T2, UH1, UH2, UTS, dan UAS dengan batas 100 karakter. Penyimpanan disimulasikan melalui service dan ditulis ke `edutrack_learning_topics`. Modal mendukung Escape, tombol X, overlay dengan konfirmasi saat dirty, scroll lock, focus trap, fokus awal pada input pertama, dan pengembalian fokus ke tombol **Input Materi**. Persistensi topik telah diuji setelah reload.

## 8. Aturan akses Guru Mapel

Route dibatasi untuk role `teacher`. Filter dibentuk hanya dari `teacherUser.assignedClasses`. Service selalu mencocokkan `classId`, `subjectId`, tahun ajaran, dan semester sebelum membaca atau menulis data; kombinasi yang bukan penugasan guru menghasilkan `UNAUTHORIZED_ASSIGNMENT`. Informasi wali kelas hanya dirender jika `isHomeroomTeacher` bernilai `true` dan tidak memberi hak mengubah nilai guru lain.

## 9. Status nilai

Status internal yang tersedia adalah `DRAFT`, `PUBLISHED`, `FINALIZED_SUBJECT`, dan `REOPENED`. Penyimpanan halaman ini menghasilkan `DRAFT`. Jika record berstatus `FINALIZED_SUBJECT`, kontrol edit disembunyikan dan UI menampilkan badge **Rapor Mapel Telah Difinalisasi** beserta informasi bahwa koreksi memerlukan proses buka kembali.

## 10. Hasil responsive testing

Pengujian browser dilakukan pada 1440×1024, 1280×800, 1024×768, 768×1024, 430×932, 390×844, dan 360×800.

- Desktop: filter horizontal, tabel lebar, dan action footer kanan.
- Tablet: filter membungkus dan tabel tetap dapat digulir horizontal.
- Mobile: header serta filter menjadi satu kolom, tombol header penuh, sidebar menggunakan drawer, tabel memiliki scroll internal, nama siswa sticky, dan footer action sticky.
- Tidak ditemukan hilangnya judul, tabel, maupun kontrol aksi pada tujuh ukuran tersebut.

Screenshot QA tersedia di `docs/screenshots/grade-input-*.png`.

## 11. Hasil accessibility testing

- Semua input nilai dan topik memiliki accessible name.
- Error input menggunakan `aria-invalid` dan `aria-describedby`.
- Dialog menggunakan `role="dialog"`, `aria-modal="true"`, judul/deskripsi terhubung, focus trap, Escape, dan focus return.
- Sorting memiliki tombol keyboard-accessible dan `aria-sort`.
- Toast/status menggunakan live region; error memakai `role="alert"`.
- Status KKM memakai teks, bukan warna saja, dan focus ring terlihat pada kontrol interaktif.

Pengujian DOM accessibility melalui browser mengonfirmasi label seperti **Nilai Tugas 1 Aditya Ananta**, dialog konfirmasi, status autosave, serta urutan nama A–Z/Z–A terdeteksi dengan benar.

## 12. Perbedaan implementasi dengan gambar referensi

- Periode diseragamkan menjadi Semester Ganjil 2026/2027.
- Label U1/U2 pada referensi diganti menjadi UH1/UH2 agar konsisten.
- Kolom sikap tidak dimasukkan ke tabel MVP.
- Autosave hanya menyimpan draft; record resmi hanya berubah lewat tombol **Simpan Perubahan**.
- Nilai kosong tidak dianggap nol dan nilai akhir tidak dihitung sampai lengkap.
- Hak wali kelas diperketat sesuai PRD, bukan akses penuh terhadap seluruh nilai akademik.

## 13. Fitur yang menunggu validasi sekolah

- Aktivasi penilaian Sikap Spiritual, Keterangan Spiritual, Sikap Sosial, dan Keterangan Sosial.
- Alur penerbitan nilai perkembangan (`PUBLISHED`).
- Finalisasi rapor mapel dan proses resmi membuka kembali (`REOPENED`) tetap menjadi bagian halaman Generate Rapor/alur sekolah.
- Integrasi API backend, audit trail, otorisasi server-side, dan penanganan konflik multi-pengguna.

## Verifikasi teknis

- `npm run build`: lulus, 1.674 modul ditransformasi.
- Pemeriksaan fungsi nilai: 83.7 untuk data Aditya dan `null` untuk komponen kosong.
- QA browser: login guru, landing, load filter, sorting, edit, validasi, autosave, incomplete confirmation, save resmi, cancel, navigation blocker, modal materi, persistensi reload, one-student layout, dan tujuh viewport lulus.
- Console browser setelah perbaikan: tidak ada error atau warning baru.
