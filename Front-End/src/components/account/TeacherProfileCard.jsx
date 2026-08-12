import { CalendarDays, CircleCheck } from "lucide-react";
import Badge from "../ui/Badge";

export default function TeacherProfileCard({ profile }) {
  const initials = String(profile.name || "G").split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  return (
    <article className="rounded-2xl border border-[#E7EAF1] bg-white p-6 text-center shadow-sm">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-[#2F67ED] to-[#7357F6] text-3xl font-bold text-white shadow-soft">{initials}</div>
      <h2 className="mt-5 text-xl font-bold text-[#202838]">{profile.name}</h2>
      <p className="mt-1 text-xs font-semibold tracking-[0.16em] text-[#7357F6]">GURU MAPEL</p>
      <p className="mt-3 break-all text-sm text-[#64748B]">{profile.identityNumber}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-2"><Badge className="bg-emerald-100 text-emerald-700"><CircleCheck aria-hidden="true" className="h-3.5 w-3.5" /> {profile.employmentStatus}</Badge><Badge className="bg-blue-50 text-blue-700"><CalendarDays aria-hidden="true" className="h-3.5 w-3.5" /> Bergabung {profile.joinedAt}</Badge></div>
    </article>
  );
}
