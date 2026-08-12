import { BarChart3, Sparkles } from "lucide-react";

export default function HomeroomGradeEmptyState({ noStudents = false }) {
  return (
    <section className="flex flex-col items-center py-16 text-center sm:py-24">
      <div className="relative flex h-36 w-36 items-center justify-center rounded-full bg-white shadow-soft">
        <BarChart3 aria-hidden="true" className="h-14 w-14 text-[#4C7DF0]" strokeWidth={1.8} />
        <span className="absolute -right-1 top-0 flex h-10 w-10 items-center justify-center rounded-full bg-[#D8A4FF] text-white shadow-md">
          <Sparkles aria-hidden="true" className="h-4 w-4" />
        </span>
        <span className="absolute -left-3 bottom-4 h-8 w-8 rounded-full bg-[#FFB66C] shadow-md" />
      </div>
      <h2 className="mt-11 text-xl font-bold text-[#202838]">
        {noStudents ? "Belum ada siswa" : "Lihat Nilai Siswa"}
      </h2>
      <p className="mt-3 max-w-[520px] text-sm leading-6 text-[#64748B]">
        {noStudents
          ? "Belum ada siswa pada kelas wali Anda."
          : "Pilih filter di atas untuk memuat daftar siswa dan melihat nilai siswa kelas Anda."}
      </p>
    </section>
  );
}
