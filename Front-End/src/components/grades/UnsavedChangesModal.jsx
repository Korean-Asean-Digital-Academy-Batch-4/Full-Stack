import ConfirmDialog from "../ui/ConfirmDialog";

export default function UnsavedChangesModal({
  open,
  onStay,
  onDiscard,
  title = "Batalkan perubahan?",
  description = "Perubahan nilai yang belum disimpan akan hilang.",
}) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onStay}
      title={title}
      description={description}
      cancelLabel="Lanjut Mengedit"
      confirmLabel="Batalkan Perubahan"
      onConfirm={onDiscard}
      confirmVariant="danger"
    />
  );
}
