import { Eye } from "lucide-react";
import { Link } from "react-router-dom";
import ReportGenerateButton from "./ReportGenerateButton";
import ReportStatusBadge from "./ReportStatusBadge";

const avatarStyles = {
  blue: "bg-blue-600",
  purple: "bg-violet-500",
  orange: "bg-orange-600",
  teal: "bg-teal-600",
};

export default function ReportStudentTable({ students, assignmentId, generatingId, onGenerate }) {
  return (
    <div className="max-w-full overflow-x-auto">
      <table className="w-full min-w-[800px] border-collapse text-sm">
        <thead className="bg-[#F3F3FF] text-left text-xs font-semibold uppercase tracking-wide text-[#626879]">
          <tr>
            <th className="px-5 py-4">No</th>
            <th className="px-5 py-4">Nama Siswa</th>
            <th className="px-5 py-4 text-center">Nilai Rata-Rata</th>
            <th className="px-5 py-4 text-center">Status Rapor</th>
            <th className="px-5 py-4 text-center">Detail</th>
            <th className="px-5 py-4 text-right">Aksi</th>
          </tr>
        </thead>
        <tbody>
          {students.map((student, index) => {
            const detailAvailable = Boolean(student.reportId);
            return (
              <tr key={student.id} className="border-t border-[#E8EBF2] bg-white hover:bg-[#FBFCFE]">
                <td className="px-5 py-4 text-[#64748B]">{index + 1}</td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarStyles[student.avatarColor] || avatarStyles.blue}`}>{student.initials}</span>
                    <span><strong className="block text-[#202838]">{student.name}</strong><small className="text-[#64748B]">NIS: {student.nis}</small></span>
                  </div>
                </td>
                <td className="px-5 py-4 text-center">
                  {student.finalGrade == null ? <span className="text-slate-400">–</span> : (
                    <span className={`rounded-full px-3 py-1 font-bold ${student.finalGrade >= 75 ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                      {student.finalGrade.toFixed(1)}
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-center"><ReportStatusBadge status={student.reportStatus} /></td>
                <td className="px-5 py-4 text-center">
                  {detailAvailable ? (
                    <Link to={`/teacher/reports/${student.id}?assignment=${assignmentId}`} className="inline-flex items-center gap-1 font-semibold text-[#0756D9] hover:underline"><Eye aria-hidden="true" className="h-4 w-4" /> Lihat</Link>
                  ) : <span title="Buat rapor terlebih dahulu" className="text-slate-400">Belum tersedia</span>}
                </td>
                <td className="px-5 py-4 text-right"><ReportGenerateButton student={student} generating={generatingId === student.id} onGenerate={onGenerate} /></td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
