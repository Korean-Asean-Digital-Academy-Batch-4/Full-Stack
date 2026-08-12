import { CircleCheck, Eye, TriangleAlert } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function FinalizeConfirmationModal({ open, studentName, ready, loading, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title="Konfirmasi Finalisasi Rapor" description={`Yakin untuk memfinalisasi rapor siswa ${studentName}? Setelah difinalisasi, nilai tidak dapat diubah lagi dari halaman Input Nilai.`} panelClassName="max-w-lg" dismissible={!loading}>
      <TriangleAlert aria-hidden="true" className="mx-auto h-14 w-14 text-amber-500" />
      <div className="mt-5 flex flex-col gap-2">
        <Button onClick={onConfirm} loading={loading} disabled={!ready || loading} className="bg-[#F59E0B] hover:bg-[#D97706]"><CircleCheck aria-hidden="true" className="h-4 w-4" /> {loading ? "Memfinalisasi..." : "Ya, Finalisasi Sekarang"}</Button>
        <Button variant="ghost" onClick={onClose} disabled={loading}><Eye aria-hidden="true" className="h-4 w-4" /> Tinjau Kembali Rapor</Button>
      </div>
      <div className={`mt-5 flex items-center justify-center gap-2 border-t border-[#ECEEF4] pt-4 text-xs font-bold tracking-[0.12em] ${ready ? "text-emerald-600" : "text-red-600"}`}><span className={`h-2 w-2 rounded-full ${ready ? "bg-emerald-500" : "bg-red-500"}`} /> {ready ? "SISTEM SIAP" : "DATA BELUM LENGKAP"}</div>
    </Modal>
  );
}
