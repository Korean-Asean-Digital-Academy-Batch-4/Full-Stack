import { CircleAlert, CircleCheck, X } from "lucide-react";

export default function Toast({ toast, onClose }) {
  if (!toast) return null;
  const isError = toast.type === "error";
  const Icon = isError ? CircleAlert : CircleCheck;

  return (
    <div
      className={`fixed bottom-5 right-5 z-[100] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-xl border bg-white px-4 py-3 text-sm shadow-soft ${
        isError ? "border-red-200 text-red-700" : "border-emerald-200 text-emerald-700"
      }`}
      role={isError ? "alert" : "status"}
      aria-live="polite"
    >
      <Icon aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <p className="font-medium leading-5">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        aria-label="Tutup notifikasi"
        className="rounded p-0.5 text-current opacity-70 hover:opacity-100"
      >
        <X aria-hidden="true" className="h-4 w-4" />
      </button>
    </div>
  );
}
