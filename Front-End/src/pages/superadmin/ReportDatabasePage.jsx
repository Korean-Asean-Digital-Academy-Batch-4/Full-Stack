import { AlertCircle, Download, FileText, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { downloadAdminReport, getAdminReports, getClasses } from "../../services/adminService";
import { triggerCsvDownload } from "../../utils/attendanceExport";

function csv(value) { return `"${String(value ?? "").replaceAll('"', '""')}"`; }

export default function ReportDatabasePage() {
  const [classes, setClasses] = useState([]);
  const [classId, setClassId] = useState("");
  const [status, setStatus] = useState("");
  const [reports, setReports] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);

  const load = async () => { setState("loading"); setError(""); try { const result = await getAdminReports({ classId, status }); setReports(result.items || []); setState("ready"); } catch (requestError) { setError(requestError.message); setState("error"); } };
  useEffect(() => { Promise.all([getClasses(), getAdminReports()]).then(([classRows, result]) => { setClasses(classRows); setReports(result.items || []); setState("ready"); }).catch((requestError) => { setError(requestError.message); setState("error"); }); }, []);

  const exportCsv = () => { const rows = [["Nama", "NIS", "Kelas", "Periode", "Status", "Rata-rata"], ...reports.map((item) => [item.student_name, item.nis, item.class_name, `${item.academic_year} ${item.semester}`, item.status, item.average_score ?? ""])]; triggerCsvDownload(`\uFEFF${rows.map((row) => row.map(csv).join(",")).join("\r\n")}`, "database-rapor.csv"); setToast({ type: "success", message: "Database rapor berhasil diekspor." }); };
  const download = async (report) => { try { await downloadAdminReport(report.student_id, `rapor-${report.nis}.txt`); setToast({ type: "success", message: `Rapor ${report.student_name} berhasil diunduh.` }); } catch (requestError) { setToast({ type: "error", message: requestError.message || "Rapor belum dapat diunduh." }); } };

  return <main className="mx-auto max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8"><header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-[#20232D]">Database Rapor</h1><p className="mt-2 text-sm text-[#697184]">Status finalisasi dan distribusi rapor dari database.</p></div><Button variant="secondary" onClick={exportCsv} disabled={!reports.length}><Download className="h-4 w-4" /> Ekspor CSV</Button></header>
    <section className="mt-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-xs font-semibold text-[#697184]">KELAS<select value={classId} onChange={(event) => setClassId(event.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Semua kelas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-xs font-semibold text-[#697184]">STATUS<select value={status} onChange={(event) => setStatus(event.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Semua status</option><option>Draft</option><option>Finalized</option><option>Distributed</option></select></label><Button onClick={load}><RefreshCw className="h-4 w-4" /> Tampilkan</Button></section>
    <section className="mt-5 overflow-hidden rounded-xl border bg-white">{state === "error" ? <div role="alert" className="p-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-3 text-red-700">{error}</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[900px] text-left text-sm"><thead className="bg-[#F4F6F9] text-xs uppercase text-[#697184]"><tr><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">NIS</th><th className="px-4 py-3">Kelas</th><th className="px-4 py-3">Periode</th><th className="px-4 py-3">Rata-rata</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Unduh</th></tr></thead><tbody className="divide-y">{state === "loading" ? <tr><td colSpan={7} className="py-14 text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-[#0756D9]" /></td></tr> : reports.length ? reports.map((report) => <tr key={report.id}><td className="px-4 py-4 font-semibold">{report.student_name}</td><td className="px-4 py-4 font-mono text-xs">{report.nis}</td><td className="px-4 py-4">{report.class_name}</td><td className="px-4 py-4">{report.academic_year} · {report.semester}</td><td className="px-4 py-4">{report.average_score ?? "Belum lengkap"}</td><td className="px-4 py-4"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${report.status === "Distributed" ? "bg-emerald-50 text-emerald-700" : report.status === "Finalized" ? "bg-blue-50 text-blue-700" : "bg-amber-50 text-amber-700"}`}>{report.status}</span></td><td className="px-4 py-4 text-center"><button type="button" onClick={() => download(report)} disabled={report.status === "Draft"} className="rounded p-2 text-[#0756D9] hover:bg-blue-50 disabled:opacity-30"><Download className="h-4 w-4" /></button></td></tr>) : <tr><td colSpan={7} className="py-14 text-center text-[#697184]"><FileText className="mx-auto mb-2 h-8 w-8" />Belum ada rapor untuk filter ini.</td></tr>}</tbody></table></div>}</section><Toast toast={toast} onClose={() => setToast(null)} />
  </main>;
}
