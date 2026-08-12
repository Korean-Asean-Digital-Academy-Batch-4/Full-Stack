import { Star, TrendingUp } from "lucide-react";

export default function ReportSummaryCard({ value }) {
  return (
    <article className="rounded-2xl border border-[#E7EAF1] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#687084]">Rata-rata Nilai</p><Star aria-hidden="true" className="h-5 w-5 text-amber-400" /></div>
      <p className="mt-4 text-4xl font-bold tracking-[-0.04em] text-[#2F67ED]">{value ?? "—"}</p>
      <p className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-emerald-600"><TrendingUp aria-hidden="true" className="h-4 w-4" /> Berdasarkan bobot resmi</p>
    </article>
  );
}
