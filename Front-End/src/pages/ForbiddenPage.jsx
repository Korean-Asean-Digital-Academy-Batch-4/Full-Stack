import { LockKeyhole } from "lucide-react";
import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F9FC] p-6 text-center">
      <span className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-50 text-[#2F67ED]"><LockKeyhole className="h-7 w-7" /></span>
      <p className="mt-5 text-sm font-semibold uppercase tracking-widest text-[#2F67ED]">Fitur Terkunci · 403</p>
      <h1 className="mt-3 text-3xl font-bold">Khusus Wali Kelas</h1>
      <p className="mt-3 max-w-md text-[#545968]">Generate dan pengelolaan rapor hanya dapat diakses oleh guru yang sedang ditetapkan sebagai wali kelas aktif.</p>
      <Link to="/teacher/dashboard" className="mt-6 font-semibold text-[#0756D9] hover:underline">Kembali ke Dashboard</Link>
    </main>
  );
}
