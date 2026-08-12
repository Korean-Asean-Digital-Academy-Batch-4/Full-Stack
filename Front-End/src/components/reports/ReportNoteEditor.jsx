import { Save, Sparkles, Undo2 } from "lucide-react";
import Button from "../ui/Button";
import RichTextEditor from "../ui/RichTextEditor";

export default function ReportNoteEditor({ value, onChange, onSave, onCancel, onAiDraft, saving, dirty, aiDraft }) {
  return (
    <section className="rounded-2xl border border-[#E7EAF1] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div><h2 className="font-bold text-[#202838]">Catatan Rapor</h2><p id="report-note-help" className="mt-1 text-xs text-[#64748B]">Silakan isi catatan hasil belajar siswa. Maksimal 1000 karakter.</p></div>
        <Button variant="secondary" onClick={onAiDraft} disabled={saving} className="h-9 border-violet-200 px-3 text-xs text-violet-700"><Sparkles aria-hidden="true" className="h-3.5 w-3.5" /> Buat Draf dengan AI</Button>
      </div>
      {aiDraft && <p className="mt-3 inline-flex rounded-full bg-violet-100 px-3 py-1 text-xs font-semibold text-violet-700">Draf AI — perlu ditinjau</p>}
      <div className="mt-4"><RichTextEditor value={value} onChange={onChange} disabled={saving} /></div>
      <div className="mt-2 flex items-center justify-between text-xs text-[#7A8090]"><span title="Sumber: Nilai UTS dibandingkan dengan rata-rata tugas.">Fakta sumber tersedia untuk ditinjau</span><span>{value.length}/1000</span></div>
      <div className="sticky bottom-0 z-20 -mx-5 -mb-5 mt-5 flex flex-col-reverse gap-2 border-t border-[#E8EBF2] bg-white/95 p-4 backdrop-blur sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel} disabled={!dirty || saving} className="h-10"><Undo2 aria-hidden="true" className="h-4 w-4" /> Batalkan Perubahan</Button>
        <Button onClick={onSave} loading={saving} disabled={!dirty || saving} className="h-10"><Save aria-hidden="true" className="h-4 w-4" /> {saving ? "Menyimpan..." : "Simpan Catatan Rapor"}</Button>
      </div>
    </section>
  );
}
