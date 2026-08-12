import { AlertCircle, BookOpenCheck, CalendarCheck, FileText, GraduationCap, RefreshCw, School, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import { getAdminDashboard } from "../../services/adminService";
import { getStoredUser } from "../../stores/authStore";

const cards = [
  ["teachers", "Guru", GraduationCap, "bg-blue-50 text-blue-700"],
  ["students", "Siswa", UsersRound, "bg-violet-50 text-violet-700"],
  ["classes", "Kelas", School, "bg-amber-50 text-amber-700"],
  ["subjects", "Mata Pelajaran", BookOpenCheck, "bg-emerald-50 text-emerald-700"],
  ["attendance_sessions", "Sesi Presensi", CalendarCheck, "bg-cyan-50 text-cyan-700"],
  ["recorded_grades", "Nilai Terekam", FileText, "bg-rose-50 text-rose-700"],
];

export default function SuperAdminDashboardPage() {
  const user = getStoredUser();
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const load = useCallback(async () => { setState("loading"); try { setData(await getAdminDashboard()); setState("ready"); } catch (requestError) { setError(requestError.message); setState("error"); } }, []);
  useEffect(() => { load(); }, [load]);

  return <main className="mx-auto max-w-[1100px] px-4 py-8 sm:px-6 lg:px-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-[#20232D]">Selamat datang, {user?.name || "Administrator"}</h1><p className="mt-2 text-sm text-[#697184]">Ringkasan langsung kondisi data EduTrack.</p></div><Button variant="secondary" onClick={load} disabled={state === "loading"}><RefreshCw className={`h-4 w-4 ${state === "loading" ? "animate-spin" : ""}`} /> Perbarui Data</Button></header>
    {state === "loading" && !data ? <div className="flex min-h-[360px] items-center justify-center"><Spinner className="h-8 w-8 text-[#0756D9]" /></div> : state === "error" ? <section role="alert" className="mt-8 rounded-xl border border-red-100 bg-white p-10 text-center"><AlertCircle className="mx-auto h-9 w-9 text-red-500" /><p className="mt-3 text-red-700">{error || "Dashboard gagal dimuat."}</p><Button onClick={load} className="mt-5">Coba Lagi</Button></section> : data && <>
      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{cards.map(([key, label, Icon, tone]) => <article key={key} className="rounded-xl border border-[#E1E5ED] bg-white p-5"><span className={`flex h-11 w-11 items-center justify-center rounded-lg ${tone}`}><Icon className="h-5 w-5" /></span><p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#697184]">{label}</p><p className="mt-1 text-3xl font-bold text-[#20232D]">{data[key] ?? 0}</p></article>)}</section>
      <section className="mt-6 grid gap-4 sm:grid-cols-3"><Summary label="Periode Aktif" value={`${data.academic_year || "Belum aktif"} · ${data.semester || "-"}`} /><Summary label="Rapor Tersimpan" value={data.report_cards ?? 0} /><Summary label="Rapor Didistribusikan" value={data.distributed_reports ?? 0} /></section>
    </>}
  </main>;
}

function Summary({ label, value }) { return <article className="rounded-xl bg-gradient-to-r from-[#EEF3FF] to-[#F5F1FF] p-5"><p className="text-xs font-semibold uppercase text-[#697184]">{label}</p><p className="mt-2 text-lg font-bold text-[#20232D]">{value}</p></article>; }
