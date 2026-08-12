import { CheckCircle2, CircleAlert, Send, ShieldCheck } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { distributeHomeroomReports, finalizeHomeroomReports, getHomeroomWorkspace } from "../../services/homeroomService";
import { getStoredUser } from "../../stores/authStore";
import { getActiveHomeroomClassId } from "../../utils/teacherPermissions";

export default function TeacherHomeroomReportsPage() {
  const user = getStoredUser();
  const classId = getActiveHomeroomClassId(user);
  const [state, setState] = useState("loading");
  const [workspace, setWorkspace] = useState(null);
  const [action, setAction] = useState("");
  const [toast, setToast] = useState(null);

  const load = async () => {
    setState("loading");
    try { setWorkspace(await getHomeroomWorkspace(classId)); setState("loaded"); }
    catch { setState("error"); }
  };
  useEffect(() => { load(); }, [classId]);

  const finalize = async () => {
    setAction("finalize");
    try { await finalizeHomeroomReports(classId); await load(); setToast({ type: "success", message: "Rapor seluruh siswa berhasil difinalisasi." }); }
    catch (error) { setToast({ type: "error", message: error.message || "Finalisasi ditolak karena data belum lengkap." }); }
    finally { setAction(""); }
  };

  const distribute = async () => {
    setAction("distribute");
    try { await distributeHomeroomReports(classId); await load(); setToast({ type: "success", message: "Rapor berhasil didistribusikan kepada siswa." }); }
    catch { setToast({ type: "error", message: "Rapor harus difinalisasi sebelum didistribusikan." }); }
    finally { setAction(""); }
  };

  return (
    <div className="px-4 py-8 sm:px-7 lg:px-10"><div className="mx-auto max-w-[1050px]">
      <header><h1 className="text-[26px] font-bold text-[#20232D]">Rapor Semester Wali Kelas</h1><p className="mt-1 text-sm text-[#64748B]">Periksa kelengkapan seluruh mata pelajaran sebelum finalisasi dan distribusi rapor {user?.homeroomAssignment?.className}.</p></header>
      {state === "loading" && <div role="status" className="flex min-h-[320px] items-center justify-center"><Spinner className="h-8 w-8 text-[#0756D9]" /></div>}
      {state === "error" && <section role="alert" className="mt-8 rounded-xl border border-red-100 bg-white p-8 text-center"><CircleAlert className="mx-auto h-9 w-9 text-red-500" /><p className="mt-3 font-semibold">Data rapor kelas belum dapat dimuat.</p><Button onClick={load} className="mt-5">Coba Lagi</Button></section>}
      {state === "loaded" && workspace && <>
        <section className="mt-7 grid gap-4 sm:grid-cols-3"><Summary label="Jumlah Siswa" value={workspace.overview?.studentCount ?? 0} /><Summary label="Rata-rata Kelas" value={workspace.overview?.average ?? "-"} /><Summary label="Status Rapor" value={workspace.status} accent /></section>
        <section className="mt-6 overflow-hidden rounded-xl border border-[#DDE2EC] bg-white"><div className="border-b border-[#E6E9F0] px-5 py-4"><h2 className="font-bold">Kelengkapan Mata Pelajaran</h2></div><div className="divide-y divide-[#E8EBF2]">{(workspace.completeness?.subjects || workspace.completeness?.items || []).map((subject) => <div key={subject.id || subject.subjectId || subject.name} className="flex items-center gap-4 px-5 py-4"><CheckCircle2 className={`h-5 w-5 ${subject.complete ? "text-emerald-500" : "text-amber-500"}`} /><div className="flex-1"><p className="font-semibold">{subject.name || subject.subjectName}</p><p className="text-xs text-[#697184]">{subject.teacherName || subject.teacher?.name || "Guru Mapel"}</p></div><span className={`rounded-full px-3 py-1 text-xs font-semibold ${subject.complete ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>{subject.complete ? "Lengkap" : "Belum Lengkap"}</span></div>)}</div></section>
        <div className="mt-6 flex flex-col justify-end gap-3 sm:flex-row"><Button variant="secondary" onClick={finalize} loading={action === "finalize"} disabled={!workspace.completeness?.complete || workspace.status !== "Draft"}><ShieldCheck className="h-4 w-4" /> Finalisasi Rapor Kelas</Button><Button onClick={distribute} loading={action === "distribute"} disabled={workspace.status !== "Finalized"}><Send className="h-4 w-4" /> Distribusikan ke Siswa</Button></div>
      </>}
    </div><Toast toast={toast} onClose={() => setToast(null)} /></div>
  );
}

function Summary({ label, value, accent = false }) {
  return <article className="rounded-xl border border-[#E1E5ED] bg-white p-5"><p className="text-xs font-semibold uppercase tracking-wide text-[#697184]">{label}</p><p className={`mt-2 text-2xl font-bold ${accent ? "text-[#0756D9]" : "text-[#20232D]"}`}>{value}</p></article>;
}
