import VerificationBadge from "./VerificationBadge";

export default function AccountHeader() {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h1 className="text-2xl font-bold tracking-[-0.03em] text-[#202838] sm:text-[28px]">Pengaturan Profil</h1><p className="mt-2 text-sm text-[#64748B]">Informasi identitas dan akun Anda dikelola oleh Administrator sekolah.</p></div><VerificationBadge /></header>
  );
}
