import { Download, Search } from "lucide-react";
import DatePicker from "../ui/DatePicker";
import Select from "../ui/Select";

export default function AttendanceFilters({ filters, onChange, onSearch, onDownload, loaded, loading, assignments = [] }) {
  const selectedAssignment = assignments.find((item) => item.id === filters.classId) || assignments[0];

  const changeClass = (event) => {
    const assignment = assignments.find((item) => item.id === event.target.value);
    if (assignment) onChange({ ...filters, classId: assignment.id, subjectId: assignment.subjectId });
  };

  return (
    <section className="border-b border-[#E5E8F0] bg-white px-4 py-4 sm:px-6">
      <div className="ml-auto grid max-w-[860px] grid-cols-1 gap-3 sm:grid-cols-2 xl:flex xl:items-center xl:justify-end">
        <Select label="Kelas" value={filters.classId} onChange={changeClass} disabled={loading || !assignments.length} className="xl:w-[160px] xl:shrink-0">
          {assignments.map((item) => (
            <option key={item.id} value={item.id}>{item.name}</option>
          ))}
        </Select>
        <Select
          label="Mata pelajaran"
          value={filters.subjectId}
          onChange={(event) => onChange({ ...filters, subjectId: event.target.value })}
          disabled={loading || !assignments.length}
          className="xl:w-[220px] xl:shrink-0"
        >
          {selectedAssignment ? <option value={selectedAssignment.subjectId}>{selectedAssignment.subjectName}</option> : <option value="">Belum ada penugasan</option>}
        </Select>
        <DatePicker
          value={filters.date}
          onChange={(event) => onChange({ ...filters, date: event.target.value })}
          disabled={loading || !assignments.length}
        />
        <button
          type="button"
          onClick={onSearch}
          disabled={loading || !assignments.length}
          aria-label="Tampilkan presensi"
          className="flex h-10 items-center justify-center rounded-lg bg-[#0756D9] px-3 text-white shadow-sm transition hover:bg-[#0648B8] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-1 xl:w-10 xl:shrink-0 xl:px-0"
        >
          <Search aria-hidden="true" className="h-5 w-5" />
          <span className="ml-2 text-sm font-semibold xl:sr-only">Tampilkan</span>
        </button>
        <button
          type="button"
          onClick={onDownload}
          disabled={!loaded || loading}
          className="flex h-10 items-center justify-center gap-2 rounded-lg border border-[#0756D9] bg-white px-4 text-sm font-semibold text-[#0756D9] transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:border-slate-300 disabled:text-slate-400 disabled:hover:bg-white sm:col-span-2 xl:col-span-1 xl:shrink-0"
        >
          <Download aria-hidden="true" className="h-4 w-4" /> Download Rekap
        </button>
      </div>
    </section>
  );
}
