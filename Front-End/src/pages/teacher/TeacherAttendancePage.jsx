import { CircleAlert, PencilLine, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import AttendanceEmptyState from "../../components/attendance/AttendanceEmptyState";
import AttendanceFilters from "../../components/attendance/AttendanceFilters";
import AttendanceTable from "../../components/attendance/AttendanceTable";
import SaveAttendanceButton from "../../components/attendance/SaveAttendanceButton";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import {
  downloadAttendanceCsv,
  getAttendance,
  saveAttendance,
  updateAttendance,
} from "../../services/attendanceService";
import { toIsoDate } from "../../utils/dateFormatter";
import { getTeacherClasses } from "../../services/teacherService";
import { getStoredUser } from "../../stores/authStore";

export default function TeacherAttendancePage() {
  const [filters, setFilters] = useState({
    classId: "",
    subjectId: "",
    date: toIsoDate(),
  });
  const [assignments, setAssignments] = useState([]);
  const [data, setData] = useState(null);
  const [statuses, setStatuses] = useState({});
  const [originalStatuses, setOriginalStatuses] = useState({});
  const [state, setState] = useState("initial");
  const [saved, setSaved] = useState(false);
  const [dirty, setDirty] = useState(false);
  const [toast, setToast] = useState(null);
  const [correctionOpen, setCorrectionOpen] = useState(false);
  const [correctionReason, setCorrectionReason] = useState("");
  const [correctionError, setCorrectionError] = useState("");
  const [correctionMode, setCorrectionMode] = useState(false);

  const loading = state === "loading";
  const saving = state === "saving";
  const loaded = Boolean(data) && !loading && state !== "error";

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timeout);
  }, [toast]);

  const selectedAssignment = useMemo(
    () => assignments.find((item) => item.id === filters.classId) || assignments[0],
    [assignments, filters.classId],
  );

  useEffect(() => {
    getTeacherClasses().then((items) => {
      if (!items.length) return;
      setAssignments(items);
      const first = items[0];
      setFilters((current) => ({ ...current, classId: first.id, subjectId: first.subjectId }));
    }).catch(() => {});
  }, []);

  const changeFilters = (nextFilters) => {
    setFilters(nextFilters);
    setData(null);
    setStatuses({});
    setState("initial");
    setSaved(false);
    setDirty(false);
    setCorrectionMode(false);
  };

  const handleSearch = async () => {
    setState("loading");
    setToast(null);
    try {
      const result = await getAttendance(filters);
      const nextStatuses = Object.fromEntries(
        result.students.map((student) => [student.id, student.currentStatus]),
      );
      setData(result);
      setStatuses(nextStatuses);
      setOriginalStatuses(nextStatuses);
      setSaved(Boolean(result.savedRecord));
      setDirty(false);
      setCorrectionMode(false);
      setState(result.students.length ? "loaded" : "empty");
    } catch {
      setData(null);
      setState("error");
    }
  };

  const handleStatusChange = (studentId, status) => {
    setStatuses((current) => ({ ...current, [studentId]: status }));
    setDirty(true);
  };

  const focusFirstIncomplete = (studentId) => {
    const selector = document.querySelector(`[data-student-id="${studentId}"] button`);
    selector?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    selector?.focus({ preventScroll: true });
  };

  const handleSave = async () => {
    const incomplete = data.students.find((student) => statuses[student.id] === "NOT_RECORDED");
    if (incomplete) {
      setToast({ type: "error", message: "Lengkapi status presensi seluruh siswa sebelum menyimpan." });
      focusFirstIncomplete(incomplete.id);
      return;
    }

    setState("saving");
    const now = new Date().toISOString();
    const basePayload = {
      classId: filters.classId,
      subjectId: filters.subjectId,
      meetingNumber: 4,
      date: filters.date,
      savedAt: now,
      savedBy: getStoredUser()?.id,
      sessionId: data.savedRecord?.sessionId || null,
      records: data.students.map((student) => ({ studentId: student.id, status: statuses[student.id] })),
    };

    try {
      let savedRecord;
      if (correctionMode) {
        const changes = data.students
          .filter((student) => originalStatuses[student.id] !== statuses[student.id])
          .map((student) => ({
            studentId: student.id,
            oldStatus: originalStatuses[student.id],
            newStatus: statuses[student.id],
          }));
        savedRecord = await updateAttendance({
          ...basePayload,
          correctionHistory: [
            ...(data.savedRecord?.correctionHistory || []),
            {
              correctedBy: getStoredUser()?.id,
              correctedAt: now,
              reason: correctionReason,
              changes,
            },
          ],
        });
      } else {
        savedRecord = await saveAttendance(basePayload);
      }
      setData((current) => ({ ...current, savedRecord }));
      setOriginalStatuses(statuses);
      setSaved(true);
      setDirty(false);
      setCorrectionMode(false);
      setCorrectionReason("");
      setState("loaded");
      setToast({ type: "success", message: "Presensi kelas berhasil disimpan." });
    } catch {
      setState("loaded");
      setToast({ type: "error", message: "Presensi gagal disimpan. Silakan coba kembali." });
    }
  };

  const startCorrection = () => {
    if (correctionReason.trim().length < 5) {
      setCorrectionError("Alasan koreksi minimal 5 karakter.");
      return;
    }
    setCorrectionError("");
    setCorrectionOpen(false);
    setCorrectionMode(true);
    setSaved(false);
    setDirty(false);
  };

  const handleDownload = () => {
    const rows = data.students.map((student) => ({
      name: student.name,
      nis: student.nis,
      statuses: [...student.history, statuses[student.id]],
    }));
    const className = selectedAssignment.name.replaceAll(" ", "-");
    const subjectName = selectedAssignment.subjectName.toLowerCase().replaceAll(" ", "-");
    downloadAttendanceCsv(rows, `rekap-presensi-${className}-${subjectName}.csv`);
    setToast({ type: "success", message: "Rekap presensi berhasil diunduh." });
  };

  return (
    <div>
      <AttendanceFilters
        filters={filters}
        onChange={changeFilters}
        onSearch={handleSearch}
        onDownload={handleDownload}
        loaded={loaded}
        loading={loading || saving}
        assignments={assignments}
      />

      <div className="px-4 py-8 sm:px-6 lg:px-7">
        <div className="mx-auto max-w-[1100px]">
          {state === "initial" && (
            <div className="pt-14 sm:pt-20"><AttendanceEmptyState /></div>
          )}

          {loading && (
            <section role="status" className="mx-auto mt-16 flex max-w-md flex-col items-center rounded-2xl bg-white p-10 text-center shadow-soft">
              <Spinner className="h-8 w-8 text-[#0756D9]" />
              <p className="mt-4 text-sm font-medium text-[#545968]">Memuat daftar siswa...</p>
            </section>
          )}

          {state === "error" && (
            <section role="alert" className="mx-auto mt-16 max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-soft">
              <CircleAlert aria-hidden="true" className="mx-auto h-10 w-10 text-red-500" />
              <h2 className="mt-4 text-xl font-bold">Data presensi gagal dimuat</h2>
              <p className="mt-2 text-sm text-[#545968]">Periksa kembali filter dan coba muat ulang data.</p>
              <Button onClick={handleSearch} className="mt-6">
                <RefreshCw aria-hidden="true" className="h-4 w-4" /> Coba Lagi
              </Button>
            </section>
          )}

          {state === "empty" && <div className="pt-14"><AttendanceEmptyState noStudents /></div>}

          {loaded && data.students.length > 0 && (
            <>
              <h1 className="mb-6 text-2xl font-bold tracking-[-0.035em] text-[#20232D]">Lembar Presensi Siswa</h1>
              <AttendanceTable
                data={data}
                statuses={statuses}
                onStatusChange={handleStatusChange}
                saved={saved}
                disabled={saving}
              />
              <div className="mt-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center sm:justify-end">
                {saved && (
                  <button
                    type="button"
                    onClick={() => setCorrectionOpen(true)}
                    className="inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold text-[#0756D9] hover:bg-blue-50"
                  >
                    <PencilLine aria-hidden="true" className="h-4 w-4" /> Edit Presensi
                  </button>
                )}
                <SaveAttendanceButton
                  saved={saved}
                  saving={saving}
                  disabled={!dirty || saving}
                  onSave={handleSave}
                />
              </div>
            </>
          )}
        </div>
      </div>

      <Modal
        open={correctionOpen}
        onClose={() => {
          setCorrectionOpen(false);
          setCorrectionError("");
        }}
        title="Koreksi Presensi"
        description="Jelaskan alasan perubahan sebelum mengedit status presensi yang sudah tersimpan."
      >
        <label htmlFor="correction-reason" className="text-sm font-semibold text-[#20232D]">Alasan koreksi</label>
        <textarea
          id="correction-reason"
          rows={3}
          value={correctionReason}
          onChange={(event) => {
            setCorrectionReason(event.target.value);
            setCorrectionError("");
          }}
          aria-invalid={Boolean(correctionError)}
          aria-describedby={correctionError ? "correction-error" : undefined}
          className="mt-2 w-full resize-none rounded-lg border border-[#DDE1EA] p-3 text-sm focus:border-[#2F67ED] focus:outline-none focus:ring-2 focus:ring-blue-100"
          placeholder="Contoh: Koreksi berdasarkan surat izin orang tua"
        />
        {correctionError && <p id="correction-error" className="mt-1.5 text-xs text-red-600">{correctionError}</p>}
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setCorrectionOpen(false)}>Batal</Button>
          <Button onClick={startCorrection}>Lanjut Edit</Button>
        </div>
      </Modal>

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
