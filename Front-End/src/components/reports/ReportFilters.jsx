import { Search } from "lucide-react";
import Select from "../ui/Select";

export default function ReportFilters({ assignments, filters, onChange, onShow, loading }) {
  const selected = assignments.find((item) => item.id === filters.classId) || assignments[0];
  const changeClass = (event) => {
    const assignment = assignments.find((item) => item.id === event.target.value);
    onChange({
      classId: assignment.id,
      subjectId: assignment.subjectId,
      academicYear: assignment.academicYear,
      semester: assignment.semester.toUpperCase(),
    });
  };
  const keepAssignedOption = () => {};

  return (
    <section aria-label="Filter rapor" className="mt-7 rounded-[14px] border border-[#E4E8F1] bg-white p-4 shadow-[0_2px_8px_rgba(30,42,75,0.05)]">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(160px,0.85fr)_minmax(220px,1.25fr)_minmax(200px,1fr)_minmax(180px,0.9fr)_auto] xl:items-end">
        <Select label="Kelas" value={filters.classId} onChange={changeClass} disabled={loading || assignments.length === 1}>
          {assignments.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
        </Select>
        <Select label="Mata Pelajaran" value={filters.subjectId} onChange={keepAssignedOption} disabled={loading}>
          <option value={selected?.subjectId}>{selected?.subjectName}</option>
        </Select>
        <Select label="Semester" value={filters.semester} onChange={keepAssignedOption} disabled={loading}>
          <option value={filters.semester}>{`Semester ${filters.semester ? filters.semester[0] + filters.semester.slice(1).toLowerCase() : "-"}`}</option>
        </Select>
        <Select label="Tahun Ajaran" value={filters.academicYear} onChange={keepAssignedOption} disabled={loading}>
          <option value={filters.academicYear}>{filters.academicYear || "-"}</option>
        </Select>
        <button
          type="button"
          aria-label="Tampilkan daftar rapor"
          title="Tampilkan daftar rapor"
          onClick={onShow}
          disabled={loading}
          className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#0756D9] text-white shadow-sm transition hover:bg-[#0648B8] disabled:opacity-60 sm:col-span-2 xl:col-span-1 xl:w-10"
        >
          <Search aria-hidden="true" className="h-5 w-5" />
          <span className="ml-2 xl:sr-only">Tampilkan daftar rapor</span>
        </button>
      </div>
    </section>
  );
}
