import { CircleAlert, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBlocker } from "react-router-dom";
import GradeEmptyState from "../../components/grades/GradeEmptyState";
import GradeFilters from "../../components/grades/GradeFilters";
import GradePageHeader from "../../components/grades/GradePageHeader";
import GradeTable from "../../components/grades/GradeTable";
import HomeroomInformation from "../../components/grades/HomeroomInformation";
import LearningTopicModal from "../../components/grades/LearningTopicModal";
import UnsavedChangesModal from "../../components/grades/UnsavedChangesModal";
import Button from "../../components/ui/Button";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { assessmentComponents } from "../../data/assessmentComponents";
import {
  GRADE_STATUSES,
  getGradeSheet,
  getLearningTopics,
  saveGrades,
  saveLearningTopics,
} from "../../services/gradeService";
import { getStoredUser } from "../../stores/authStore";
import { getTeacherClasses } from "../../services/teacherService";
import {
  hasIncompleteGrades,
  validateAssessmentWeights,
  validateGradeSheet,
  validateGradeValue,
} from "../../utils/gradeValidation";
import { getActiveTeachingAssignments, isActiveHomeroomTeacher } from "../../utils/teacherPermissions";

function filtersForAssignment(assignment) {
  return assignment ? {
    classId: assignment.classId || assignment.id,
    subjectId: assignment.subjectId,
    academicYear: assignment.academicYear,
    semester: String(assignment.semester).toUpperCase(),
  } : { classId: "", subjectId: "", academicYear: "", semester: "" };
}

function cloneGrades(grades) {
  return JSON.parse(JSON.stringify(grades));
}

