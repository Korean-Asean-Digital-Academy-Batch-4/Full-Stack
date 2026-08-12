import { CircleAlert, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import BulkGenerateButton from "../../components/reports/BulkGenerateButton";
import GenerateProgressModal from "../../components/reports/GenerateProgressModal";
import GenerateSuccessModal from "../../components/reports/GenerateSuccessModal";
import ReportEmptyState from "../../components/reports/ReportEmptyState";
import ReportFilters from "../../components/reports/ReportFilters";
import ReportPageHeader from "../../components/reports/ReportPageHeader";
import ReportStudentTable from "../../components/reports/ReportStudentTable";
import Button from "../../components/ui/Button";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { REPORT_STATUSES } from "../../data/reportData";
import { teacherUser } from "../../data/teacherData";
import { generateAllReports, generateStudentReport, getReportStudents } from "../../services/reportService";
import { getStoredUser } from "../../stores/authStore";
import { canGenerateReport } from "../../utils/reportStatus";
import { getActiveHomeroomClassId } from "../../utils/teacherPermissions";

export default function TeacherReportsPage() {
  const homeroomClassId = getActiveHomeroomClassId(getStoredUser());
  const assignments = useMemo(
    () => teacherUser.assignedClasses.filter((item) => item.id === homeroomClassId),
    [homeroomClassId],
  );
  const [filters, setFilters] = useState(() => {
    const assignment = assignments[0];
    return assignment ? {
      classId: assignment.id,
      subjectId: assignment.subjectId,
      academicYear: assignment.academicYear,
      semester: assignment.semester.toUpperCase(),
    } : { classId: homeroomClassId || "", subjectId: "", academicYear: "", semester: "" };
  });
  const [pageState, setPageState] = useState("initial");
  const [data, setData] = useState(null);
  const [generatingId, setGeneratingId] = useState(null);
  const [progress, setProgress] = useState(null);
  const [bulkResult, setBulkResult] = useState(null);
  const [toast, setToast] = useState(null);
  const controllerRef = useRef(null);

  useEffect(() => () => controllerRef.current?.abort(), []);
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timer);
  }, [toast]);

  const eligibleStudents = useMemo(
    () => (data?.students || []).filter((student) => student.finalGrade != null && canGenerateReport(student.reportStatus)),
    [data?.students],
  );

  const loadReports = async () => {
    setPageState("loading");
    try {
      const result = await getReportStudents(filters);
      setData(result);
      setPageState(result.students.length ? "loaded" : "empty");
    } catch {
      setPageState("error");
    }
  };

  const changeFilters = (next) => {
    setFilters(next);
    setData(null);
    setPageState("initial");
  };

  const generateOne = async (student) => {
    setGeneratingId(student.id);
    setData((current) => ({ ...current, students: current.students.map((item) => item.id === student.id ? { ...item, reportStatus: REPORT_STATUSES.GENERATING } : item) }));
    try {
      await generateStudentReport({ studentId: student.id, filters });
      const refreshed = await getReportStudents(filters);
      setData(refreshed);
      setToast({ type: "success", message: `Draft rapor ${student.name} berhasil dibuat.` });
    } catch {
      setData((current) => ({ ...current, students: current.students.map((item) => item.id === student.id ? { ...item, reportStatus: REPORT_STATUSES.ERROR } : item) }));
      setToast({ type: "error", message: `Draft rapor ${student.name} gagal dibuat. Silakan coba kembali.` });
    } finally {
      setGeneratingId(null);
    }
  };

  const generateBulk = async (ids = eligibleStudents.map((student) => student.id)) => {
    if (!ids.length) return;
    const controller = new AbortController();
    controllerRef.current = controller;
    setBulkResult(null);
    setProgress({ processed: 0, total: ids.length, completed: 0, failed: 0 });
    try {
      const result = await generateAllReports(
        { studentIds: ids, filters },
        { signal: controller.signal, onProgress: setProgress },
      );
      const refreshed = await getReportStudents(filters);
      setData(refreshed);
      setProgress(null);
      if (result.status === "CANCELLED") {
        setToast({ type: "success", message: "Proses dihentikan. Rapor yang telah selesai tetap tersimpan." });
      } else {
        setBulkResult(result);
      }
    } catch {
      setProgress(null);
      setToast({ type: "error", message: "Proses pembuatan semua rapor mengalami kendala." });
    } finally {
      controllerRef.current = null;
    }
  };

  const cancelBulk = () => controllerRef.current?.abort();
  const retryFailed = () => {
    const ids = bulkResult?.results.filter((item) => !item.success).map((item) => item.studentId) || [];
    setBulkResult(null);
    generateBulk(ids);
  };

  return (
    <div className="px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1120px]">
        <ReportPageHeader />
        <ReportFilters assignments={assignments} filters={filters} onChange={changeFilters} onShow={loadReports} loading={pageState === "loading" || Boolean(progress)} />

        {pageState === "initial" && <ReportEmptyState />}
        {pageState === "loading" && <section role="status" className="mx-auto mt-20 flex max-w-md flex-col items-center rounded-2xl bg-white p-10 shadow-soft"><Spinner className="h-8 w-8 text-[#0756D9]" /><p className="mt-4 text-sm text-[#64748B]">Memuat daftar rapor...</p></section>}
        {pageState === "empty" && <ReportEmptyState noStudents />}
        {pageState === "error" && <section role="alert" className="mx-auto mt-16 max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-soft"><CircleAlert aria-hidden="true" className="mx-auto h-10 w-10 text-red-500" /><h2 className="mt-4 text-xl font-bold">Daftar rapor gagal dimuat</h2><p className="mt-2 text-sm text-[#64748B]">Periksa filter dan coba muat ulang data.</p><Button onClick={loadReports} className="mt-6"><RefreshCw aria-hidden="true" className="h-4 w-4" /> Coba Lagi</Button></section>}

        {pageState === "loaded" && data && (
          <section className="mt-7 overflow-hidden rounded-2xl border border-[#E4E8F1] bg-white shadow-soft">
            <div className="flex flex-col gap-2 border-b border-[#E8EBF2] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><div><h2 className="font-bold text-[#202838]">Daftar Status Rapor Siswa</h2><p className="mt-1 text-xs text-[#64748B]">{data.assignment.name} · {data.assignment.subjectName}</p></div><span className="text-xs text-[#64748B]">{data.students.length} siswa</span></div>
            <ReportStudentTable students={data.students} assignmentId={data.assignment.assignmentId} generatingId={generatingId} onGenerate={generateOne} />
            <footer className="flex flex-col gap-3 border-t border-[#E8EBF2] bg-[#FBFCFE] px-5 py-4 sm:flex-row sm:items-center sm:justify-between"><p className="max-w-xl text-xs leading-5 text-[#64748B]">Generate otomatis hanya mengompilasi nilai resmi, bobot, presensi, dan topik materi. Sistem tidak mengubah atau memfinalisasi nilai.</p><BulkGenerateButton disabled={!eligibleStudents.length || Boolean(progress)} onClick={() => generateBulk()} /></footer>
          </section>
        )}
      </div>

      <GenerateProgressModal open={Boolean(progress)} progress={progress || { processed: 0, total: 0 }} onCancel={cancelBulk} />
      <GenerateSuccessModal result={bulkResult} onClose={() => setBulkResult(null)} onRetry={retryFailed} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
