import { Save, Trash2 } from "lucide-react";
import Button from "../ui/Button";
import Modal from "../ui/Modal";

export default function ReportNoteUnsavedModal({ open, saving, onClose, onDiscard, onSave }) {
  return (
    <Modal open={open} onClose={onClose} title="Simpan perubahan catatan?" description="Terdapat perubahan catatan rapor yang belum disimpan." dismissible={!saving}>
      <div className="flex flex-col gap-2"><Button variant="secondary" onClick={onClose} disabled={saving}>Kembali Mengedit</Button><Button variant="secondary" onClick={onDiscard} disabled={saving} className="border-red-200 text-red-600"><Trash2 aria-hidden="true" className="h-4 w-4" /> Buang Perubahan</Button><Button onClick={onSave} loading={saving}><Save aria-hidden="true" className="h-4 w-4" /> Simpan Catatan</Button></div>
    </Modal>
  );
}
