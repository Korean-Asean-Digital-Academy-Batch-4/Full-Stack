import Button from "./Button";
import Modal from "./Modal";

export default function ConfirmDialog({
  open,
  onClose,
  title,
  description,
  cancelLabel = "Batal",
  confirmLabel = "Konfirmasi",
  onConfirm,
  confirmVariant = "danger",
  loading = false,
  error = "",
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description} dismissible={!loading}>
      {error && <p role="alert" className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={loading}>{cancelLabel}</Button>
        <Button variant={confirmVariant} onClick={onConfirm} loading={loading}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
