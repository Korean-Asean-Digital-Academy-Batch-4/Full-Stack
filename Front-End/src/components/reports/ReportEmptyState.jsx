import { FileChartColumn, Printer, TableProperties } from "lucide-react";

export default function ReportEmptyState({ noStudents = false }) {
  return (
    <section className="mx-auto mt-14 max-w-2xl text-center">
      <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-[28px] bg-white shadow-soft">
        <FileChartColumn aria-hidden="true" className="h-11 w-11 text-[#7C8FF5]" strokeWidth={1.7} />
      </div>
      <h2 className="mt-7 text-2xl font-bold tracking-[-0.03em] text-[#202838]">{noStudents ? "Belum ada siswa pada kelas ini" : "Rapor Siswa"}</h2>
      <p className="mx-auto mt-3 max-w-lg text-sm leading-6 text-[#64748B]">
        {noStudents
          ? "Daftar rapor belum dapat disusun karena kelas belum memiliki siswa aktif."
          : "Pilih filter di atas untuk melihat daftar status rapor siswa dan memulai proses generate otomatis."}
      </p>
      {!noStudents && (
        <div className="mt-9 grid gap-3 text-left sm:grid-cols-2">
          <article className="rounded-xl border border-[#E7E9F2] bg-white p-4 shadow-sm">
            <TableProperties aria-hidden="true" className="h-5 w-5 text-[#7357F6]" />
            <h3 className="mt-3 text-sm font-bold">Integrasi Nilai</h3>
            <p className="mt-1.5 text-xs leading-5 text-[#64748B]">Nilai tugas, ulangan harian, UTS, dan UAS diambil dari data nilai yang telah tersimpan.</p>
          </article>
          <article className="rounded-xl border border-[#E7E9F2] bg-white p-4 shadow-sm">
            <Printer aria-hidden="true" className="h-5 w-5 text-[#10B981]" />
            <h3 className="mt-3 text-sm font-bold">Siap Export dan Cetak</h3>
            <p className="mt-1.5 text-xs leading-5 text-[#64748B]">Rapor dapat diunduh setelah data diperiksa dan difinalisasi wali kelas.</p>
          </article>
        </div>
      )}
    </section>
  );
}
