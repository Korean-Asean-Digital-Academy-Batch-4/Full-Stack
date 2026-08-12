import { Search } from "lucide-react";
import { cn } from "../../utils/cn";

export default function StudentPeriodFilter({
  academicYear,
  semester,
  onAcademicYearChange,
  onSemesterChange,
  onSubmit,
  loading,
  card = false,
}) {
  const selectClassName =
    "mt-1.5 h-11 w-full appearance-none rounded-lg border border-[#E1E5ED] bg-white px-4 text-sm font-semibold text-[#394052] shadow-sm outline-none transition focus:border-[#2F67ED] focus:ring-2 focus:ring-blue-100 disabled:opacity-60";

  return (
    <form
      aria-label="Filter periode akademik"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit();
      }}
      className={cn(
        "grid grid-cols-1 gap-3 sm:grid-cols-[minmax(150px,1fr)_minmax(180px,1.2fr)_44px] sm:items-end",
        card && "rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(30,42,75,0.05)]",
      )}
    >
      <label className="text-[10px] font-medium uppercase tracking-wide text-[#697184]">
        Tahun Ajaran
        <select
          value={academicYear}
          onChange={(event) => onAcademicYearChange(event.target.value)}
          disabled={loading}
          className={selectClassName}
        >
          <option value={academicYear}>{academicYear}</option>
        </select>
      </label>
      <label className="text-[10px] font-medium uppercase tracking-wide text-[#697184]">
        Semester
        <select
          value={semester}
          onChange={(event) => onSemesterChange(event.target.value)}
          disabled={loading}
          className={selectClassName}
        >
          <option value={semester}>{semester}</option>
        </select>
      </label>
      <button
        type="submit"
        aria-label="Cari data periode"
        title="Cari data periode"
        disabled={loading}
        className="inline-flex h-11 w-full items-center justify-center rounded-lg bg-[#2F67ED] text-white shadow-sm transition hover:bg-[#1451D2] disabled:cursor-not-allowed disabled:opacity-60 sm:w-11"
      >
        <Search aria-hidden="true" className="h-5 w-5" />
        <span className="ml-2 sm:sr-only">Cari</span>
      </button>
    </form>
  );
}
