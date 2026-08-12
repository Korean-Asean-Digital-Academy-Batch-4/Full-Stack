import { Save } from "lucide-react";

export default function GradeReadOnlyStatus() {
  return (
    <footer className="flex justify-end border-t border-[#E4E8F1] bg-white px-4 py-3 sm:px-6">
      <div
        role="status"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#10B981] px-6 text-sm font-semibold text-white shadow-sm"
      >
        <Save aria-hidden="true" className="h-4 w-4" /> Nilai Tersimpan
      </div>
    </footer>
  );
}
