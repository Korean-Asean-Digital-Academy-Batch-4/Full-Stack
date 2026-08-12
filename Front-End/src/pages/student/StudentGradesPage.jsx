import { ChevronDown, ChevronUp, CircleAlert } from "lucide-react";
import { useEffect, useState } from "react";
import StudentPeriodFilter from "../../components/student/StudentPeriodFilter";
import Spinner from "../../components/ui/Spinner";
import { getStudentGrades } from "../../services/studentService";
import { getStoredUser } from "../../stores/authStore";

const defaultPeriod = { academicYear: "2026/2027", semester: "Semester Ganjil" };

function getActivePeriod() {
  const period = getStoredUser()?.academicPeriod;
  return period ? {
    academicYear: period.academicYear,
    semester: `Semester ${period.semester}`,
  } : defaultPeriod;
}

export default function StudentGradesPage() {
  const activePeriod = getActivePeriod();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(activePeriod.academicYear);
  const [selectedSemester, setSelectedSemester] = useState(activePeriod.semester);
  const [expandedSubjectId, setExpandedSubjectId] = useState("math");
  const [subjects, setSubjects] = useState([]);
  const [status, setStatus] = useState("loading");

  const loadGrades = async () => {
    setStatus("loading");
    try {
      const result = await getStudentGrades({ academicYear: selectedAcademicYear, semester: selectedSemester });
      setSubjects(result);
      setExpandedSubjectId(result.some((subject) => subject.id === "math") ? "math" : result[0]?.id ?? null);
      setStatus("loaded");
    } catch {
      setSubjects([]);
      setStatus("error");
    }
  };

  useEffect(() => {
    loadGrades();
  }, []);

  return (
    <div className="px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[980px]">
        <header>
          <h1 className="text-[26px] font-bold tracking-[-0.035em] text-[#20232D]">Rincian Nilai</h1>
          <p className="mt-1 text-sm text-[#697184]">Pantau perkembangan akademik Anda secara mendetail.</p>
        </header>

        <div className="mt-7 max-w-[390px]">
          <StudentPeriodFilter
            academicYear={selectedAcademicYear}
            semester={selectedSemester}
            onAcademicYearChange={setSelectedAcademicYear}
            onSemesterChange={setSelectedSemester}
            onSubmit={loadGrades}
            loading={status === "loading"}
          />
        </div>

        {status === "loading" && (
          <div role="status" className="flex min-h-[320px] items-center justify-center">
            <Spinner className="h-8 w-8 text-[#2F67ED]" />
            <span className="sr-only">Memuat rincian nilai</span>
          </div>
        )}

        {status === "error" && (
          <section role="alert" className="mt-8 rounded-xl border border-red-100 bg-white p-8 text-center">
            <CircleAlert aria-hidden="true" className="mx-auto h-8 w-8 text-red-500" />
            <p className="mt-3 font-semibold">Rincian nilai belum dapat dimuat.</p>
            <button type="button" onClick={loadGrades} className="mt-4 text-sm font-semibold text-[#0756D9] hover:underline">Coba Lagi</button>
          </section>
        )}

        {status === "loaded" && subjects.length === 0 && (
          <section className="mt-8 rounded-xl border border-[#E1E5ED] bg-white p-8 text-center">
            <h2 className="font-bold">Nilai belum tersedia</h2>
            <p className="mt-2 text-sm text-[#697184]">Belum ada rincian nilai untuk periode yang dipilih.</p>
          </section>
        )}

        {status === "loaded" && subjects.length > 0 && (
          <section aria-label="Daftar nilai per mata pelajaran" className="mt-7 space-y-3">
            {subjects.map((subject) => {
              const expanded = expandedSubjectId === subject.id;
              const Chevron = expanded ? ChevronUp : ChevronDown;
              return (
                <article key={subject.id} className="overflow-hidden rounded-xl border border-[#E1E5ED] bg-white shadow-[0_1px_3px_rgba(30,42,75,0.04)]">
                  <button
                    type="button"
                    aria-expanded={expanded}
                    aria-controls={`subject-details-${subject.id}`}
                    onClick={() => setExpandedSubjectId(expanded ? null : subject.id)}
                    className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left hover:bg-[#FAFBFD]"
                  >
                    <span>
                      <span className="block font-bold text-[#20232D]">{subject.subject}</span>
                      <span className="mt-1 block text-xs text-[#697184]">
                        Rata-rata:{" "}
                        <span className={subject.complete ? "rounded bg-emerald-50 px-2 py-1 font-medium text-emerald-700" : "rounded bg-slate-100 px-2 py-1 font-medium text-slate-600"}>
                          {subject.average == null ? "Belum lengkap" : subject.average.toFixed(1)}
                        </span>
                      </span>
                    </span>
                    <Chevron aria-hidden="true" className="h-5 w-5 shrink-0 text-[#7A8497]" />
                  </button>

                  {expanded && (
                    <div id={`subject-details-${subject.id}`} className="border-t border-[#E9ECF2] px-5 pb-5 pt-3">
                      {subject.components.length === 0 ? (
                        <p className="py-8 text-center text-sm text-[#697184]">Rincian nilai belum lengkap.</p>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full min-w-[650px] border-collapse text-sm">
                            <thead>
                              <tr className="border-b border-[#E1E5ED] text-left text-[11px] font-semibold uppercase tracking-[0.05em] text-[#747D90]">
                                <th className="px-2 py-3">Komponen</th>
                                <th className="px-2 py-3">Topik Materi</th>
                                <th className="px-2 py-3 text-right">Nilai</th>
                                <th className="px-2 py-3 text-right">Bobot</th>
                              </tr>
                            </thead>
                            <tbody>
                              {subject.components.map((component) => (
                                <tr key={component.id} className="border-b border-[#EEF0F4] last:border-0">
                                  <td className="px-2 py-4 font-medium text-[#252B38]">{component.name}</td>
                                  <td className="px-2 py-4 text-[#5B6476]">{component.topic || "-"}</td>
                                  <td className="px-2 py-4 text-right font-medium text-[#252B38]">{component.score ?? "-"}</td>
                                  <td className="px-2 py-4 text-right text-[#697184]">{component.weight == null ? "-" : `${component.weight}%`}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  )}
                </article>
              );
            })}
          </section>
        )}
      </div>
    </div>
  );
}
