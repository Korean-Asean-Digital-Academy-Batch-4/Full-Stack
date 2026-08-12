import { CircleCheck, Save } from "lucide-react";
import Button from "../ui/Button";

export default function SaveAttendanceButton({ saved, saving, disabled, onSave }) {
  if (saved) {
    return (
      <div
        role="status"
        className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-[#10B981] px-4 text-sm font-semibold text-white shadow-sm sm:w-auto sm:min-w-[200px]"
      >
        <CircleCheck aria-hidden="true" className="h-4 w-4" /> Presensi Tersimpan
      </div>
    );
  }

  return (
    <Button
      variant="primary"
      loading={saving}
      disabled={disabled}
      onClick={onSave}
      className="w-full sm:w-auto sm:min-w-[200px]"
    >
      {saving ? (
        "Menyimpan..."
      ) : (
        <><Save aria-hidden="true" className="h-4 w-4" /> Simpan Presensi</>
      )}
    </Button>
  );
}
