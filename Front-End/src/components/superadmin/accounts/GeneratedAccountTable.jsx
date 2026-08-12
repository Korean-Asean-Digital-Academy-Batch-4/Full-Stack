import { ChevronLeft, ChevronRight, Download, Shield } from "lucide-react";
import { useState } from "react";
import Badge from "../../ui/Badge";
import Toast from "../../ui/Toast";
import { cn } from "../../../utils/cn";

const PAGE_SIZE = 4;

const tableConfig = {
  teacher: {
    title: "Preview Akun",
    nameLabel: "Nama Guru",
    identityLabel: "NIP",
    identityKey: "nip",
    exportFileName: "hasil-akun-guru.csv",
    exportSuccessMessage: "Hasil akun guru berhasil diunduh. Simpan file ini dengan aman.",
  },
  student: {
    title: "Preview Akun",
    nameLabel: "Nama Siswa",
    identityLabel: "NIS",
    identityKey: "nis",
    exportFileName: "hasil-akun-siswa.csv",
    exportSuccessMessage: "Hasil akun siswa berhasil diunduh. Simpan file ini dengan aman.",
  },
};

function escapeCsvValue(value) {
  return `"${String(value ?? "-").replaceAll('"', '""')}"`;
}

function getRowStatus(row) {
  return row.status || row.rawStatus;
}

export default function GeneratedAccountTable({ entityType, rows, title, subtitle }) {
  const config = tableConfig[entityType];
  const [page, setPage] = useState(1);
  const [toast, setToast] = useState(null);

  if (!config) throw new Error(`Unsupported generated account type: ${entityType}`);

  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const visibleRows = rows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const downloadMaskedResults = () => {
    const header = ["No", config.nameLabel, config.identityLabel, "Generated Password", "Status"];
    const csvRows = rows.map((row, index) => [
      index + 1,
      row.name,
      row[config.identityKey],
      row.password || "-",
      getRowStatus(row) === "ready" ? "Siap" : "Error",
    ]);
    const csv = [header, ...csvRows].map((row) => row.map(escapeCsvValue).join(",")).join("\n");
    const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = config.exportFileName;
    anchor.click();
    URL.revokeObjectURL(url);
    setToast({ type: "success", message: config.exportSuccessMessage });
  };

  return (
    <>
      <section className="mt-8 overflow-hidden rounded-lg border border-[#C5CDDC] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#D7DCE7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-sm font-medium text-[#20232D]">{title || config.title}</h2>
            {subtitle && <p className="mt-1 text-xs text-[#697184]">{subtitle}</p>}
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded bg-[#F0F1F4] px-3 py-1.5 text-xs text-[#555D6E]">
              <Shield aria-hidden="true" className="h-3.5 w-3.5" /> Password hanya tampil sekali
            </span>
            <button
              type="button"
              onClick={downloadMaskedResults}
              aria-label={`Unduh hasil akun ${entityType === "student" ? "siswa" : "guru"}`}
              title={`Unduh hasil akun ${entityType === "student" ? "siswa" : "guru"}`}
              className="rounded-md p-2 text-[#0756D9] transition-colors hover:bg-[#E8EFFF]"
            >
              <Download aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[760px] border-collapse text-left">
            <thead className="bg-[#F7F8FA] text-[11px] font-semibold uppercase tracking-[0.04em] text-[#555D6E]">
              <tr>
                <th scope="col" className="w-16 px-5 py-3">#</th>
                <th scope="col" className="px-4 py-3">{config.nameLabel}</th>
                <th scope="col" className="px-4 py-3">{config.identityLabel}</th>
                <th scope="col" className="w-48 px-4 py-3">Generated<br />Password</th>
                <th scope="col" className="w-28 px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DCE7] text-sm text-[#20232D]">
              {visibleRows.map((row, index) => {
                const status = getRowStatus(row);
                const rowNumber = ((page - 1) * PAGE_SIZE) + index + 1;
                return (
                  <tr key={row.id}>
                    <td className="px-5 py-3.5 text-[#555D6E]">{rowNumber}</td>
                    <td className="px-4 py-3.5 font-medium">{row.name}</td>
                    <td className="px-4 py-3.5 text-[#555D6E]">{row[config.identityKey]}</td>
                    <td className="px-4 py-3.5">
                      <code className="rounded bg-[#F3F4F6] px-2 py-1 font-sans text-xs text-[#555D6E]">{row.password || "-"}</code>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge className={cn(
                        "border px-2 py-1 font-medium",
                        status === "ready"
                          ? "border-emerald-200 bg-emerald-50 text-emerald-600"
                          : "border-red-200 bg-red-50 text-red-600",
                      )}>
                        <span aria-hidden="true">●</span>
                        {status === "ready" ? "Siap" : "Error"}
                      </Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between border-t border-[#D7DCE7] px-5 py-3 text-[11px] text-[#555D6E]">
          <p>Menampilkan {visibleRows.length} dari {rows.length} data</p>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Halaman sebelumnya"
              disabled={page === 1}
              onClick={() => setPage((current) => Math.max(1, current - 1))}
              className="rounded p-1.5 hover:bg-[#F0F1F4] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <span className="min-w-14 text-center">{page} / {pageCount}</span>
            <button
              type="button"
              aria-label="Halaman berikutnya"
              disabled={page === pageCount}
              onClick={() => setPage((current) => Math.min(pageCount, current + 1))}
              className="rounded p-1.5 hover:bg-[#F0F1F4] disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </div>
        </div>
      </section>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </>
  );
}
