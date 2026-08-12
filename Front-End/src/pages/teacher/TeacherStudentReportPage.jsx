import { RefreshCw, Sparkles } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useBlocker, useParams, useSearchParams } from "react-router-dom";
import AttendanceSummaryCard from "../../components/reports/AttendanceSummaryCard";
import FinalizeConfirmationModal from "../../components/reports/FinalizeConfirmationModal";
import FinalizeReportButton from "../../components/reports/FinalizeReportButton";
import ReportDownloadButton from "../../components/reports/ReportDownloadButton";
import ReportFinalizedBanner from "../../components/reports/ReportFinalizedBanner";
import ReportIncompleteAlert from "../../components/reports/ReportIncompleteAlert";
import ReportNoteEditor from "../../components/reports/ReportNoteEditor";
import ReportNoteReadOnly from "../../components/reports/ReportNoteReadOnly";
import ReportNoteUnsavedModal from "../../components/reports/ReportNoteUnsavedModal";
import ReportSummaryCard from "../../components/reports/ReportSummaryCard";
import StudentReportHeader from "../../components/reports/StudentReportHeader";
import SubjectScoreSummary from "../../components/reports/SubjectScoreSummary";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { REPORT_STATUSES } from "../../data/reportData";
import {
  downloadSubjectReport,
  finalizeSubjectReport,
  getStudentReport,
  saveReportNote,
} from "../../services/reportService";
import { getStoredUser } from "../../stores/authStore";
import { validateSubjectFinalization } from "../../utils/reportValidation";

function finalizedMetadata(report) {
  if (!report.finalizedAt) return "";
  const date = new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(report.finalizedAt));
  return `Difinalisasi oleh ${getStoredUser()?.name || "Wali Kelas"} pada ${date}.`;
}

