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
}) {
  return (
    <Modal open={open} onClose={onClose} title={title} description={description}>
      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose}>{cancelLabel}</Button>
        <Button variant={confirmVariant} onClick={onConfirm}>{confirmLabel}</Button>
      </div>
    </Modal>
  );
}
