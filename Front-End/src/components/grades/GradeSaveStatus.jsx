import { CircleCheck, Cloud, PencilLine } from "lucide-react";

export default function GradeSaveStatus({ isEditing, autosaveStatus }) {
  let Icon = PencilLine;
  let text = "Simpan nilai berhasil";
  let style = "text-[#545968]";

  if (isEditing && autosaveStatus === "saving") {
    Icon = Cloud;
    text = "Menyimpan draft...";
    style = "text-[#0756D9]";
  } else if (isEditing && autosaveStatus === "saved") {
    Icon = CircleCheck;
    text = "Draft tersimpan otomatis";
    style = "text-emerald-700";
  } else if (isEditing) {
    text = "Perubahan belum disimpan resmi";
  }

  return (
    <p role="status" aria-live="polite" className={`inline-flex items-center gap-2 text-xs font-medium ${style}`}>
      {isEditing && <Icon aria-hidden="true" className="h-4 w-4 text-[#0756D9]" />} {text}
    </p>
  );
}
