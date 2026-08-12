import { BookOpenCheck, FileText, Lightbulb, Settings } from "lucide-react";

const pageContent = {
  grades: {
    icon: BookOpenCheck,
    title: "Nilai Saya",
    description: "Lihat rincian nilai dan bobot penilaian dari setiap mata pelajaran.",
  },
  report: {
    icon: FileText,
    title: "Rapor Saya",
    description: "Rapor akan tersedia setelah didistribusikan oleh sekolah.",
  },
  settings: {
    icon: Settings,
    title: "Pengaturan",
    description: "Kelola informasi akun dan preferensi dasar Anda.",
  },
  ai: {
    icon: Lightbulb,
    title: "Analisis AI",
    description: "Rekomendasi belajar AI sedang dipersiapkan dan tidak akan mengubah nilai, presensi, maupun kelulusan.",
  },
};

export default function StudentPlaceholderPage({ page }) {
  const content = pageContent[page] || pageContent.grades;
  const Icon = content.icon;
  return (
    <div className="px-4 py-10 sm:px-7">
      <section className="mx-auto max-w-3xl rounded-2xl border border-[#E4E8F1] bg-white p-8 shadow-soft">
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#EEF3FF] text-[#0756D9]"><Icon aria-hidden="true" className="h-6 w-6" /></span>
        <h1 className="mt-5 text-2xl font-bold text-[#20232D]">{content.title}</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748B]">{content.description}</p>
      </section>
    </div>
  );
}