export default function TeacherGradesPage() {
  const initialAssignments = getActiveTeachingAssignments(getStoredUser());
  const topicButtonRef = useRef(null);
  const [filters, setFilters] = useState(() => filtersForAssignment(initialAssignments[0]));
  const [assignments, setAssignments] = useState(initialAssignments);
  const [sheet, setSheet] = useState(null);
  const [savedGrades, setSavedGrades] = useState({});
  const [draftGrades, setDraftGrades] = useState({});
  const [topics, setTopics] = useState({});
  const [pageState, setPageState] = useState("initial");
  const [isEditing, setIsEditing] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [autosaveStatus, setAutosaveStatus] = useState("idle");
  const [errors, setErrors] = useState({});
  const [sortDirection, setSortDirection] = useState("asc");
  const [toast, setToast] = useState(null);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [incompleteOpen, setIncompleteOpen] = useState(false);
  const [topicsOpen, setTopicsOpen] = useState(false);

  const blocker = useBlocker(isDirty);
  const loading = pageState === "loading";
  const lockedStudentIds = useMemo(
    () => new Set(sheet?.lockedStudentIds || []),
    [sheet?.lockedStudentIds],
  );
  const allGradesLocked = Boolean(sheet?.students?.length) &&
    sheet.students.every((student) => lockedStudentIds.has(student.id));
  const editableGradesOnly = (grades) => Object.fromEntries(
    Object.entries(grades).filter(([studentId]) => !lockedStudentIds.has(studentId)),
  );

  const selectedAssignment = useMemo(
    () => assignments.find(
      (item) => (item.classId || item.id) === filters.classId && item.subjectId === filters.subjectId,
    ) || assignments[0],
    [assignments, filters.classId, filters.subjectId],
  );
  const activeComponents = sheet?.components?.length ? sheet.components : assessmentComponents;
  const activeTotalWeight = activeComponents.reduce((sum, component) => sum + Number(component.weight), 0);

  useEffect(() => {
    getTeacherClasses().then((items) => {
      if (!items.length) return;
      setAssignments(items);
      setFilters(filtersForAssignment(items[0]));
    }).catch(() => {});
  }, []);

  const sortedStudents = useMemo(() => {
    const students = [...(sheet?.students || [])];
    return students.sort((a, b) =>
      sortDirection === "asc"
        ? a.name.localeCompare(b.name, "id")
        : b.name.localeCompare(a.name, "id"),
    );
  }, [sheet?.students, sortDirection]);

  useEffect(() => {
    if (!toast) return undefined;
    const timeout = setTimeout(() => setToast(null), 4200);
    return () => clearTimeout(timeout);
  }, [toast]);

  useEffect(() => {
    if (!isDirty) return undefined;
    const warnBeforeUnload = (event) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    if (!isEditing) return undefined;
    const frame = requestAnimationFrame(() => {
      document.querySelector("[data-grade-input]")?.focus();
    });
    return () => cancelAnimationFrame(frame);
  }, [isEditing]);

  const handleFilterChange = (nextFilters) => {
    setFilters(nextFilters);
    setSheet(null);
    setSavedGrades({});
    setDraftGrades({});
    setPageState("initial");
    setIsEditing(false);
    setIsDirty(false);
    setErrors({});
  };

  const loadGradeSheet = async () => {
    setPageState("loading");
    setToast(null);
    try {
      if (activeTotalWeight !== 100 || !validateAssessmentWeights(activeComponents)) {
        throw new Error("INVALID_ASSESSMENT_WEIGHTS");
      }
      const result = await getGradeSheet(filters);
      const loadedTopics = await getLearningTopics(result.assignment.assignmentId, filters);
      const officialGrades = cloneGrades(result.grades);
      setSheet(result);
      setSavedGrades(officialGrades);
      setDraftGrades(cloneGrades(officialGrades));
      setTopics(loadedTopics);
      setIsEditing(false);
      setIsDirty(false);
      setAutosaveStatus("idle");
      setErrors({});
      setPageState(result.students.length ? "loaded" : "empty");
    } catch {
      setSheet(null);
      setPageState("error");
    }
  };

  const startEditing = () => {
    if (allGradesLocked) {
      setToast({ type: "error", message: "Nilai tidak dapat diedit karena seluruh rapor telah difinalisasi." });
      return;
    }
    setDraftGrades(cloneGrades(savedGrades));
    setIsDirty(false);
    setErrors({});
    setAutosaveStatus("idle");
    setIsEditing(true);
  };

  const handleGradeChange = (studentId, componentId, rawValue) => {
    if (lockedStudentIds.has(studentId)) {
      setToast({ type: "error", message: "Nilai tidak dapat diedit karena rapor telah difinalisasi." });
      return;
    }
    const nextValue = rawValue === "" ? null : Number(rawValue);
    const nextGrades = {
      ...draftGrades,
      [studentId]: {
        ...draftGrades[studentId],
        [componentId]: nextValue,
      },
    };
    setDraftGrades(nextGrades);
    setErrors((current) => ({
      ...current,
      [`${studentId}:${componentId}`]: validateGradeValue(nextValue),
    }));
    setIsDirty(JSON.stringify(nextGrades) !== JSON.stringify(savedGrades));
    setAutosaveStatus("idle");
  };

  const discardEdits = () => {
    setDraftGrades(cloneGrades(savedGrades));
    setIsEditing(false);
    setIsDirty(false);
    setErrors({});
    setAutosaveStatus("idle");
    setCancelOpen(false);
  };

  const cancelEditing = () => {
    if (isDirty) setCancelOpen(true);
    else discardEdits();
  };

  const focusFirstInvalid = (validationErrors) => {
    const firstKey = Object.keys(validationErrors)[0];
    if (!firstKey) return;
    const input = document.querySelector(`[data-grade-input="${firstKey}"]`);
    input?.scrollIntoView({ behavior: "smooth", block: "center", inline: "center" });
    input?.focus({ preventScroll: true });
  };

  const persistGrades = async (incomplete) => {
    setIncompleteOpen(false);
    setIsSaving(true);
    try {
      const result = await saveGrades({
        ...filters,
        assignmentId: sheet.assignment.assignmentId,
        grades: editableGradesOnly(draftGrades),
        status: GRADE_STATUSES.DRAFT,
        incomplete,
      });
      const officialGrades = cloneGrades(result.data.grades);
      setSavedGrades(officialGrades);
      setDraftGrades(cloneGrades(officialGrades));
      setSheet((current) => ({
        ...current,
        grades: officialGrades,
        status: result.data.status,
        savedAt: result.savedAt,
      }));
      setIsEditing(false);
      setIsDirty(false);
      setErrors({});
      setAutosaveStatus("idle");
      setToast({ type: "success", message: "Perubahan nilai berhasil disimpan." });
    } catch {
      setToast({ type: "error", message: "Perubahan nilai gagal disimpan. Silakan coba kembali." });
    } finally {
      setIsSaving(false);
    }
  };

  const requestSave = () => {
    const editableStudents = sheet.students.filter((student) => !lockedStudentIds.has(student.id));
    const validationErrors = validateGradeSheet(draftGrades, editableStudents, activeComponents);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length) {
      setToast({ type: "error", message: "Periksa kembali nilai yang berada di luar rentang 0–100." });
      focusFirstInvalid(validationErrors);
      return;
    }
    const incomplete = hasIncompleteGrades(draftGrades, editableStudents, activeComponents);
    if (incomplete) {
      setIncompleteOpen(true);
      return;
    }
    persistGrades(false);
  };

  const saveTopics = async (nextTopics) => {
    try {
      await saveLearningTopics({
        assignmentId: sheet.assignment.assignmentId,
        ...filters,
        topics: nextTopics,
      });
      setTopics(nextTopics);
      setToast({ type: "success", message: "Topik materi berhasil disimpan." });
    } catch (error) {
      setToast({ type: "error", message: "Topik materi gagal disimpan. Silakan coba kembali." });
      throw error;
    }
  };

  return (
    <div className="px-4 py-8 sm:px-7 lg:px-6 xl:px-10">
      <div className="mx-auto max-w-[1100px]">
        <GradePageHeader />
        <div id="grade-filter-section">
          <GradeFilters
            filters={filters}
            onChange={handleFilterChange}
            onShow={loadGradeSheet}
            loading={loading || isEditing || isSaving}
            assignments={assignments}
          />
        </div>

        {pageState === "initial" && <GradeEmptyState />}

        {pageState === "loading" && (
          <section role="status" className="mx-auto mt-20 flex max-w-md flex-col items-center rounded-2xl bg-white p-10 shadow-soft">
            <Spinner className="h-8 w-8 text-[#2F67ED]" />
            <p className="mt-4 text-sm font-medium text-[#64748B]">Memuat lembar nilai...</p>
          </section>
        )}

        {pageState === "error" && (
          <section role="alert" className="mx-auto mt-16 max-w-md rounded-2xl border border-red-100 bg-white p-8 text-center shadow-soft">
            <CircleAlert aria-hidden="true" className="mx-auto h-10 w-10 text-red-500" />
            <h2 className="mt-4 text-xl font-bold">Data nilai gagal dimuat</h2>
            <p className="mt-2 text-sm text-[#64748B]">Periksa kembali filter dan coba muat ulang data.</p>
            <Button onClick={loadGradeSheet} className="mt-6">
              <RefreshCw aria-hidden="true" className="h-4 w-4" /> Coba Lagi
            </Button>
          </section>
        )}

        {pageState === "empty" && <GradeEmptyState noStudents />}

        {pageState === "loaded" && sheet && <>
          {lockedStudentIds.size > 0 && (
            <section role="status" className="mt-7 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
              <p className="font-semibold">{allGradesLocked ? "Rapor telah difinalisasi. Nilai tidak dapat diedit." : "Sebagian rapor siswa telah difinalisasi."}</p>
              <p className="mt-1 text-xs">Nilai dikunci setelah rapor siswa difinalisasi oleh wali kelas.</p>
            </section>
          )}
          <GradeTable
            students={sortedStudents}
            components={activeComponents}
            grades={isEditing ? draftGrades : savedGrades}
            errors={errors}
            kkm={selectedAssignment?.kkm ?? 75}
            isEditing={isEditing}
            isSaving={isSaving}
            isDirty={isDirty}
            autosaveStatus={autosaveStatus}
            locked={allGradesLocked}
            lockedStudentIds={[...lockedStudentIds]}
            sortDirection={sortDirection}
            onSort={() => setSortDirection((current) => (current === "asc" ? "desc" : "asc"))}
            onGradeChange={handleGradeChange}
            onEdit={startEditing}
            onCancel={cancelEditing}
            onSave={requestSave}
            onOpenTopics={() => setTopicsOpen(true)}
            topicButtonRef={topicButtonRef}
          />
        </>}

        {isActiveHomeroomTeacher(getStoredUser()) && selectedAssignment && (
          <HomeroomInformation className={selectedAssignment.name} />
        )}
      </div>

      <LearningTopicModal
        open={topicsOpen}
        topics={topics}
        onClose={() => setTopicsOpen(false)}
        onSave={saveTopics}
      />

      <UnsavedChangesModal
        open={cancelOpen}
        onStay={() => setCancelOpen(false)}
        onDiscard={discardEdits}
      />

      <UnsavedChangesModal
        open={blocker.state === "blocked"}
        onStay={() => blocker.reset?.()}
        onDiscard={() => {
          setIsDirty(false);
          blocker.proceed?.();
        }}
        title="Tinggalkan halaman?"
        description="Perubahan nilai yang belum disimpan akan hilang jika Anda meninggalkan halaman ini."
      />

      <ConfirmDialog
        open={incompleteOpen}
        onClose={() => setIncompleteOpen(false)}
        title="Sebagian nilai belum lengkap"
        description="Sebagian nilai belum lengkap. Data akan disimpan sebagai draft."
        cancelLabel="Kembali Mengedit"
        confirmLabel="Simpan sebagai Draft"
        onConfirm={() => persistGrades(true)}
        confirmVariant="primary"
      />

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
