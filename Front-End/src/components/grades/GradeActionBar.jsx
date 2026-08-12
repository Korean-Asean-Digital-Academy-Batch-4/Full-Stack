import { BookOpen, LockKeyhole, Save } from "lucide-react";
import Button from "../ui/Button";
import GradeSaveStatus from "./GradeSaveStatus";

export default function GradeActionBar({
  isEditing,
  isSaving,
  isDirty,
  autosaveStatus,
  locked,
  onEdit,
  onCancel,
  onSave,
  onOpenTopics,
  topicButtonRef,
}) {
  if (locked) {
    return (
      <footer className="border-t border-[#E4E8F1] bg-white px-4 py-4 sm:px-6">
        <div className="flex flex-col gap-2 text-sm text-[#64748B] sm:flex-row sm:items-center sm:justify-between">
          <p className="inline-flex items-center gap-2"><LockKeyhole aria-hidden="true" className="h-4 w-4 text-emerald-600" /> Rapor telah difinalisasi. Nilai tidak dapat diedit.</p>
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Rapor Telah Difinalisasi</span>
        </div>
      </footer>
    );
  }

  return (
    <footer className="sticky bottom-0 z-30 border-t border-[#E4E8F1] bg-white/95 px-4 py-3 shadow-[0_-4px_12px_rgba(30,42,75,0.04)] backdrop-blur sm:px-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <GradeSaveStatus isEditing={isEditing} autosaveStatus={autosaveStatus} />
        {isEditing ? (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
            <Button ref={topicButtonRef} variant="secondary" onClick={onOpenTopics} disabled={isSaving} className="h-11 border-[#0756D9] text-[#0756D9]">
              <BookOpen aria-hidden="true" className="h-4 w-4" /> Input Materi Pembelajaran
            </Button>
            <Button variant="secondary" onClick={onCancel} disabled={isSaving} className="h-11 border-[#0756D9] text-[#0756D9]">Batal</Button>
            <Button onClick={onSave} loading={isSaving} disabled={!isDirty || isSaving} className="h-11 min-w-[190px]">
              {!isSaving && <Save aria-hidden="true" className="h-4 w-4" />}
              {isSaving ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Button variant="secondary" onClick={onEdit} className="h-11 border-[#0756D9] text-[#0756D9]">Edit Nilai</Button>
            <div role="status" className="inline-flex h-11 items-center justify-center gap-2 rounded-lg bg-[#10B981] px-6 text-sm font-semibold text-white shadow-sm">
              <Save aria-hidden="true" className="h-4 w-4" /> Nilai Tersimpan
            </div>
          </div>
        )}
      </div>
    </footer>
  );
}
