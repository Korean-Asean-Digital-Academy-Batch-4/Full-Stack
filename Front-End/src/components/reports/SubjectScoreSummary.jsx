import { assessmentComponents } from "../../data/assessmentComponents";

export default function SubjectScoreSummary({ assignment, report, reportViewMode = "subject" }) {
  return (
    <article className="rounded-2xl border border-[#E7EAF1] bg-white p-5 shadow-sm lg:row-span-2">
      <div className="flex items-start justify-between gap-3"><div><h2 className="font-bold text-[#202838]">Rangkuman Nilai Mapel</h2><p className="mt-1 text-xs text-[#64748B]">Mode: {reportViewMode === "subject" ? "Rapor mata pelajaran" : "Rapor semester"}</p></div><span className="text-2xl font-bold text-[#2F67ED]">{report.finalGrade}</span></div>
      <div className="mt-5 divide-y divide-[#ECEEF4]">
        {assessmentComponents.map((component) => (
          <div key={component.id} className="flex items-center justify-between py-3 text-sm"><span className="text-[#52596A]">{component.label} <small className="text-[#9AA0AD]">({component.weight}%)</small></span><strong>{report.scores[component.id]}</strong></div>
        ))}
      </div>
      <div className="mt-4 rounded-xl bg-[#F3F3FF] px-4 py-3 text-sm"><span className="text-[#646A7A]">{assignment.subjectName}</span><strong className="float-right text-[#202838]">{report.finalGrade}</strong></div>
    </article>
  );
}
