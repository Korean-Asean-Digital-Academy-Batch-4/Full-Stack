import { Search } from "lucide-react";
import { homeroomSubjects } from "../../data/gradeData";
import Select from "../ui/Select";

function FilterField({ label, children }) {
  return (
    <div className="min-w-0">
      <p className="mb-1.5 px-1 text-[11px] font-medium text-[#4B5060]">{label}</p>
      {children}
    </div>
  );
}

export default function HomeroomGradeFilters({ filters, onChange, onShow, loading }) {
  const changeFilter = (key) => (event) => {
    onChange({ ...filters, [key]: event.target.value });
  };

  return (
    <section
      aria-label="Filter nilai mata pelajaran"
      className="mt-8 max-w-[680px] rounded-[14px] border border-[#E4E8F1] bg-white p-4 shadow-[0_2px_5px_rgba(30,42,75,0.04)]"
    >
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-[minmax(120px,0.85fr)_minmax(140px,1fr)_minmax(170px,1.25fr)_auto] xl:items-end [&_select]:text-xs">
        <FilterField label="Tahun Ajaran">
          <Select label="Tahun Ajaran" value={filters.academicYear} onChange={changeFilter("academicYear")} disabled={loading}>
            <option value="2026/2027">2026/2027</option>
          </Select>
        </FilterField>
        <FilterField label="Semester">
          <Select label="Semester" value={filters.semester} onChange={changeFilter("semester")} disabled={loading}>
            <option value="GANJIL">Semester Ganjil</option>
          </Select>
        </FilterField>
        <FilterField label="Pilih Mata Pelajaran">
          <Select label="Pilih Mata Pelajaran" value={filters.subjectId} onChange={changeFilter("subjectId")} disabled={loading}>
            {homeroomSubjects.map((subject) => (
              <option key={subject.id} value={subject.id}>{subject.name}</option>
            ))}
          </Select>
        </FilterField>
        <button
          type="button"
          onClick={onShow}
          disabled={loading}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-full bg-[#2F67ED] px-5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#1451D2] disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2 xl:col-span-1"
        >
          <Search aria-hidden="true" className="h-4 w-4" /> {loading ? "Memuat..." : "Tampilkan"}
        </button>
      </div>
    </section>
  );
}
