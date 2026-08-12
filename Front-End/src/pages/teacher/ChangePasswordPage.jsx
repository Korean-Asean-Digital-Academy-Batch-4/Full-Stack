import { KeyRound } from "lucide-react";
import { useState } from "react";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { changePassword } from "../../services/authService";

export default function ChangePasswordPage() {
  const [values, setValues] = useState({ current: "", next: "", confirm: "" });
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const submit = async (event) => {
    event.preventDefault();
    if (!values.current || !values.next || values.next !== values.confirm) {
      setToast({ type: "error", message: "Semua kata sandi wajib diisi dan konfirmasi harus sama." });
      return;
    }
    setSaving(true);
    try {
      await changePassword({ currentPassword: values.current, newPassword: values.next });
      setValues({ current: "", next: "", confirm: "" });
      setToast({ type: "success", message: "Kata sandi berhasil diperbarui." });
    } catch (error) {
      setToast({ type: "error", message: error.message || "Kata sandi gagal diperbarui." });
    } finally {
      setSaving(false);
    }
  };
  return <div className="px-4 py-8 sm:px-7"><form onSubmit={submit} className="mx-auto max-w-lg rounded-2xl bg-white p-6 shadow-soft sm:p-8"><KeyRound aria-hidden="true" className="h-8 w-8 text-[#0756D9]" /><h1 className="mt-4 text-2xl font-bold">Ubah Kata Sandi</h1><p className="mt-2 text-sm text-[#64748B]">Masukkan kata sandi saat ini dan kata sandi baru Anda.</p><div className="mt-6 space-y-4">{[["Kata sandi saat ini","current"],["Kata sandi baru","next"],["Konfirmasi kata sandi baru","confirm"]].map(([label,key]) => <label key={key} className="block text-sm font-semibold">{label}<input type="password" required value={values[key]} onChange={(event) => setValues((current) => ({ ...current, [key]: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border border-[#DDE2EC] px-3 focus:border-[#0756D9] focus:outline-none" /></label>)}</div><Button type="submit" loading={saving} className="mt-6 w-full">Simpan Kata Sandi</Button></form><Toast toast={toast} onClose={() => setToast(null)} /></div>;
}
