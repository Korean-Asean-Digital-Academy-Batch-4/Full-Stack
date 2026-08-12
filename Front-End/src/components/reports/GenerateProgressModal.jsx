import { LoaderCircle } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ProgressBar from "../ui/ProgressBar";

export default function GenerateProgressModal({ open, progress, onCancel }) {
  const percent = progress.total ? Math.round((progress.processed / progress.total) * 100) : 0;
  return (
    <Modal open={open} onClose={() => {}} dismissible={false} title="Sedang Membuat Semua Rapor" description={`Memproses ${progress.processed} dari ${progress.total} siswa...`} panelClassName="max-w-lg">
      <div className="rounded-xl bg-[#F8F7FF] p-4">
        <div className="mb-2 flex items-center justify-between text-xs font-semibold tracking-wide text-[#616779]"><span>PROGRESS</span><span>{percent}%</span></div>
        <ProgressBar value={percent} label="Progress pembuatan semua rapor" />
        <div className="mt-3 flex items-center gap-2 text-xs text-[#64748B]"><LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin text-[#7357F6]" /> Rapor diproses satu per satu agar setiap hasil dapat divalidasi.</div>
      </div>
      <Button variant="secondary" onClick={onCancel} className="mt-5 w-full border-red-200 text-red-600">Batalkan Proses</Button>
    </Modal>
  );
}
