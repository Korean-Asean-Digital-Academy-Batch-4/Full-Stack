import { RotateCcw } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function ReopenReportModal({ open, loading, onClose, onConfirm }) {
  const [reason, setReason] = useState("");
  useEffect(() => { if (open) setReason(""); }, [open]);
  const valid = reason.trim().length >= 10;
  return (
    <Modal open={open} onClose={onClose} title="Buka Kembali Rapor Mapel" description="Jelaskan alasan koreksi untuk menjaga riwayat perubahan rapor." dismissible={!loading}>
      <label className="block text-sm font-semibold text-[#343946]">Alasan koreksi
        <textarea value={reason} onChange={(event) => setReason(event.target.value)} rows={4} maxLength={500} placeholder="Nilai UTS diperbaiki setelah verifikasi dokumen ujian." className="mt-2 w-full rounded-xl border border-[#DDE2EC] px-3 py-2.5 text-sm focus:border-[#0756D9] focus:outline-none" />
      </label>
      {!valid && reason.length > 0 && <p role="alert" className="mt-2 text-xs text-red-600">Alasan koreksi minimal 10 karakter.</p>}
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={onClose} disabled={loading}>Batal</Button><Button onClick={() => onConfirm(reason)} loading={loading} disabled={!valid || loading}><RotateCcw aria-hidden="true" className="h-4 w-4" /> Buka Kembali</Button></div>
    </Modal>
  );
}
