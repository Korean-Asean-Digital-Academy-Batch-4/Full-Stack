# EduTrack Terintegrasi

EduTrack terdiri dari frontend React/Vite dan backend Express yang membaca serta
menulis data akademik langsung ke PostgreSQL Supabase. Mode data contoh tidak
digunakan pada aplikasi aktif.

```text
Full-Stack/
├── Front-End/      React + Vite (http://localhost:5173)
├── Back-End/       Express API (http://localhost:4000)
└── Data-Supabase/  arsip/materi database
```

## FIX AUTH LOGIN

Akun berikut digunakan untuk development dan pengujian aplikasi. Administrator
login menggunakan email, guru menggunakan NIP, dan siswa menggunakan NIS.

### Administrator

| Email | Password |
|---|---|
| `admin@sekolah.id` | `AdminEdu#2026` |
| `admin@edutrack.test` | `AdminEdu#2026` |

### Guru

| Nama | NIP | Password |
|---|---|---|
| Budi Santoso | `198501000000000000` | `GuruEdu#2026` |
| Budi Santoso | `1987010000000000` | `GuruEdu#2026` |
| Nining S.Pd. | `23874500000000000000000` | `GuruEdu#2026` |

### Siswa

| Nama | NIS | Password |
|---|---|---|
| Farhan | `2025100004` | `SiswaEdu#2026` |
| Jingga Fahirah | `392333374585888` | `SiswaEdu#2026` |
| Mikguk Soo | `20202989476283` | `SiswaEdu#2026` |
| Siti Aminah | `2026100123` | `SiswaEdu#2026` |
| Tika Massala | `304895758393020` | `SiswaEdu#2026` |

## Menjalankan aplikasi

Terminal pertama:

```bash
cd "Back-End"
cp .env.example .env
npm ci
npm run audit:db
npm run smoke
npm run dev
```

Isi `DATABASE_URL`, `JWT_SECRET`, dan `GEMINI_API_KEY` di `Back-End/.env`.
Untuk database Supabase existing yang sudah berisi tabel, jangan menjalankan
migrasi ulang. Gunakan `npm run reconcile:schema` hanya bila audit menemukan
struktur yang belum sesuai, lalu jalankan `npm run harden:security` dan audit
ulang.

Terminal kedua:

```bash
cd "Front-End"
cp .env.example .env
npm ci
npm run dev
```

Buka `http://localhost:5173`. Saat development, Vite meneruskan `/api` ke
backend port 4000. Untuk deployment terpisah, isi `VITE_API_BASE_URL` dengan URL
API publik dan samakan `CORS_ORIGIN` backend dengan origin frontend.

## Alur data aktif

- Admin: akun guru/siswa, kelas, wali kelas, mapel, komponen nilai, presensi,
  nilai, rapor, dan status database berasal dari API.
- Guru: kelas ajar, siswa, presensi, nilai T1–T3/U1–U3/UTS/UAS, topik materi,
  nilai wali kelas, dan kesiapan rapor berasal dari API.
- Siswa: profil, kelas, nilai, topik, presensi, rapor, dan AI insight berasal
  dari API dan data Supabase.
- Perubahan tersimpan ke database melalui tombol simpan. Pengguna lain melihat
  data terbaru saat halaman dimuat ulang atau filter ditampilkan kembali.

## Riwayat perubahan terintegrasi (Update 1–terkini)

Ringkasan berikut mencatat rangkaian perbaikan frontend, backend, dan database
yang sudah digabungkan ke project ini sampai 12 Agustus 2026.

1. **Autentikasi dan akun demo.** Login Administrator memakai email, Guru memakai
   NIP, dan Siswa memakai NIS. Normalisasi profil, role, penugasan guru, status wali
   kelas, reset password, serta kredensial pengujian didokumentasikan di README.
2. **Impor CSV dan pembuatan akun manual.** Parser menerima berkas template dengan
   normalisasi BOM, spasi, kapitalisasi header, serta pemisah CSV yang sesuai.
   Administrator juga dapat membuat akun Guru/Siswa secara manual. Nomor hasil
   pembuatan akun kini selalu berurutan dan tidak lagi menampilkan UUID sebagai nomor.
3. **Pengelolaan dan penghapusan data Administrator.** Ditambahkan aksi hapus dengan
   konfirmasi pada database Guru, Siswa, Presensi, Mata Pelajaran, Nilai, Rapor, serta
   pengelolaan kelas/penugasan. Backend memvalidasi dependensi agar penghapusan tidak
   meninggalkan data akademik yatim.
4. **Sinkronisasi tanggal presensi.** Pemilihan tanggal kalender tidak lagi mundur satu
   hari akibat konversi UTC. Kolom presensi ditampilkan tepat di bawah tanggalnya dan
   label pertemuan `P1/P2/P4` dihilangkan agar tabel lebih jelas.
