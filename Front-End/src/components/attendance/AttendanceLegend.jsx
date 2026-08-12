const items = [
  { label: "Hadir", color: "bg-[#10B981]" },
  { label: "Izin", color: "bg-[#F59E0B]" },
  { label: "Sakit", color: "bg-[#F28C00]" },
  { label: "Alpa", color: "bg-[#CC2028]" },
  { label: "Belum Dicatat", color: "bg-slate-400" },
];

export default function AttendanceLegend({ total }) {
  return (
    <footer className="flex flex-col gap-3 bg-[#F3F3FF] px-4 py-3 text-xs text-[#545968] sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        {items.map((item) => (
          <span key={item.label} className="inline-flex items-center gap-1.5">
            <span aria-hidden="true" className={`h-2 w-2 rounded-full ${item.color}`} /> {item.label}
          </span>
        ))}
      </div>
      <p className="shrink-0">Total: {total} Siswa</p>
    </footer>
  );
}
