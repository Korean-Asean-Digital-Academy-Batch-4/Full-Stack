import { CalendarCheck } from "lucide-react";
import ProgressBar from "../ui/ProgressBar";

export default function AttendanceSummaryCard({ percentage, attendance }) {
  return (
    <article className="rounded-2xl border border-[#E7EAF1] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#687084]">Kehadiran</p><CalendarCheck aria-hidden="true" className="h-5 w-5 text-emerald-500" /></div>
      <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#10B981]">{percentage}%</p>
      <div className="mt-3 [&>div>div]:from-emerald-400 [&>div>div]:to-emerald-500"><ProgressBar value={percentage} label="Persentase kehadiran" /></div>
      <p className="mt-3 text-xs text-[#64748B]">{attendance.attended} dari {attendance.total} pertemuan hadir</p>
    </article>
  );
}
