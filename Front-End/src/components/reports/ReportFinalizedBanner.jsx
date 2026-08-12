import { CircleCheck, LockKeyhole } from "lucide-react";

export default function ReportFinalizedBanner({ metadata }) {
  return (
    <section className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-emerald-800">
      <div className="flex items-start gap-3"><CircleCheck aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /><div><h2 className="font-bold">Rapor Telah Difinalisasi</h2><p className="mt-1 text-sm">{metadata}</p><p className="mt-2 inline-flex items-center gap-1.5 text-xs"><LockKeyhole aria-hidden="true" className="h-3.5 w-3.5" /> Rapor telah difinalisasi dan tidak dapat diubah lagi.</p></div></div>
    </section>
  );
}
