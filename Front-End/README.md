# EduTrack Frontend

Frontend React/Vite untuk role Administrator, Guru, dan Siswa. Seluruh route
aktif membaca data dari backend EduTrack; tidak tersedia mode mock atau fallback
ke data contoh.

## Menjalankan

```bash
cp .env.example .env
npm ci
npm test
npm run dev
```

Buka `http://localhost:5173`. Backend harus berjalan di
`http://localhost:4000`; target proxy dapat diubah melalui
`VITE_API_PROXY_TARGET`.

Build produksi:

```bash
npm run build
npm run preview
```

## Area aplikasi

- Administrator: akun, kelas dan penugasan, mapel/KKM, bobot nilai, database
  presensi/nilai/rapor, serta status database.
- Guru: kelas ajar, presensi, nilai, topik komponen, tampilan wali kelas, dan
  finalisasi/distribusi rapor.
- Siswa: dashboard, nilai dan topik, presensi, rapor, profil, dan AI insight.

JWT dan profil sesi disimpan pada browser untuk autentikasi API. Kata sandi
tidak disimpan pada source code. Password awal hasil pembuatan akun hanya
ditampilkan satu kali; gunakan fitur reset password bila hilang.

Dokumentasi workspace dan checklist demo ada di
[`../README.md`](../README.md) dan [`../DEMO_GUIDE.md`](../DEMO_GUIDE.md).
