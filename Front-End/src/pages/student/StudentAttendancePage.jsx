import { CalendarCheck, CircleAlert, RefreshCw } from "lucide-react";
import { useEffect, useState } from "react";
import Spinner from "../../components/ui/Spinner";
import Button from "../../components/ui/Button";
import { getStudentAttendance } from "../../services/studentService";

export default function StudentAttendancePage() {
  const [state, setState] = useState("loading");
  const [attendance, setAttendance] = useState(null);

  const load = async () => {
    setState("loading");
    try {
      setAttendance(await getStudentAttendance());
      setState("loaded");
    } catch {
      setAttendance(null);
      setState("error");
    }
  };

  useEffect(() => { load(); }, []);

  return (
    <div className="px-4 py-8 sm:px-7 lg:px-10">
      <div className="mx-auto max-w-[1000px]">
        <header>
          <h1 className="text-[26px] font-bold tracking-[-0.035em] text-[#20232D]">Presensi Saya</h1>
          <p className="mt-1 text-sm text-[#697184]">Ringkasan kehadiran per mata pelajaran pada semester berjalan.</p>
        </header>

        {state === "loading" && <div role="status" className="flex min-h-[320px] items-center justify-center"><Spinner className="h-8 w-8 text-[#2F67ED]" /><span className="sr-only">Memuat presensi</span></div>}
        {state === "error" && (
          <section role="alert" className="mt-8 rounded-xl border border-red-100 bg-white p-8 text-center">
            <CircleAlert aria-hidden="true" className="mx-auto h-9 w-9 text-red-500" />
            <p className="mt-3 font-semibold">Data presensi belum dapat dimuat.</p>
            <Button onClick={load} className="mt-5"><RefreshCw aria-hidden="true" className="h-4 w-4" /> Coba Lagi</Button>
          </section>
        )}
        {state === "loaded" && attendance && (
          <>
            <section className="mt-7 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-[#0756D9] to-[#3F7CF4] p-6 text-white">
              <CalendarCheck aria-hidden="true" className="h-10 w-10" />
              <div><p className="text-sm text-white/80">Kehadiran keseluruhan</p><p className="text-3xl font-bold">{attendance.overallPercentage ?? attendance.percentage ?? 0}%</p></div>
            </section>
            <div className="mt-6 overflow-x-auto rounded-xl border border-[#E1E5ED] bg-white">
              <table className="w-full min-w-[720px] border-collapse text-sm">
                <thead className="bg-[#F4F6FA] text-left text-xs uppercase tracking-wide text-[#697184]"><tr><th className="px-5 py-4">Mata Pelajaran</th><th className="px-4 py-4 text-center">Hadir</th><th className="px-4 py-4 text-center">Izin</th><th className="px-4 py-4 text-center">Sakit</th><th className="px-4 py-4 text-center">Alpa</th><th className="px-5 py-4 text-right">Persentase</th></tr></thead>
                <tbody className="divide-y divide-[#E8EBF2]">
                  {(attendance.subjects || attendance.items || []).map((subject) => (
                    <tr key={subject.id || subject.subjectId}><td className="px-5 py-4 font-semibold text-[#20232D]">{subject.name || subject.subjectName}</td><td className="px-4 py-4 text-center">{subject.present ?? 0}</td><td className="px-4 py-4 text-center">{subject.permitted ?? 0}</td><td className="px-4 py-4 text-center">{subject.sick ?? 0}</td><td className="px-4 py-4 text-center">{subject.absent ?? 0}</td><td className="px-5 py-4 text-right font-bold text-[#0756D9]">{subject.percentage ?? 0}%</td></tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