5. **Rekap dan input presensi.** CSV rekap mencantumkan tanggal setiap pertemuan.
   Ditambahkan tombol **Hadir Semua**, status Hadir/Izin/Sakit/Alpa tetap dapat diedit,
   serta mode **Edit Presensi** setelah data tersimpan.
6. **Presensi siswa baru dan kelas lama.** Penyimpanan presensi menggunakan upsert dan
   memvalidasi keanggotaan kelas, sehingga siswa yang baru dimasukkan ke kelas dengan
   sesi presensi lama tetap dapat dicatat tanpa membuat kelas baru.
7. **Nilai dan identitas siswa.** NIS sekarang ikut dikirim backend dan tampil pada
   tabel nilai wali kelas. Validasi komponen T1–T3, U1–U3, UTS, UAS, rentang nilai,
   bobot 100%, topik pembelajaran, dan kelengkapan nilai tetap diterapkan.
8. **Akses rapor khusus wali kelas.** Menu dan endpoint Generate Rapor dikunci untuk
   Guru biasa. Hanya wali kelas yang sesuai (atau Administrator) dapat melihat,
   membuat, memberi catatan, memfinalisasi, dan mendistribusikan rapor kelas tersebut.
9. **Rapor PDF.** Unduhan rapor Siswa, Guru/Wali Kelas, dan Administrator sekarang
   menghasilkan PDF, bukan TXT. PDF memuat identitas, periode, nilai per mapel,
   kehadiran, status, dan catatan wali kelas.
10. **Finalisasi dan distribusi rapor.** Finalisasi dipisahkan dari distribusi. Tombol
    **Distribusikan Semua** tersedia berdampingan dengan **Buat Semua Rapor**, dan hanya
    rapor berstatus Finalized yang dibagikan ke akun siswa.
11. **Catatan rapor panjang.** Kolom `report_cards.general_note` diselaraskan dari
    `varchar(50)` menjadi `TEXT`. Backend menerima maksimal 2.000 karakter, UI
    menampilkan penghitung karakter, serta memberi peringatan saat mendekati batas.
12. **Draf catatan dengan Gemini AI.** Tombol **Buat Draf AI** mengambil rata-rata,
    nilai setiap mata pelajaran, KKM, dan rekap Hadir/Izin/Sakit/Alpa dari Supabase.
    AI hanya mengisi editor; catatan tetap harus ditinjau dan disimpan wali kelas.
    Jika layanan AI gagal, aplikasi membuat draf lokal berbasis data yang sama.

### Verifikasi update terkini

- Audit skema Supabase: 15 tabel tersedia, RLS aktif, tidak ada kolom atau indeks wajib
  yang hilang, dan tidak ada ketidaksesuaian tipe.
- Smoke test backend: autentikasi, endpoint Admin, Guru, Wali Kelas, dan Siswa lulus.
- Frontend: 15 pengujian kontrak lulus dan build produksi Vite berhasil.
- Endpoint draf AI telah diuji sebagai wali kelas dan mengembalikan catatan berdasarkan
  nilai serta kehadiran tanpa menyimpan data otomatis.

## Verifikasi sebelum demo

```bash
cd "Front-End" && npm test && npm run build
cd "../Back-End" && npm run audit:db && npm run smoke
```

Lihat [DEMO_GUIDE.md](./DEMO_GUIDE.md) untuk urutan demonstrasi dan checklist.

## Keamanan dan batasan yang perlu diketahui

- Jangan commit file `.env`; `.env.example` hanya berisi placeholder.
- Putar ulang `JWT_SECRET`, password demo, database password, dan Gemini API key
  sebelum repository dibagikan kepada pihak lain.
- Siswa hanya dapat mengunduh rapor setelah wali kelas memfinalisasi dan
  mendistribusikannya. Wali kelas dapat mengunduh pratinjau PDF berwatermark
  saat rapor masih berstatus Draft, sedangkan admin dapat mengunduh tiap versi
  rapor dari halaman Database Rapor.
  Database yang belum memiliki `report_cards` akan menampilkan keadaan kosong
  secara jujur, bukan data contoh.
- Unduhan rapor siswa, wali kelas, dan admin menggunakan PDF A4 (`application/pdf`).
- Sesi presensi baru otomatis mengisi seluruh siswa dengan status `Hadir`;
  guru cukup mengubah siswa yang Izin, Sakit, atau Alpa.
- Paket `xlsx` backend existing dipakai untuk impor siswa. Batasi fitur unggah
  untuk administrator tepercaya dan lakukan pembaruan parser saat versi aman
  tersedia.
