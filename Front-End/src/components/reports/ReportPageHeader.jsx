import { FileChartColumn } from "lucide-react";

export default function ReportPageHeader() {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#7C3AED]">Rapor Mata Pelajaran</p>
        <h1 className="mt-2 text-2xl font-bold tracking-[-0.03em] text-[#202838] sm:text-[28px]">Generate Rapor Mapel</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748B]">
          Susun rangkuman nilai dan catatan hasil belajar siswa berdasarkan data yang telah tersimpan.
        </p>
      </div>
      <div className="inline-flex h-10 items-center gap-2 self-start rounded-lg bg-[#EEF2FF] px-4 text-xs font-semibold text-[#5B44D6]">
        <FileChartColumn aria-hidden="true" className="h-4 w-4" /> Kompilasi data resmi
      </div>
    </div>
  );
}
