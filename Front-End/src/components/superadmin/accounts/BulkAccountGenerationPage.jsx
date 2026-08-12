import { FileCheck2, UserPlus } from "lucide-react";
import { useState } from "react";
import BulkAccountUploadPage from "./BulkAccountUploadPage";
import GeneratedAccountTable from "./GeneratedAccountTable";
import Button from "../../ui/Button";
import { createUser } from "../../../services/adminService";

const ACCOUNT_CONFIG = {
  teacher: { entityLabel: "guru", description: "CSV diproses langsung oleh backend. Setiap akun baru disimpan ke database dan password awal hanya dikembalikan satu kali." },
  student: { entityLabel: "siswa", description: "CSV diproses langsung oleh backend. Setiap akun baru disimpan ke database dan password awal hanya dikembalikan satu kali." },
};

export default function BulkAccountGenerationPage({ accountType }) {
  const config = ACCOUNT_CONFIG[accountType];
  const [uploadedFile, setUploadedFile] = useState(null);
  const [manualForm, setManualForm] = useState({ name: "", username: "" });
  const [manualRows, setManualRows] = useState([]);
  const [manualState, setManualState] = useState("idle");
  const [manualError, setManualError] = useState("");
  if (!config) throw new Error(`Unsupported account generation type: ${accountType}`);

  const result = uploadedFile?.result;
  const createdRows = (result?.createdItems || []).map((item, index) => ({ id: index + 1, name: item.name, ...(accountType === "teacher" ? { nip: item.nip } : { nis: item.nis }), password: item.initialPassword, status: "ready" }));
  const failedRows = result?.failedRows || [];

  const submitManual = async (event) => {
    event.preventDefault();
    const name = manualForm.name.trim();
    const username = manualForm.username.trim();
    if (!name || !/^\d+$/.test(username)) {
      setManualError(`Nama dan ${accountType === "teacher" ? "NIP" : "NIS"} berupa angka wajib diisi.`);
      return;
    }
    setManualState("loading"); setManualError("");
    try {
      const item = await createUser({ name, username, role: accountType });
      setManualRows((current) => [{
        id: `${accountType}-${item.id}`,
        name: item.name,
        ...(accountType === "teacher" ? { nip: item.nip } : { nis: item.nis }),
        password: item.initialPassword,
        status: "ready",
      }, ...current]);
      setManualForm({ name: "", username: "" });
      setManualState("success");
    } catch (error) {
      setManualError(error.message || "Akun gagal dibuat.");
      setManualState("error");
    }
  };

  return <BulkAccountUploadPage accountType={accountType} onUploadSuccess={setUploadedFile}>
    <section className="mt-7 rounded-lg border border-[#C5CDDC] bg-white p-5">
      <div className="flex items-start gap-3"><UserPlus className="mt-0.5 h-5 w-5 text-[#0756D9]" /><div><h2 className="text-base font-semibold text-[#20232D]">Ketik Data Manual</h2><p className="mt-1 text-xs text-[#555D6E]">Buat satu akun tanpa mengunggah CSV. Password awal akan ditampilkan satu kali.</p></div></div>
      <form onSubmit={submitManual} className="mt-5 grid gap-4 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
        <label className="text-sm font-semibold text-[#343946]">Nama Lengkap<input value={manualForm.name} onChange={(event) => setManualForm((current) => ({ ...current, name: event.target.value }))} placeholder={`Nama ${config.entityLabel}`} className="mt-2 h-11 w-full rounded-lg border border-[#D7DCE7] px-3 font-normal outline-none focus:border-[#0756D9]" /></label>
        <label className="text-sm font-semibold text-[#343946]">{accountType === "teacher" ? "NIP" : "NIS"}<input inputMode="numeric" value={manualForm.username} onChange={(event) => setManualForm((current) => ({ ...current, username: event.target.value.replace(/\D/g, "") }))} placeholder={`Masukkan ${accountType === "teacher" ? "NIP" : "NIS"}`} className="mt-2 h-11 w-full rounded-lg border border-[#D7DCE7] px-3 font-normal outline-none focus:border-[#0756D9]" /></label>
        <Button type="submit" loading={manualState === "loading"} className="h-11"><UserPlus className="h-4 w-4" /> Buat Akun</Button>
      </form>
      {manualError && <p role="alert" className="mt-3 text-sm text-red-600">{manualError}</p>}
    </section>
    {uploadedFile && <section className="mt-7 rounded-lg border border-[#C5CDDC] bg-white p-5"><div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 text-[#0756D9]" /><div><h2 className="text-sm font-medium text-[#20232D]">Hasil Pemrosesan</h2><p className="mt-2 text-xs leading-5 text-[#555D6E]">{config.description}</p></div></div><div className={`mt-5 rounded-lg p-4 text-sm ${createdRows.length ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}><strong>{result?.createdCount ?? 0} akun berhasil dibuat.</strong>{failedRows.length > 0 && <div className="mt-3"><p className="font-medium">{failedRows.length} baris gagal:</p><ul className="mt-1 list-disc space-y-1 pl-5">{failedRows.map((failure) => { const identifier = failure.values?.NIP || failure.values?.NIS; const name = failure.values?.Nama; return <li key={`${failure.row}-${identifier || name || "row"}`}>Baris {failure.row}{name ? ` (${name}${identifier ? ` / ${identifier}` : ""})` : ""}: {failure.reason}</li>; })}</ul></div>}</div></section>}
    {(manualRows.length > 0 || createdRows.length > 0) && <GeneratedAccountTable entityType={accountType} rows={[...manualRows, ...createdRows]} title="Akun Baru Berhasil Dibuat" subtitle="Simpan password awal sekarang. Password tidak dapat ditampilkan kembali setelah halaman ditutup." />}
  </BulkAccountUploadPage>;
}
