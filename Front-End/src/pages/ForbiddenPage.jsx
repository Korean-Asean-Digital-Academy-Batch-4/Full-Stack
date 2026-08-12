import { Link } from "react-router-dom";

export default function ForbiddenPage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-[#F7F9FC] p-6 text-center">
      <p className="text-sm font-semibold uppercase tracking-widest text-[#2F67ED]">403</p>
      <h1 className="mt-3 text-3xl font-bold">Akses tidak diizinkan</h1>
      <p className="mt-3 text-[#545968]">Akun Anda tidak memiliki izin untuk membuka halaman ini.</p>
      <Link to="/login" className="mt-6 font-semibold text-[#0756D9] hover:underline">Kembali ke login</Link>
    </main>
  );
}
