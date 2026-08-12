import { ArrowRight, LoaderCircle } from "lucide-react";

const buttonClassName =
  "mt-6 inline-flex h-10 items-center gap-2 rounded-lg bg-[#9364EC] px-5 text-sm font-semibold text-white transition hover:bg-[#A273F2] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-[#9364EC]";

export default function AiInsightCard({ status, insight, studentName, onAnalyze, onStartLearning }) {
  const isLoading = status === "loading";
  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <article
      aria-busy={isLoading}
      aria-live="polite"
      className="min-h-[178px] rounded-[14px] bg-gradient-to-r from-[#7857F2] to-[#3F7CF4] px-6 py-6 text-white shadow-[0_4px_10px_rgba(85,91,226,0.22)]"
    >
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-lg font-semibold">{isSuccess ? "Hasil Analisis AI" : "Analisis AI"}</h2>
        {isSuccess && insight.isPartialData && <span className="rounded-full bg-white/20 px-2.5 py-1 text-[11px] font-semibold">Data Sementara</span>}
      </div>
      <p className="mt-3 max-w-[620px] text-sm leading-5 text-white/95">
        {isSuccess
          ? `Tetap semangat, ${studentName}! ${insight.recommendationParagraph}`
          : "Apakah kamu membutuhkan analisa dan insight dari AI, beserta rekomendasi belajar lanjutan? AI akan siap kapanpun kamu membutuhkan bantuan!"}
      </p>
      {isSuccess && insight.bullets?.length > 0 && (
        <ul className="mt-4 list-disc space-y-1 pl-5 text-sm text-white/95">
          {insight.bullets.map((item) => <li key={item}>{item}</li>)}
        </ul>
      )}
      {isSuccess && insight.actionOptions?.length > 0 && (
        <div className="mt-4 grid gap-2 sm:grid-cols-2">
          {insight.actionOptions.map((item, index) => <div key={item} className="rounded-lg bg-white/15 px-3 py-2 text-xs"><strong>Opsi {index + 1}:</strong> {item}</div>)}
        </div>
      )}
      {isError && (
        <p role="alert" className="mt-2 text-sm font-medium text-white">
          Analisis belum dapat dibuat. Silakan coba kembali.
        </p>
      )}
      <button
        type="button"
        onClick={isSuccess ? onStartLearning : onAnalyze}
        disabled={isLoading}
        className={buttonClassName}
      >
        {isLoading ? (
          <>
            Mulai Analisa <LoaderCircle aria-hidden="true" className="h-4 w-4 animate-spin" />
          </>
        ) : (
          <>
            {isSuccess ? "Mulai Belajar" : isError ? "Coba Lagi" : "Mulai Analisa"}
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </>
        )}
      </button>
    </article>
  );
}
