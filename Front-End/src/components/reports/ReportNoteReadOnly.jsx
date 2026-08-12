import { LockKeyhole } from "lucide-react";

export default function ReportNoteReadOnly({ note, metadata }) {
  return (
    <section className="rounded-2xl border border-[#E7EAF1] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-[#202838]">Catatan Rapor</h2><p className="mt-1 text-xs text-[#64748B]">Catatan telah dikunci setelah finalisasi rapor mapel.</p></div><LockKeyhole aria-hidden="true" className="h-5 w-5 text-[#7C3AED]" /></div>
      <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-[#41485A]">{note || "Belum ada catatan."}</p>
      {metadata && <p className="mt-5 border-t border-[#ECEEF4] pt-4 text-xs text-[#64748B]">{metadata}</p>}
    </section>
  );
}
