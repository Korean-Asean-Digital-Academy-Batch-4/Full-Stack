import { FileCheck2 } from "lucide-react";
import { useState } from "react";
import BulkAccountUploadPage from "./BulkAccountUploadPage";
import GeneratedAccountTable from "./GeneratedAccountTable";

const ACCOUNT_CONFIG = {
  teacher: { entityLabel: "guru", description: "CSV diproses langsung oleh backend. Setiap akun baru disimpan ke database dan password awal hanya dikembalikan satu kali." },
  student: { entityLabel: "siswa", description: "CSV diproses langsung oleh backend. Setiap akun baru disimpan ke database dan password awal hanya dikembalikan satu kali." },
};

export default function BulkAccountGenerationPage({ accountType }) {
  const config = ACCOUNT_CONFIG[accountType];
  const [uploadedFile, setUploadedFile] = useState(null);
  if (!config) throw new Error(`Unsupported account generation type: ${accountType}`);

  const result = uploadedFile?.result;
  const createdRows = (result?.createdItems || []).map((item, index) => ({ id: index + 1, name: item.name, ...(accountType === "teacher" ? { nip: item.nip } : { nis: item.nis }), password: item.initialPassword, status: "ready" }));
  const failedRows = result?.failedRows || [];

  return <BulkAccountUploadPage accountType={accountType} onUploadSuccess={setUploadedFile}>{uploadedFile && <><section className="mt-7 rounded-lg border border-[#C5CDDC] bg-white p-5"><div className="flex items-start gap-3"><FileCheck2 className="mt-0.5 h-4 w-4 text-[#0756D9]" /><div><h2 className="text-sm font-medium text-[#20232D]">Hasil Pemrosesan</h2><p className="mt-2 text-xs leading-5 text-[#555D6E]">{config.description}</p></div></div><div className={`mt-5 rounded-lg p-4 text-sm ${createdRows.length ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}><strong>{result?.createdCount ?? 0} akun berhasil dibuat.</strong>{failedRows.length > 0 && <div className="mt-3"><p className="font-medium">{failedRows.length} baris gagal:</p><ul className="mt-1 list-disc space-y-1 pl-5">{failedRows.map((failure) => { const identifier = failure.values?.NIP || failure.values?.NIS; const name = failure.values?.Nama; return <li key={`${failure.row}-${identifier || name || "row"}`}>Baris {failure.row}{name ? ` (${name}${identifier ? ` / ${identifier}` : ""})` : ""}: {failure.reason}</li>; })}</ul></div>}</div></section>{createdRows.length > 0 && <GeneratedAccountTable entityType={accountType} rows={createdRows} title="Akun Baru Berhasil Dibuat" subtitle="Simpan password awal sekarang. Password tidak dapat ditampilkan kembali setelah halaman ditutup." />}</>}</BulkAccountUploadPage>;
}
