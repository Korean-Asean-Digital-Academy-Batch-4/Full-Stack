import { getStoredUser } from "../../stores/authStore";
import { formatLongDate, getGreeting } from "../../utils/dateFormatter";

export default function DashboardGreeting() {
  const now = new Date();
  const user = getStoredUser();
  const period = user?.academicPeriod || { academicYear: "-", semester: "-" };
  return (
    <header className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-[26px] font-bold tracking-[-0.04em] text-[#20232D]">
          {getGreeting(now)}, {user?.name || "Guru"} <span aria-label="kopi" role="img">☕</span>
        </h1>
        <p className="mt-1 text-sm text-[#545968]">Ringkasan harian aktivitas dan progres kelas Anda.</p>
      </div>
      <div className="text-left sm:text-right">
        <p className="text-sm font-semibold text-[#20232D]">{formatLongDate(now)}</p>
        <p className="mt-0.5 text-xs text-[#545968]">
          Semester {period.semester} {period.academicYear}
        </p>
      </div>
    </header>
  );
}
