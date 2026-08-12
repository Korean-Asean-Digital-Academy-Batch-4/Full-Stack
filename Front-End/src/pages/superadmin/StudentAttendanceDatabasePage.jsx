import { AlertCircle, CalendarDays, LoaderCircle, Pencil, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Toast from "../../components/ui/Toast";
import { getAdminAttendance, getClasses, updateAdminAttendance } from "../../services/adminService";

const statuses = ["Hadir", "Izin", "Sakit", "Alpa"];

export default function StudentAttendanceDatabasePage() {
  const [classes, setClasses] = useState([]);
  const [filters, setFilters] = useState({ classId: "", date: "" });
  const [records, setRecords] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null);
  const [draftStatus, setDraftStatus] = useState("Hadir");
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  const load = async (nextFilters = filters) => {
    setState("loading"); setError("");
    try { const result = await getAdminAttendance(nextFilters); setRecords(result.items || []); setState("ready"); }
    catch (requestError) { setError(requestError.message || "Presensi gagal dimuat."); setState("error"); }
  };
  useEffect(() => { Promise.all([getClasses(), getAdminAttendance()]).then(([classRows, result]) => { setClasses(classRows); setRecords(result.items || []); setState("ready"); }).catch((requestError) => { setError(requestError.message); setState("error"); }); }, []);

  const save = async () => {
    setSaving(true);
    try {
      await updateAdminAttendance(editing.session_id, [{ studentId: editing.student_id, status: draftStatus }]);
      setRecords((items) => items.map((item) => item.id === editing.id ? { ...item, status: draftStatus } : item));
      setEditing(null); setToast({ type: "success", message: "Status presensi tersimpan ke database." });
    } catch (requestError) { setToast({ type: "error", message: requestError.message || "Presensi gagal disimpan." }); }
    finally { setSaving(false); }
  };

  return <main className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 lg:px-8"><header><h1 className="text-3xl font-bold text-[#20232D]">Database Presensi Siswa</h1><p className="mt-2 text-sm text-[#697184]">Seluruh catatan presensi yang dibuat guru.</p></header>
    <section className="mt-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-xs font-semibold text-[#697184]">KELAS<select value={filters.classId} onChange={(event) => setFilters((current) => ({ ...current, classId: event.target.value }))} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Semua kelas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-xs font-semibold text-[#697184]">TANGGAL<input type="date" value={filters.date} onChange={(event) => setFilters((current) => ({ ...current, date: event.target.value }))} className="mt-2 h-10 w-full rounded-md border px-3 text-sm" /></label><Button onClick={() => load()}><RefreshCw className="h-4 w-4" /> Tampilkan</Button></section>
    <section className="mt-5 overflow-hidden rounded-xl border bg-white">{state === "error" ? <div role="alert" className="p-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-3 text-red-700">{error}</p></div> : <div className="overflow-x-auto"><table className="w-full min-w-[1000px] text-left text-sm"><thead className="bg-[#F4F6F9] text-xs uppercase text-[#697184]"><tr><th className="px-4 py-3">Tanggal</th><th className="px-4 py-3">Siswa</th><th className="px-4 py-3">NIS</th><th className="px-4 py-3">Kelas</th><th className="px-4 py-3">Mapel</th><th className="px-4 py-3">Guru</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-center">Aksi</th></tr></thead><tbody className="divide-y">{state === "loading" ? <tr><td colSpan={8} className="py-14 text-center"><LoaderCircle className="mx-auto h-6 w-6 animate-spin text-[#0756D9]" /></td></tr> : records.length ? records.map((record) => <tr key={record.id}><td className="px-4 py-4">{String(record.session_date).slice(0, 10)}</td><td className="px-4 py-4 font-semibold">{record.student_name}</td><td className="px-4 py-4 font-mono text-xs">{record.nis}</td><td className="px-4 py-4">{record.class_name}</td><td className="px-4 py-4">{record.subject_name}</td><td className="px-4 py-4">{record.teacher_name}</td><td className="px-4 py-4"><span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">{record.status}</span></td><td className="px-4 py-4 text-center"><button type="button" onClick={() => { setEditing(record); setDraftStatus(record.status); }} className="rounded p-2 text-[#0756D9] hover:bg-blue-50"><Pencil className="h-4 w-4" /></button></td></tr>) : <tr><td colSpan={8} className="py-14 text-center text-[#697184]"><CalendarDays className="mx-auto mb-2 h-8 w-8" />Belum ada catatan presensi untuk filter ini.</td></tr>}</tbody></table></div>}</section>
    <Modal open={Boolean(editing)} onClose={() => !saving && setEditing(null)} title="Ubah Status Presensi" description={editing ? `${editing.student_name} · ${editing.class_name} · ${String(editing.session_date).slice(0, 10)}` : ""}><label className="block text-sm font-semibold">Status<select value={draftStatus} onChange={(event) => setDraftStatus(event.target.value)} className="mt-2 h-11 w-full rounded-lg border px-3">{statuses.map((status) => <option key={status}>{status}</option>)}</select></label><div className="mt-5 flex justify-end gap-3"><Button variant="secondary" onClick={() => setEditing(null)}>Batal</Button><Button onClick={save} loading={saving}>Simpan</Button></div></Modal><Toast toast={toast} onClose={() => setToast(null)} />
  </main>;
}
