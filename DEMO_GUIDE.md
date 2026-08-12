# Panduan Demo EduTrack

## Persiapan

1. Pastikan backend dan frontend berjalan sesuai `README.md`.
2. Buka `http://localhost:4000/health`; hasil harus `{"status":"ok"}`.
3. Jalankan `npm run audit:db` dan `npm run smoke` dari folder `Back-End`.
4. Siapkan akun admin, satu guru yang memiliki penugasan kelas/mapel, dan satu
   siswa yang sudah terdaftar pada kelas yang sama.

Password awal hanya ditampilkan satu kali setelah admin membuat atau mengimpor
akun. Simpan hasil tersebut secara aman untuk kebutuhan demo. Jika lupa, gunakan
aksi reset password pada DB Guru atau DB Siswa.

## Urutan presentasi

1. Login admin dan tunjukkan Dashboard; angka ringkasan berasal dari database.
2. Buat/impor akun guru dan siswa. Tunjukkan detail baris gagal bila CSV salah.
3. Buka DB Mata Pelajaran untuk membuat mapel serta menetapkan guru dan KKM.
4. Buka Penugasan Kelas, buat/pilih kelas, lalu gunakan **Kelola Penugasan**
   untuk menetapkan wali kelas, menghubungkan mapel, dan mengimpor siswa.
5. Login guru, tampilkan kelas ajar, presensi, nilai, dan topik setiap komponen.
6. Login siswa, tampilkan nilai, presensi, profil, lalu jalankan AI insight.
7. Tunjukkan rapor. Bila belum difinalisasi, sistem secara benar menampilkan
   status belum tersedia; lengkapi seluruh nilai sebelum alur finalisasi.

## Checklist lulus demo

- Tidak ada error jaringan merah pada halaman yang dipresentasikan.
- Delapan komponen penilaian ada dan total bobot tepat 100%.
- Guru hanya melihat kelas/mapel yang ditugaskan kepadanya.
- Siswa hanya melihat data miliknya sendiri.
- Topik dan nilai yang diubah guru terlihat pada akun siswa setelah dimuat ulang.
- AI insight menyebut topik dan skor aktual siswa.
- Jangan mengubah `.env` atau menjalankan migrasi saat presentasi.
