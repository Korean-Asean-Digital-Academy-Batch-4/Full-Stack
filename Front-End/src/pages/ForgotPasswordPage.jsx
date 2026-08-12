import { CircleHelp, School } from "lucide-react";
import { Link } from "react-router-dom";
import AuthCard from "../components/auth/AuthCard";
import Button from "../components/ui/Button";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Lupa Kata Sandi"
      description="Pengaturan ulang kata sandi mandiri belum tersedia pada EduTrack."
    >
      <div className="rounded-xl border border-[#C8D9FF] bg-[#F2F6FF] p-5 text-sm text-[#3F4A5F]">
        <CircleHelp aria-hidden="true" className="h-6 w-6 text-[#0756D9]" />
        <h2 className="mt-3 font-semibold text-[#20232D]">Hubungi pihak sekolah</h2>
        <p className="mt-2 leading-6">
          Guru dan siswa dapat menghubungi Administrator sekolah atau Wali Kelas untuk mendapatkan kata sandi baru.
        </p>
      </div>
      <Link to="/login" className="mt-5 block">
        <Button className="w-full"><School aria-hidden="true" className="h-4 w-4" /> Kembali ke Login</Button>
      </Link>
    </AuthCard>
  );
}
