import { AlertCircle, LoaderCircle, RefreshCw, Save, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import { deleteAdminGrades, getAdminGrades, getClassDetail, getClasses, updateAdminGrades } from "../../services/adminService";

export default function GradeDatabasePage() {
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [classId, setClassId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [data, setData] = useState(null);
  const [scores, setScores] = useState({});
  const [state, setState] = useState("loading");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [toast, setToast] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  useEffect(() => { getClasses().then(async (items) => { setClasses(items); const first = items[0]; if (!first) { setState("ready"); return; } setClassId(first.id); const detail = await getClassDetail(first.id); setSubjects(detail.subjects); setSubjectId(detail.subjects[0]?.id || ""); setState("ready"); }).catch((requestError) => { setError(requestError.message); setState("error"); }); }, []);

  const changeClass = async (nextId) => { setClassId(nextId); setData(null); setState("loading"); try { const detail = await getClassDetail(nextId); setSubjects(detail.subjects); setSubjectId(detail.subjects[0]?.id || ""); setState("ready"); } catch (requestError) { setError(requestError.message); setState("error"); } };
  const load = async () => { if (!classId || !subjectId) return; setState("loading"); setError(""); try { const result = await getAdminGrades({ classId, subjectId }); const next = {}; result.items.forEach((row) => { next[row.student_id] ||= {}; next[row.student_id][row.component_code] = row.score == null ? "" : String(row.score); }); setScores(next); setData(result); setState("ready"); } catch (requestError) { setError(requestError.message); setState("error"); } };

  const students = useMemo(() => { const map = new Map(); (data?.items || []).forEach((row) => map.set(row.student_id, { id: row.student_id, name: row.student_name, nis: row.nis })); return [...map.values()]; }, [data]);
  const updateScore = (studentId, code, value) => { if (value !== "" && (!/^\d{0,3}(\.\d{0,2})?$/.test(value) || Number(value) > 100)) return; setScores((current) => ({ ...current, [studentId]: { ...current[studentId], [code]: value } })); };
  const save = async () => { setSaving(true); try { const entries = students.flatMap((student) => data.components.map((component) => ({ studentId: student.id, componentCode: component.code, score: scores[student.id]?.[component.code] === "" ? null : Number(scores[student.id]?.[component.code]) }))); await updateAdminGrades({ classId, subjectId, entries }); setToast({ type: "success", message: "Nilai tersimpan ke database." }); await load(); } catch (requestError) { setToast({ type: "error", message: requestError.message || "Nilai gagal disimpan." }); } finally { setSaving(false); } };
  const removeGrades = async () => { setDeleting(true); setDeleteError(""); try { await deleteAdminGrades({ classId, subjectId }); setDeleteOpen(false); setScores({}); setData(null); setToast({ type: "success", message: "Seluruh nilai pada kelas dan mapel tersebut berhasil dihapus." }); } catch (requestError) { setDeleteError(requestError.message || "Nilai gagal dihapus."); } finally { setDeleting(false); } };

  return <main className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 lg:px-8"><header><h1 className="text-3xl font-bold text-[#20232D]">Database Nilai</h1><p className="mt-2 text-sm text-[#697184]">Nilai per kelas dan mata pelajaran langsung dari database.</p></header>
    <section className="mt-6 grid gap-3 rounded-xl border bg-white p-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end"><label className="text-xs font-semibold text-[#697184]">KELAS<select value={classId} onChange={(event) => changeClass(event.target.value)} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Pilih kelas</option>{classes.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-xs font-semibold text-[#697184]">MATA PELAJARAN<select value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setData(null); }} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Pilih mapel</option>{subjects.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.teacher_name}</option>)}</select></label><Button onClick={load} disabled={!classId || !subjectId}><RefreshCw className="h-4 w-4" /> Tampilkan</Button></section>
    {state === "error" ? <section role="alert" className="mt-5 rounded-xl border border-red-100 bg-white p-10 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-3 text-red-700">{error}</p></section> : data ? <section className="mt-5 overflow-hidden rounded-xl border bg-white"><div className="flex items-center justify-between border-b px-5 py-4"><div><h2 className="font-bold">{data.subject.name} {data.subject.grade_level}</h2><p className="mt-1 text-xs text-[#697184]">Guru: {data.subject.teacher_name} · KKM {data.subject.kkm}</p></div><div className="flex gap-2"><Button variant="danger" onClick={() => { setDeleteOpen(true); setDeleteError(""); }}><Trash2 className="h-4 w-4" /> Hapus Nilai</Button><Button onClick={save} loading={saving}><Save className="h-4 w-4" /> Simpan Nilai</Button></div></div><div className="overflow-x-auto"><table className="min-w-[1100px] w-full text-sm"><thead className="bg-[#F4F6F9] text-xs uppercase text-[#697184]"><tr><th className="sticky left-0 z-10 bg-[#F4F6F9] px-4 py-3 text-left">Nama Siswa</th>{data.components.map((component) => <th key={component.code} className="px-3 py-3 text-center">{component.code}<span className="block font-normal">{Number(component.weight_percent)}%</span></th>)}</tr></thead><tbody className="divide-y">{students.length ? students.map((student) => <tr key={student.id}><td className="sticky left-0 bg-white px-4 py-3 font-semibold">{student.name}</td>{data.components.map((component) => <td key={component.code} className="px-2 py-2"><input inputMode="decimal" value={scores[student.id]?.[component.code] ?? ""} onChange={(event) => updateScore(student.id, component.code, event.target.value)} aria-label={`${student.name} ${component.code}`} className="h-9 w-16 rounded-md border text-center outline-none focus:border-[#0756D9]" /></td>)}</tr>) : <tr><td colSpan={data.components.length + 1} className="py-14 text-center text-[#697184]">Belum ada siswa di kelas ini.</td></tr>}</tbody></table></div></section> : <section className="mt-5 rounded-xl border bg-white p-14 text-center text-[#697184]">{state === "loading" ? <LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#0756D9]" /> : "Pilih kelas dan mata pelajaran, lalu klik Tampilkan."}</section>}
    <ConfirmDialog open={deleteOpen} onClose={() => !deleting && setDeleteOpen(false)} title="Hapus Seluruh Nilai?" description={data ? `Semua nilai ${data.subject.name} untuk kelas terpilih akan dihapus permanen. Struktur siswa dan komponen tetap tersedia.` : ""} confirmLabel="Hapus Nilai" onConfirm={removeGrades} loading={deleting} error={deleteError} />
    <Toast toast={toast} onClose={() => setToast(null)} />
  </main>;
}
