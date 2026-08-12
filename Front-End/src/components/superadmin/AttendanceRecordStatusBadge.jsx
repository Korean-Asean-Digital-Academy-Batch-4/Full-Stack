import { cn } from "../../utils/cn";

const statusConfig = {
  present: { label: "Hadir", className: "border-emerald-200 bg-emerald-50 text-emerald-600" },
  sick: { label: "Sakit", className: "border-amber-200 bg-amber-50 text-amber-600" },
  permission: { label: "Izin", className: "border-amber-200 bg-amber-50 text-amber-600" },
  absent: { label: "Alpa", className: "border-red-200 bg-red-50 text-red-600" },
};

export default function AttendanceRecordStatusBadge({ status }) {
  const config = statusConfig[status] || { label: status, className: "border-slate-200 bg-slate-50 text-slate-600" };
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium", config.className)}>
      <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
