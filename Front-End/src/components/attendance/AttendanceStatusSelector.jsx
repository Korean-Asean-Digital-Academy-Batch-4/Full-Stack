import { Check, X } from "lucide-react";
import { statusLabels } from "../../data/attendanceData";

const options = [
  { value: "PRESENT", short: "H", icon: Check, active: "bg-[#10B981] text-white" },
  { value: "PERMITTED", short: "I", active: "bg-[#F59E0B] text-white" },
  { value: "SICK", short: "S", active: "bg-[#F28C00] text-white" },
  { value: "ABSENT", short: "A", icon: X, active: "bg-[#CC2028] text-white" },
];

export default function AttendanceStatusSelector({ student, value, onChange, disabled }) {
  return (
    <div
      role="group"
      aria-label={`Status presensi ${student.name}`}
      data-student-id={student.id}
      className="inline-flex rounded-lg bg-[#EEEEFA] p-1"
    >
      {options.map((option) => {
        const Icon = option.icon;
        const active = value === option.value;
        return (
          <button
            key={option.value}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.value)}
            aria-pressed={active}
            aria-label={`Tandai ${student.name} ${statusLabels[option.value].toLowerCase()}`}
            title={statusLabels[option.value]}
            className={`flex h-9 min-w-9 items-center justify-center rounded-md text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
              active ? option.active : "text-[#4D5261] hover:bg-white/70"
            }`}
          >
            {Icon ? <Icon aria-hidden="true" className="h-4 w-4" /> : option.short}
            <span className="sr-only">{statusLabels[option.value]}</span>
          </button>
        );
      })}
    </div>
  );
}
