import { CalendarDays } from "lucide-react";

export default function AttendanceCard({ percentage }) {
  return (
    <article className="h-[104px] rounded-[14px] border border-[#D7DCE8] bg-white px-4 py-4 shadow-[0_1px_3px_rgba(30,42,75,0.03)]">
      <div className="flex items-center justify-between">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.05em] text-[#545968]">Kehadiran</h2>
        <CalendarDays aria-hidden="true" className="h-5 w-5 text-[#F59E0B]" strokeWidth={1.8} />
      </div>
      <p className="mt-2 text-[44px] font-medium leading-none tracking-[-0.04em] text-[#20232D]">{percentage}%</p>
    </article>
  );
}
