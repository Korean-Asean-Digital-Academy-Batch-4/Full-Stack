import { CalendarDays } from "lucide-react";
import { toIsoDate } from "../../utils/dateFormatter";

export default function DatePicker({ value, onChange, disabled }) {
  const isToday = value === toIsoDate();

  return (
    <label className="relative flex h-10 min-w-[140px] cursor-pointer items-center rounded-full border border-transparent bg-[#F3F3FF] px-4 text-sm text-[#4B5060] transition hover:border-[#D9DFF0] focus-within:border-[#2F67ED] focus-within:ring-2 focus-within:ring-blue-100">
      <span>{isToday ? "Hari ini" : value.split("-").reverse().join("/")}</span>
      <CalendarDays aria-hidden="true" className="ml-auto h-4 w-4" />
      <input
        type="date"
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-label="Tanggal presensi"
        className="absolute inset-0 cursor-pointer opacity-0 disabled:cursor-not-allowed"
      />
    </label>
  );
}
