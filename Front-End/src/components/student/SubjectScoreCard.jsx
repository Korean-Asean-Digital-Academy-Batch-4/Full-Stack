import { BookOpen, Calculator, FlaskConical } from "lucide-react";

const icons = {
  calculator: Calculator,
  science: FlaskConical,
  book: BookOpen,
};

const accentStyles = {
  emerald: {
    icon: "bg-[#EAF2FF] text-[#1463E6]",
    progress: "bg-[#10B981]",
  },
  blue: {
    icon: "bg-[#F2ECFF] text-[#7C3AED]",
    progress: "bg-[#0756D9]",
  },
};

export default function SubjectScoreCard({ subject }) {
  const Icon = icons[subject.icon] || BookOpen;
  const styles = accentStyles[subject.accent] || accentStyles.emerald;

  return (
    <article className="rounded-[14px] border border-[#D7DCE8] bg-white p-5 shadow-[0_1px_3px_rgba(30,42,75,0.03)]">
      <div className="flex items-start justify-between gap-3">
        <span className={`flex h-10 w-10 items-center justify-center rounded-full ${styles.icon}`}>
          <Icon aria-hidden="true" className="h-5 w-5" strokeWidth={1.9} />
        </span>
        <span className="rounded bg-[#F3F3FF] px-2.5 py-1 text-[11px] font-medium text-[#545968]">{subject.status}</span>
      </div>
      <h3 className="mt-7 text-[17px] font-semibold leading-5 text-[#20232D]">{subject.name}</h3>
      <div className="mt-2 h-2 overflow-hidden rounded-full bg-[#EEF1F6]" role="progressbar" aria-label={`Nilai ${subject.name}`} aria-valuemin="0" aria-valuemax="100" aria-valuenow={subject.score}>
        <div className={`h-full rounded-full ${styles.progress}`} style={{ width: `${subject.score}%` }} />
      </div>
      <p className="mt-2 text-right text-sm text-[#545968]">
        <span className="text-lg font-semibold text-[#20232D]">{subject.score}%</span> /100%
      </p>
    </article>
  );
}
