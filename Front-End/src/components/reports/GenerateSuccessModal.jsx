import { CircleAlert, CircleCheckBig, RotateCcw } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";
import ProgressBar from "../ui/ProgressBar";

export default function GenerateSuccessModal({ result, onClose, onRetry }) {
  if (!result) return null;
  const partial = result.failed > 0;
  const Icon = partial ? CircleAlert : CircleCheckBig;
  return (
    <Modal
      open
      onClose={onClose}
      title={partial ? "Proses Selesai dengan Beberapa Kendala" : "Rapor Berhasil Dibuat"}
      description={partial ? `Berhasil membuat ${result.completed} dari ${result.total} rapor. ${result.failed} rapor perlu dicoba kembali.` : `Berhasil membuat ${result.completed} rapor untuk ${result.total} siswa.`}
      panelClassName="max-w-lg"
    >
      <Icon aria-hidden="true" className={`mx-auto h-16 w-16 ${partial ? "text-amber-500" : "text-emerald-500"}`} />
      <div className="mt-5"><ProgressBar value={100} label="Proses pembuatan rapor selesai" /></div>
      <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>{partial ? "Lihat Hasil" : "Lihat Rapor"}</Button>
        {partial && <Button onClick={onRetry}><RotateCcw aria-hidden="true" className="h-4 w-4" /> Coba Ulang yang Gagal</Button>}
      </div>
    </Modal>
  );
}
