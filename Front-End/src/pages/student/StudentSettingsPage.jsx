import { CircleUserRound, IdCard, Info, LockKeyhole } from "lucide-react";
import { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import { getStudentProfile } from "../../services/studentService";

const detailFields = [
  { label: "Nama Pengguna", key: "name" },
  { label: "Alamat Email", key: "email" },
  { label: "Peran Sistem", key: "roleLabel" },
  { label: "NISN", key: "nisn" },
];

export default function StudentSettingsPage() {
  const [profile, setProfile] = useState(null);
  const [status, setStatus] = useState("loading");

  const loadProfile = async () => {
    setStatus("loading");
    try {
      setProfile(await getStudentProfile());
      setStatus("loaded");
    } catch {
      setProfile(null);
      setStatus("error");
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (status === "loading") {
    return <div role="status" className="flex min-h-[65vh] items-center justify-center"><Spinner className="h-8 w-8 text-[#2F67ED]" /><span className="sr-only">Memuat profil siswa</span></div>;
  }

  if (status === "error") {
    return <section role="alert" className="mx-auto mt-16 max-w-md rounded-xl border border-red-100 bg-white p-8 text-center"><p className="font-semibold">Profil belum dapat dimuat.</p><button type="button" onClick={loadProfile} className="mt-3 text-sm font-semibold text-[#0756D9] hover:underline">Coba Lagi</button></section>;
  }

  return (
    <div>
      <div className="bg-gradient-to-r from-[#F7F9FC] to-[#EEF4FF] px-4 py-7 sm:px-7 lg:px-10">
        <header className="mx-auto max-w-[1050px]">
          <span className="rounded bg-[#ECECF8] px-2 py-1 text-[10px] font-medium uppercase tracking-[0.16em] text-[#4D5567]">System Profile</span>
          <h1 className="mt-3 text-[26px] font-bold tracking-[-0.035em] text-[#20232D]">Pengaturan Profil</h1>
          <p className="mt-1 max-w-[530px] text-sm leading-5 text-[#565E70]">Informasi identitas digital Anda dalam ekosistem EduTrack. Data ini dikelola oleh administrasi sekolah.</p>
        </header>
      </div>

      <div className="px-4 pb-12 sm:px-7 lg:px-10">
        <div className="mx-auto grid max-w-[1050px] gap-6 lg:grid-cols-[300px_minmax(0,1fr)]">
          <article className="rounded-xl bg-white p-7 text-center shadow-[0_2px_8px_rgba(30,42,75,0.10)]">
            <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-gradient-to-br from-[#2F67ED] to-[#7C3AED] p-1 shadow-[0_6px_14px_rgba(47,103,237,0.20)]">
              <div className="flex h-full w-full items-center justify-center rounded-full bg-[#F0F1FF]">
                <CircleUserRound aria-hidden="true" className="h-20 w-20 text-[#A6BEEE]" strokeWidth={1.5} />
              </div>
            </div>
            <h2 className="mt-6 text-lg font-bold text-[#20232D]">{profile.name}</h2>
            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[#0756D9]">{profile.className ? `Siswa Kelas ${profile.className}` : "Belum ditempatkan ke kelas"}</p>
            <div className="mt-8 border-t border-[#E7EAF1] pt-5">
              <dl className="grid grid-cols-2 gap-4 text-left">
                <div className="rounded-lg bg-[#F3F3FF] p-3"><dt className="text-[11px] text-[#697184]">Bergabung</dt><dd className="mt-1 text-sm font-medium">{profile.joinedAt}</dd></div>
                <div className="rounded-lg bg-[#F3F3FF] p-3"><dt className="text-[11px] text-[#697184]">Status</dt><dd className="mt-1 text-sm font-semibold text-emerald-600">{profile.status}</dd></div>
              </dl>
            </div>
          </article>

          <div className="space-y-5">
            <article className="rounded-xl bg-white p-6 shadow-[0_2px_8px_rgba(30,42,75,0.06)] sm:p-8">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#EAF1FF] text-[#0756D9]"><IdCard aria-hidden="true" className="h-5 w-5" /></span>
                <h2 className="text-lg font-bold text-[#20232D]">Detail Akun</h2>
              </div>
              <div className="mt-7 grid gap-x-8 gap-y-6 sm:grid-cols-2">
                {detailFields.map((field) => (
                  <div key={field.key}>
                    <p className="flex items-center gap-1.5 text-xs font-semibold text-[#545C6D]">{field.label}<LockKeyhole aria-hidden="true" className="h-3 w-3 text-[#747D90]" /></p>
                    <div role="textbox" aria-label={field.label} aria-readonly="true" className="mt-2 flex h-11 items-center rounded-lg bg-[#F3F3FF] px-4 text-sm text-[#343946]">{profile[field.key]}</div>
                  </div>
                ))}
              </div>
            </article>

            <section className="rounded-xl border border-[#B8CDFC] bg-[#EAF1FF] p-5 text-[#2F67ED]">
              <div className="flex items-start gap-4">
                <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
                <div><h2 className="text-sm font-bold">Informasi Terkunci</h2><p className="mt-2 text-xs leading-5 text-[#4F5D78]">Untuk keamanan integritas data akademik, perubahan pada profil utama hanya dapat dilakukan melalui tim IT atau Administrasi Sekolah. Jika terdapat kekeliruan data, harap hubungi meja bantuan sekolah.</p></div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
