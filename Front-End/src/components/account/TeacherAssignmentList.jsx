import { BookOpenCheck } from "lucide-react";
import Badge from "../ui/Badge";

export default function TeacherAssignmentList({ assignments }) {
  return (
    <section className="rounded-2xl border border-[#E7EAF1] bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-[#202838]">Penugasan Aktif</h2><p className="mt-1 text-xs text-[#64748B]">Penugasan hanya dapat dilihat dan dikelola oleh Administrator.</p><div className="mt-5 space-y-3">{assignments.length ? assignments.map((assignment) => <article key={`${assignment.id}:${assignment.subjectId}`} className="flex flex-col gap-3 rounded-xl border border-[#E8EBF2] p-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-50 text-[#0756D9]"><BookOpenCheck aria-hidden="true" className="h-5 w-5" /></span><div><h3 className="font-semibold text-[#202838]">{assignment.name} — {assignment.subjectName}</h3><p className="mt-1 text-xs text-[#64748B]">Semester {assignment.semester} · {assignment.academicYear}</p></div></div><Badge className="self-start bg-emerald-100 text-emerald-700 sm:self-auto">Aktif</Badge></article>) : <p className="rounded-lg bg-[#F5F7FA] p-4 text-sm text-[#64748B]">Belum ada penugasan aktif.</p>}</div></section>
  );
}
