import { Check, Minus, X } from "lucide-react";
import { statusLabels } from "../../data/attendanceData";

const styles = {
  PRESENT: "bg-[#E4F8F2] text-[#0AAE83]",
  PERMITTED: "bg-[#FFF2D9] text-[#E89500]",
  SICK: "bg-[#FFEBC8] text-[#F28C00]",
  ABSENT: "bg-[#FFE0DD] text-[#CF2E36]",
  NOT_RECORDED: "bg-slate-100 text-slate-500",
};

export default function AttendanceStatusBadge({ status }) {
  const label = statusLabels[status];
  return (
    <span
      title={label}
      aria-label={label}
      className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium ${styles[status]}`}
    >
      {status === "PRESENT" && <Check aria-hidden="true" className="h-4 w-4" />}
      {status === "PERMITTED" && "I"}
      {status === "SICK" && "S"}
      {status === "ABSENT" && <span aria-hidden="true">A</span>}
      {status === "NOT_RECORDED" && <Minus aria-hidden="true" className="h-4 w-4" />}
      <span className="sr-only">{label}</span>
    </span>
  );
}
