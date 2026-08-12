# EduTrack Terintegrasi

EduTrack terdiri dari frontend React/Vite dan backend Express yang membaca serta
menulis data akademik langsung ke PostgreSQL Supabase. Mode data contoh tidak
digunakan pada aplikasi aktif.

```text
Backup Capstone/
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
- Rapor hanya tersedia setelah wali kelas memfinalisasi dan mendistribusikannya.
  Database yang belum memiliki `report_cards` akan menampilkan keadaan kosong
  secara jujur, bukan data contoh.
- Unduhan rapor backend existing saat ini berbentuk `.txt`, belum PDF.
- Paket `xlsx` backend existing dipakai untuk impor siswa. Batasi fitur unggah
  untuk administrator tepercaya dan lakukan pembaruan parser saat versi aman
  tersedia.
