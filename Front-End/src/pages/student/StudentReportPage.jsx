import { Download, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import StudentPeriodFilter from "../../components/student/StudentPeriodFilter";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Spinner from "../../components/ui/Spinner";
import Toast from "../../components/ui/Toast";
import { downloadStudentReport, getStudentReport } from "../../services/studentService";
import { getStoredUser } from "../../stores/authStore";

const defaultPeriod = { academicYear: "2026/2027", semester: "Semester Ganjil" };

export default function StudentReportPage() {
  const user = getStoredUser();
  const activePeriod = user?.academicPeriod ? {
    academicYear: user.academicPeriod.academicYear,
    semester: `Semester ${user.academicPeriod.semester}`,
  } : defaultPeriod;
  const [selectedAcademicYear, setSelectedAcademicYear] = useState(activePeriod.academicYear);
  const [selectedSemester, setSelectedSemester] = useState(activePeriod.semester);
  const [report, setReport] = useState(null);
  const [status, setStatus] = useState("loading");
  const [toast, setToast] = useState(null);
  const [downloading, setDownloading] = useState(false);

  const loadReport = async () => {
    setStatus("loading");
    try {
      const result = await getStudentReport({ academicYear: selectedAcademicYear, semester: selectedSemester });
      setReport(result);
      setStatus("loaded");
    } catch {
      setReport(null);
      setStatus("error");
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const isDistributed = report?.status === "Distributed";

  const downloadReport = async () => {
    setDownloading(true);
    try {
      await downloadStudentReport();
      setToast({ type: "success", message: "File rapor berhasil diunduh." });
    } catch {
      setToast({ type: "error", message: "Rapor belum dapat diunduh." });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1100px]">
        <header className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-[26px] font-bold tracking-[-0.035em] text-[#20232D]">Rapor Siswa</h1>
            <p className="mt-1 text-sm text-[#5B6476]">Ringkasan capaian akademik semester ini untuk {user.name}.</p>
          </div>
          {isDistributed && (
            <Button
              onClick={downloadReport}
              loading={downloading}
              disabled={downloading}
              className="h-11 self-start px-5"
            >
              <Download aria-hidden="true" className="h-4 w-4" /> {downloading ? "Menyiapkan file..." : "Download Rapor"}
            </Button>
          )}
        </header>

        <div className="mt-7 grid gap-4 lg:grid-cols-[minmax(0,1fr)_150px_150px]">
          <StudentPeriodFilter
            academicYear={selectedAcademicYear}
            semester={selectedSemester}
            onAcademicYearChange={setSelectedAcademicYear}
            onSemesterChange={setSelectedSemester}
            onSubmit={loadReport}
            loading={status === "loading"}
            card
          />
          {isDistributed && (
            <>
              <article className="rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(30,42,75,0.05)]">
                <p className="text-[10px] font-medium uppercase text-[#697184]">Rata-rata Nilai</p>
                <p className="mt-3 text-[30px] font-bold tracking-[-0.04em] text-[#20232D]">{report.average}</p>
              </article>
              <article className="rounded-xl bg-white p-4 shadow-[0_2px_8px_rgba(30,42,75,0.05)]">
                <p className="text-[10px] font-medium uppercase text-[#697184]">Kehadiran</p>
                <p className="mt-3 whitespace-nowrap text-[30px] font-bold tracking-[-0.04em] text-[#20232D]">{report.attendancePercentage}% <span className="text-xs font-medium tracking-normal text-[#4E5667]">Hadir</span></p>
              </article>
            </>
          )}
        </div>

        {status === "loading" && (
          <div role="status" className="flex min-h-[330px] items-center justify-center"><Spinner className="h-8 w-8 text-[#2F67ED]" /><span className="sr-only">Memuat rapor siswa</span></div>
        )}

        {status === "error" && (
          <section role="alert" className="mt-8 rounded-xl border border-red-100 bg-white p-8 text-center">
            <p className="font-semibold">Rapor belum dapat dimuat.</p>
            <button type="button" onClick={loadReport} className="mt-3 text-sm font-semibold text-[#0756D9] hover:underline">Coba Lagi</button>
          </section>
        )}

        {status === "loaded" && !isDistributed && (
          <div className="mt-8"><EmptyState icon={FileText} title="Rapor belum tersedia" description="Rapor semester ini belum didistribusikan oleh Wali Kelas." /></div>
        )}

        {status === "loaded" && isDistributed && (
          <>
            <div className="mt-8 overflow-x-auto">
              <table className="w-full min-w-[560px] border-collapse text-left">
                <thead className="bg-[#F0F1FF] text-xs font-semibold uppercase tracking-[0.05em] text-[#4D5567]">
                  <tr><th className="px-5 py-4">Mata Pelajaran</th><th className="w-[190px] px-5 py-4 text-center">Nilai</th></tr>
                </thead>
                <tbody className="bg-white">
                  {report.subjects.map((subject) => (
                    <tr key={subject.id} className="border-b border-[#D8DDE8] last:border-0">
                      <td className="px-5 py-4 font-semibold text-[#20232D]">{subject.name}</td>
                      <td className="px-5 py-4 text-center font-bold text-[#20232D]">{subject.score ?? "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <section className="mt-8 rounded-2xl border border-[#C8CDFB] bg-gradient-to-r from-[#F0EEFF] to-[#EAF1FF] px-6 py-7 sm:px-12">
              <h2 className="font-bold text-[#20232D]">CATATAN GURU</h2>
              <p className="mt-2 text-sm leading-6 text-[#565E70]">{report.teacherNote}</p>
            </section>
          </>
        )}
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  );
}
