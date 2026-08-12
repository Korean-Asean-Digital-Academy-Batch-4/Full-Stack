import { ArrowLeft, CircleCheck, GraduationCap } from "lucide-react";
import { Link } from "react-router-dom";
import { REPORT_STATUSES } from "../../data/reportData";
import Badge from "../ui/Badge";

export default function StudentReportHeader({ student, assignment, status, actions }) {
  const finalized = status === REPORT_STATUSES.FINALIZED_SUBJECT;
  return (
    <header>
      <Link to="/teacher/reports" className="inline-flex items-center gap-2 text-sm font-semibold text-[#0756D9] hover:underline"><ArrowLeft aria-hidden="true" className="h-4 w-4" /> Kembali ke daftar rapor</Link>
      <div className="mt-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-bold tracking-[-0.03em] text-[#202838] sm:text-[28px]">{student.name}</h1>
            <Badge className={finalized ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"}>
              {finalized && <CircleCheck aria-hidden="true" className="h-3.5 w-3.5" />}
              {finalized ? "Sudah Difinalisasi" : "Belum Difinalisasi"}
            </Badge>
          </div>
          <p className="mt-2 inline-flex items-center gap-2 text-sm text-[#64748B]"><GraduationCap aria-hidden="true" className="h-4 w-4" /> {assignment.name} · {assignment.academicYear} · Semester {assignment.semester}</p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">{actions}</div>
      </div>
    </header>
  );
}
