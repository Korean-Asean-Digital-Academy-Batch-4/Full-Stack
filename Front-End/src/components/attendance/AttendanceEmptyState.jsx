import { ClipboardCheck } from "lucide-react";
import EmptyState from "../ui/EmptyState";

export default function AttendanceEmptyState({ noStudents = false }) {
  return (
    <EmptyState
      icon={ClipboardCheck}
      title={noStudents ? "Belum ada siswa" : "Presensi Kelas"}
      description={
        noStudents
          ? "Belum ada siswa di kelas ini."
          : "Pilih filter di atas untuk memuat daftar siswa dan mulai melakukan presensi."
      }
    />
  );
}