export default function TeacherStudentReportPage() {
  const { studentId } = useParams();
  const [searchParams] = useSearchParams();
  const assignmentId = searchParams.get("assignment") || "ASN-001";
  const [pageState, setPageState] = useState("loading");
  const [data, setData] = useState(null);
  const [note, setNote] = useState("");
  const [savedNote, setSavedNote] = useState("");
  const [noteDirty, setNoteDirty] = useState(false);
  const [aiDraft, setAiDraft] = useState(false);
  const [savingNote, setSavingNote] = useState(false);
  const [finalizeOpen, setFinalizeOpen] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [downloading, setDownloading] = useState(false);
  const [unsavedOpen, setUnsavedOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState(null);
  const [toast, setToast] = useState(null);
  const blocker = useBlocker(noteDirty);

  const report = data?.report;
  const finalized = report?.status === REPORT_STATUSES.FINALIZED_SUBJECT;
  const finalizationProblems = useMemo(() => validateSubjectFinalization(report), [report]);

  const load = async () => {
    setPageState("loading");
    try {
      const result = await getStudentReport(studentId, assignmentId);
      setData(result);
      setNote(result.report.note || "");
      setSavedNote(result.report.note || "");
      setNoteDirty(false);
      setAiDraft(false);
      setPageState("loaded");
    } catch {
      setPageState("error");
    }
  };

  useEffect(() => { load(); }, [assignmentId, studentId]);
  useEffect(() => {
    if (blocker.state === "blocked") {
      setPendingAction("navigate");
      setUnsavedOpen(true);
    }
  }, [blocker.state]);
  useEffect(() => {
    if (!noteDirty) return undefined;
    const beforeUnload = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [noteDirty]);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  const changeNote = (value) => {
    setNote(value);
    setNoteDirty(value !== savedNote);
    setAiDraft(false);
  };

  const completePendingAction = (action) => {
    setUnsavedOpen(false);
    setPendingAction(null);
    if (action === "navigate") blocker.proceed?.();
    else if (action === "finalize") setFinalizeOpen(true);
  };

  const saveNote = async (afterAction = null) => {
    setSavingNote(true);
    try {
      const updated = await saveReportNote({ studentId, assignmentId, note });
      setData((current) => ({ ...current, report: updated }));
      setSavedNote(updated.note);
      setNote(updated.note);
      setNoteDirty(false);
      setAiDraft(false);
      setToast({ type: "success", message: "Catatan rapor berhasil disimpan." });
      if (afterAction) completePendingAction(afterAction);
      else setUnsavedOpen(false);
    } catch {
      setToast({ type: "error", message: "Catatan rapor gagal disimpan. Silakan coba kembali." });
    } finally {
      setSavingNote(false);
    }
  };

  const discardChanges = () => {
    const action = pendingAction;
    setNote(savedNote);
    setNoteDirty(false);
    setAiDraft(false);
    completePendingAction(action);
  };

  const cancelNoteChanges = () => {
    if (!noteDirty) return;
    setPendingAction("cancel");
    setUnsavedOpen(true);
  };

  const requestFinalize = () => {
    if (noteDirty) {
      setPendingAction("finalize");
      setUnsavedOpen(true);
      return;
    }
    if (!finalizationProblems.length) setFinalizeOpen(true);
  };

  const confirmFinalize = async () => {
    setFinalizing(true);
    try {
      const updated = await finalizeSubjectReport({ studentId, assignmentId });
      setData((current) => ({ ...current, report: updated }));
      setFinalizeOpen(false);
      setToast({ type: "success", message: `Rapor ${data.student.name} berhasil difinalisasi.` });
    } catch {
      setToast({ type: "error", message: "Rapor gagal difinalisasi. Silakan periksa data kembali." });
    } finally {
      setFinalizing(false);
    }
  };

  const download = async () => {
    setDownloading(true);
    try {
      const fileName = await downloadSubjectReport({ report, student: data.student, assignment: data.assignment, preview: !finalized });
      setToast({ type: "success", message: `${fileName} berhasil dibuat.` });
    } catch {
      setToast({ type: "error", message: "PDF rapor gagal dibuat." });
    } finally {
      setDownloading(false);
    }
  };

  const makeAiDraft = () => {
    const next = `${data.student.name} memperoleh nilai akhir ${report.finalGrade} pada ${data.assignment.subjectName}. Kehadiran tercatat ${report.attendance.attended} dari ${report.attendance.total} pertemuan. Pertahankan capaian pada tugas dan ulangi materi yang masih perlu diperkuat berdasarkan hasil UTS. Draf ini perlu ditinjau Guru sebelum disimpan.`;
    setNote(next);
    setNoteDirty(next !== savedNote);
    setAiDraft(true);
  };

  if (pageState === "loading") return <div role="status" className="flex min-h-[55vh] items-center justify-center"><Spinner className="h-9 w-9 text-[#0756D9]" /><span className="sr-only">Memuat detail rapor</span></div>;
  if (pageState === "error") return <div className="px-4 py-12"><section role="alert" className="mx-auto max-w-md rounded-2xl bg-white p-8 text-center shadow-soft"><h1 className="text-xl font-bold">Rapor tidak dapat dimuat</h1><p className="mt-2 text-sm text-[#64748B]">Rapor belum dibuat atau Anda tidak memiliki akses.</p><Button onClick={load} className="mt-6"><RefreshCw aria-hidden="true" className="h-4 w-4" /> Coba Lagi</Button></section></div>;

  const headerActions = finalized ? (
    <ReportDownloadButton finalized onClick={download} loading={downloading} />
  ) : (
    <><FinalizeReportButton onClick={requestFinalize} disabled={finalizationProblems.length > 0 && !noteDirty} reason={finalizationProblems[0]} loading={finalizing} /><ReportDownloadButton finalized={false} onClick={download} loading={downloading} /></>
  );

  return (
    <div className="px-4 py-8 sm:px-7 lg:px-10"><div className="mx-auto max-w-[1120px]">
      <StudentReportHeader student={data.student} assignment={data.assignment} status={report.status} actions={headerActions} />
      <div className="mt-7 space-y-4">{finalized && <><ReportFinalizedBanner metadata={finalizedMetadata(report)} /><section className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-xs leading-5 text-amber-800">Perubahan setelah finalisasi harus diajukan melalui Administrator sekolah.</section></>}{!finalized && <ReportIncompleteAlert problems={finalizationProblems} />}</div>
      <section className="mt-7 grid gap-4 lg:grid-cols-[0.72fr_0.72fr_1.35fr]"><ReportSummaryCard value={report.finalGrade} /><AttendanceSummaryCard percentage={report.attendancePercentage} attendance={report.attendance} /><SubjectScoreSummary assignment={data.assignment} report={report} reportViewMode="subject" /></section>
      <div className="mt-5">{finalized ? <ReportNoteReadOnly note={report.note} metadata={finalizedMetadata(report)} /> : <ReportNoteEditor value={note} onChange={changeNote} onSave={() => saveNote()} onCancel={cancelNoteChanges} onAiDraft={makeAiDraft} saving={savingNote} dirty={noteDirty} aiDraft={aiDraft} />}</div>
      {!finalized && <section className="mt-5 rounded-xl border border-violet-100 bg-violet-50 p-4 text-xs leading-5 text-violet-700"><Sparkles aria-hidden="true" className="mr-2 inline h-4 w-4" />Draf AI hanya menyusun kalimat dari nilai, KKM, topik, dan presensi. Guru tetap wajib meninjau serta menyimpan catatan secara manual.</section>}
    </div>

      <FinalizeConfirmationModal open={finalizeOpen} studentName={data.student.name} ready={!finalizationProblems.length && !noteDirty} loading={finalizing} onClose={() => setFinalizeOpen(false)} onConfirm={confirmFinalize} />
      <ReportNoteUnsavedModal open={unsavedOpen} saving={savingNote} onClose={() => { setUnsavedOpen(false); setPendingAction(null); blocker.reset?.(); }} onDiscard={discardChanges} onSave={() => saveNote(pendingAction)} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
