import { Info } from "lucide-react";

export default function AccountInformationAlert({ profile }) {
  return (
    <section className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-blue-800"><div className="flex items-start gap-3"><Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /><div><h2 className="font-bold">Informasi Akun</h2><p className="mt-1 text-sm leading-6">Data identitas, email institusi, dan penugasan Anda dikelola oleh Administrator sekolah. Hubungi tim IT sekolah jika terdapat informasi yang perlu diperbaiki.</p><dl className="mt-3 grid gap-2 text-xs sm:grid-cols-2"><div><dt className="font-semibold">Terakhir login</dt><dd>{profile.lastLogin}</dd></div><div><dt className="font-semibold">IP demo</dt><dd>{profile.demoIpAddress} — data demonstrasi</dd></div></dl></div></div></section>
  );
}
