import { Info } from "lucide-react";

export default function HomeroomInformation({ className }) {
  return (
    <section className="mt-8 flex items-start gap-3 rounded-xl border border-violet-100 bg-[#F7F2FF] px-5 py-4 text-violet-700">
      <Info aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" />
      <div>
        <h2 className="text-sm font-semibold">Informasi Wali Kelas</h2>
        <p className="mt-1 text-xs leading-5">
          Anda juga ditugaskan sebagai Wali Kelas {className}. Anda dapat memantau kelengkapan nilai seluruh mata pelajaran pada kelas wali, tetapi hanya dapat mengubah nilai pada mata pelajaran yang menjadi penugasan Anda.
        </p>
      </div>
    </section>
  );
}
