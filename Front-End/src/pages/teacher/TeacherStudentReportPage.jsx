import { ArrowLeft, CalendarCheck, Download, RefreshCw, Save, ShieldCheck, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import {
  downloadHomeroomStudentReport,
  finalizeHomeroomStudentReport,
  generateHomeroomReportNoteDraft,
  getHomeroomStudentReport,
  saveHomeroomReportNote,
} from "../../services/homeroomService";

const REPORT_NOTE_MAX_LENGTH = 2000;

export default function TeacherStudentReportPage() {
  const { studentId } = useParams();
  const [state, setState] = useState("loading");
  const [report, setReport] = useState(null);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [action, setAction] = useState("");
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [actionError, setActionError] = useState("");
  const [toast, setToast] = useState(null);

  const load = async () => {
    setState("loading");
    try {
      const data = await getHomeroomStudentReport(studentId);
      setReport(data); setNote(data.general_note || ""); setSavedNote(data.general_note || ""); setState("loaded");
    } catch { setState("error"); }
  };
  useEffect(() => { load(); }, [studentId]);

  const finalized = report?.status === "Finalized" || report?.status === "Distributed";
  const completeSubjects = useMemo(
    () => (report?.subjects || []).filter((item) => item.final_score != null && Number(item.recorded_components) === 8 && Number(item.missing_count) === 0),
    [report],
  );
  const incomplete = completeSubjects.length !== (report?.subjects || []).length;

  const saveNote = async () => {
    if (note.length > REPORT_NOTE_MAX_LENGTH) {
      setToast({ type: "error", message: `Catatan maksimal ${REPORT_NOTE_MAX_LENGTH.toLocaleString("id-ID")} karakter.` });
      return;
    }
    setAction("save");
    try {
      const updated = await saveHomeroomReportNote(studentId, note.trim());
      setReport((current) => ({ ...current, general_note: updated.general_note }));
      setSavedNote(updated.general_note || ""); setNote(updated.general_note || "");
      setToast({ type: "success", message: "Catatan rapor berhasil disimpan." });
    } catch (error) { setToast({ type: "error", message: error.message || "Catatan gagal disimpan." }); }
    finally { setAction(""); }
  };

  const makeLocalDraft = () => {
    const strongSubjects = completeSubjects.filter((item) => Number(item.final_score) >= Number(item.kkm)).map((item) => item.name);
    return `${report.student_name} menunjukkan perkembangan belajar yang ${report.average_score >= 80 ? "sangat baik" : "baik"}. ${strongSubjects.length ? `Capaian menonjol terlihat pada ${strongSubjects.join(", ")}. ` : ""}Kehadiran tercatat ${report.attendance.attended} dari ${report.attendance.total} pertemuan. Pertahankan konsistensi belajar dan tingkatkan materi yang masih perlu diperkuat.`;
  };

  const makeDraft = async () => {
    setAction("draft");
    try {
      const draft = await generateHomeroomReportNoteDraft(studentId);
      setNote(String(draft.note || "").slice(0, REPORT_NOTE_MAX_LENGTH));
      setToast({ type: "success", message: "Draf AI berdasarkan nilai dan kehadiran berhasil dibuat. Silakan ditinjau sebelum disimpan." });
    } catch {
      setNote(makeLocalDraft().slice(0, REPORT_NOTE_MAX_LENGTH));
      setToast({ type: "error", message: "Layanan AI belum tersedia. Draf cadangan berdasarkan nilai dan kehadiran telah dibuat." });
    } finally {
      setAction("");
    }
  };

  const finalize = async () => {
    setAction("finalize"); setActionError("");
    try { await finalizeHomeroomStudentReport(studentId); setFinalizeOpen(false); await load(); setToast({ type: "success", message: "Rapor berhasil difinalisasi." }); }
    catch (error) { setActionError(error.message || "Rapor belum dapat difinalisasi."); }
    finally { setAction(""); }
  };

  const download = async () => {
    setAction("download");
    try {
      const blob = await downloadHomeroomStudentReport(studentId);
      const url = URL.createObjectURL(blob); const anchor = document.createElement("a");
      anchor.href = url; anchor.download = `rapor-${report.nis || studentId}.pdf`; anchor.click(); URL.revokeObjectURL(url);
      setToast({ type: "success", message: "Rapor PDF berhasil diunduh." });
    } catch (error) { setToast({ type: "error", message: error.message || "Rapor belum dapat diunduh." }); }
    finally { setAction(""); }
  };

  if (state === "loading") return <div className="flex min-h-[55vh] items-center justify-center"><Spinner className="h-9 w-9 text-[#0756D9]" /></div>;
  if (state === "error") return <div className="px-5 py-14"><section className="mx-auto max-w-md rounded-xl border bg-white p-8 text-center"><h1 className="text-xl font-bold">Rapor tidak dapat dimuat</h1><p className="mt-2 text-sm text-[#697184]">Rapor belum dibuat atau akun ini bukan wali kelas siswa tersebut.</p><Button onClick={load} className="mt-5"><RefreshCw className="h-4 w-4" /> Coba Lagi</Button></section></div>;

  return <main className="px-4 py-8 sm:px-7 lg:px-10"><div className="mx-auto max-w-[1120px]">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-start gap-3"><Link to="/teacher/reports" className="mt-1 rounded p-2 text-[#697184] hover:bg-white"><ArrowLeft className="h-5 w-5" /></Link><div><h1 className="text-2xl font-bold text-[#20232D]">{report.student_name}</h1><p className="mt-1 text-sm text-[#697184]">{report.class_name} · Rapor Semester</p></div></div><div className="flex flex-wrap gap-2"><span className={`inline-flex items-center rounded-full px-3 text-xs font-semibold ${finalized ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>{finalized ? report.status : "Belum Difinalisasi"}</span><Button onClick={() => { setFinalizeOpen(true); setActionError(""); }} disabled={finalized || incomplete} className="bg-amber-500 hover:bg-amber-600"><ShieldCheck className="h-4 w-4" /> Finalisasi Rapor</Button><Button variant="secondary" onClick={download} loading={action === "download"}><Download className="h-4 w-4" /> Download PDF</Button></div></header>

    {incomplete && <p className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">Finalisasi terkunci karena masih ada nilai mata pelajaran yang belum lengkap.</p>}
    <section className="mt-7 grid gap-4 lg:grid-cols-[0.65fr_1.35fr]"><div className="space-y-4"><article className="rounded-2xl border bg-white p-6"><p className="text-xs font-semibold uppercase text-[#697184]">Rata-rata Nilai</p><p className="mt-7 text-5xl font-medium text-[#0756D9]">{report.average_score ?? "–"}</p></article><article className="rounded-2xl border bg-white p-6"><div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase text-[#697184]">Kehadiran</p><CalendarCheck className="h-5 w-5 text-emerald-500" /></div><p className="mt-7 text-4xl">{report.attendance_percentage}%</p><div className="mt-3 h-1.5 rounded-full bg-slate-200"><div className="h-full rounded-full bg-emerald-500" style={{ width: `${report.attendance_percentage}%` }} /></div></article></div><article className="rounded-2xl border bg-white p-6"><h2 className="font-bold">Rangkuman Nilai Mapel</h2><div className="mt-5 divide-y">{report.subjects.map((subject) => <div key={subject.id} className="flex justify-between py-4 text-sm"><span>{subject.name}</span><span className={subject.final_score == null ? "text-amber-600" : "font-semibold text-[#0756D9]"}>{subject.final_score ?? "Belum lengkap"}</span></div>)}</div></article></section>

    <section className="mt-6 overflow-hidden rounded-2xl border bg-white"><div className="h-1 bg-gradient-to-r from-violet-500 to-blue-500" /><div className="p-6"><div className="flex items-start justify-between"><div><h2 className="font-bold">Catatan Rapor</h2><p id="report-note-help" className="mt-1 text-xs text-[#697184]">Draf AI menggunakan nilai dan kehadiran siswa. Maksimal 2.000 karakter dan tetap perlu ditinjau wali kelas.</p></div>{!finalized && <button type="button" onClick={makeDraft} disabled={Boolean(action)} className="inline-flex items-center gap-1 text-xs font-semibold text-violet-600 disabled:cursor-not-allowed disabled:opacity-50"><Sparkles className={`h-4 w-4 ${action === "draft" ? "animate-pulse" : ""}`} /> {action === "draft" ? "Membuat Draf AI..." : "Buat Draf AI"}</button>}</div><textarea aria-describedby="report-note-help report-note-counter" rows={7} maxLength={REPORT_NOTE_MAX_LENGTH} value={note} onChange={(event) => setNote(event.target.value)} disabled={finalized} className="mt-5 w-full resize-none rounded-xl border bg-[#FBFCFF] p-4 text-sm leading-6 outline-none focus:border-[#0756D9] disabled:bg-slate-50" /><div id="report-note-counter" className={`mt-2 text-right text-xs font-medium ${note.length >= REPORT_NOTE_MAX_LENGTH ? "text-red-600" : note.length >= REPORT_NOTE_MAX_LENGTH * 0.9 ? "text-amber-600" : "text-[#697184]"}`}>{note.length.toLocaleString("id-ID")} / {REPORT_NOTE_MAX_LENGTH.toLocaleString("id-ID")} karakter</div><div className="mt-4 flex justify-end gap-3">{!finalized && <><Button variant="secondary" onClick={() => setNote(savedNote)} disabled={note === savedNote || Boolean(action)}>Batalkan Perubahan</Button><Button onClick={saveNote} loading={action === "save"} disabled={note === savedNote || note.length > REPORT_NOTE_MAX_LENGTH || Boolean(action)}><Save className="h-4 w-4" /> Simpan Catatan Rapor</Button></>}</div></div></section>
  </div><ConfirmDialog open={finalizeOpen} onClose={() => action !== "finalize" && setFinalizeOpen(false)} title="Finalisasi Rapor?" description="Setelah finalisasi, catatan terkunci dan rapor dapat diunduh. Periksa kembali seluruh nilai dan catatan." confirmLabel="Finalisasi" confirmVariant="primary" onConfirm={finalize} loading={action === "finalize"} error={actionError} /><Toast toast={toast} onClose={() => setToast(null)} /></main>;
}
