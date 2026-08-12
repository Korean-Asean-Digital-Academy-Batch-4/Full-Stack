import { Search } from "lucide-react";
import Select from "../ui/Select";

function FilterField({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 px-1 text-[11px] font-medium text-[#4B5060]">{label}</p>
      {children}
    </div>
  );
}

export default function GradeFilters({ filters, onChange, onShow, loading, assignments = [] }) {
  const selectedAssignment = assignments.find(
    (item) => (item.classId || item.id) === filters.classId && item.subjectId === filters.subjectId,
  ) || assignments[0];
  const subjects = Array.from(
    new Map(assignments.map((item) => [item.subjectId, { id: item.subjectId, name: item.subjectName }])).values(),
  );
  const classes = assignments.filter((item) => item.subjectId === selectedAssignment?.subjectId);
  const keepAssignedOption = () => {};

  const selectAssignment = (assignment) => {
    if (!assignment) return;
    onChange({
      classId: assignment.classId || assignment.id,
      subjectId: assignment.subjectId,
      academicYear: assignment.academicYear,
      semester: String(assignment.semester).toUpperCase(),
    });
  };

  const changeSubject = (event) => {
    selectAssignment(assignments.find((item) => item.subjectId === event.target.value));
  };

  const changeClass = (event) => {
    selectAssignment(assignments.find(
      (item) => (item.classId || item.id) === event.target.value && item.subjectId === filters.subjectId,
    ));
  };

  const noAssignments = assignments.length === 0;

  return (
    <section className="mt-8 rounded-[14px] border border-[#E4E8F1] bg-white p-4 shadow-[0_2px_5px_rgba(30,42,75,0.04)]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(160px,0.9fr)_minmax(190px,1fr)_minmax(220px,1.3fr)_minmax(150px,0.8fr)_auto] xl:items-end [&_select]:text-xs">
        <FilterField label="Tahun Ajaran">
          <Select label="Tahun Ajaran" value={filters.academicYear} onChange={keepAssignedOption} disabled={loading || noAssignments}>
            <option value={selectedAssignment?.academicYear || ""}>{selectedAssignment?.academicYear || "Tidak ada penugasan"}</option>
          </Select>
        </FilterField>
        <FilterField label="Semester">
          <Select label="Semester" value={filters.semester} onChange={keepAssignedOption} disabled={loading || noAssignments}>
            <option value={filters.semester}>{selectedAssignment?.semester ? `Semester ${selectedAssignment.semester}` : "Tidak ada penugasan"}</option>
          </Select>
        </FilterField>
        <FilterField label="Pilih Mata Pelajaran">
          <Select label="Pilih Mata Pelajaran" value={filters.subjectId} onChange={changeSubject} disabled={loading || noAssignments}>
            {subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name}</option>)}
          </Select>
        </FilterField>
        <FilterField label="Pilih Kelas">
          <Select
            label="Pilih Kelas"
            value={filters.classId}
            onChange={changeClass}
            disabled={loading || noAssignments}
            className="[&_select]:border-blue-200 [&_select]:bg-blue-50 [&_select]:font-semibold [&_select]:text-[#0756D9]"
          >
            {classes.map((item) => (
              <option key={item.assignmentId || `${item.subjectId}:${item.classId || item.id}`} value={item.classId || item.id}>{item.name}</option>
            ))}
          </Select>
        </FilterField>
        <button
          type="button"
          onClick={onShow}
          disabled={loading || noAssignments}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2F67ED] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1451D2] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 xl:col-span-1"
        >
          <Search aria-hidden="true" className="h-4 w-4" /> Tampilkan
        </button>
      </div>
    </section>
  );
}
