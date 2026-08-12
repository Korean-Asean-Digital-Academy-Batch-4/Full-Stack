import { AlertCircle, LoaderCircle, RefreshCw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import GradeTable from "../../components/grades/GradeTable";
import Button from "../../components/ui/Button";
import { getHomeroomSubjectGrades } from "../../services/gradeService";
import { getHomeroomWorkspace } from "../../services/homeroomService";
import { getStoredUser } from "../../stores/authStore";
import { getActiveHomeroomClassId } from "../../utils/teacherPermissions";

export default function TeacherSubjectGradesPage() {
  const user = getStoredUser();
  const classId = getActiveHomeroomClassId(user);
  const [subjects, setSubjects] = useState([]);
  const [subjectId, setSubjectId] = useState("");
  const [data, setData] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const period = user?.academicPeriod || { academicYear: "-", semester: "-" };

  useEffect(() => { getHomeroomWorkspace(classId).then((workspace) => { const items = workspace.completeness?.subjects || []; setSubjects(items); setSubjectId(items[0]?.subjectId || items[0]?.id || ""); setState("ready"); }).catch((requestError) => { setError(requestError.message); setState("error"); }); }, [classId]);
  const load = async () => { if (!subjectId) return; setState("loading"); try { setData(await getHomeroomSubjectGrades({ ...period, subjectId })); setState("ready"); } catch (requestError) { setError(requestError.message); setState("error"); } };
  const sorted = useMemo(() => [...(data?.students || [])].sort((a, b) => sortDirection === "asc" ? a.name.localeCompare(b.name, "id") : b.name.localeCompare(a.name, "id")), [data?.students, sortDirection]);

  return <main className="mx-auto max-w-[1150px] px-4 py-8 sm:px-7"><header><h1 className="text-3xl font-bold text-[#20232D]">Nilai Kelas Wali</h1><p className="mt-2 text-sm text-[#697184]">Nilai yang sudah disimpan guru mapel untuk kelas {user?.homeroomAssignment?.className || "wali"}.</p></header>
    <section className="mt-6 flex flex-col gap-3 rounded-xl border bg-white p-4 sm:flex-row sm:items-end"><label className="flex-1 text-xs font-semibold text-[#697184]">MATA PELAJARAN<select value={subjectId} onChange={(event) => { setSubjectId(event.target.value); setData(null); }} className="mt-2 h-10 w-full rounded-md border px-3 text-sm"><option value="">Pilih mapel</option>{subjects.map((subject) => <option key={subject.subjectId || subject.id} value={subject.subjectId || subject.id}>{subject.subjectName || subject.name} · {subject.teacherName || "Guru"}</option>)}</select></label><Button onClick={load} disabled={!subjectId}><RefreshCw className="h-4 w-4" /> Tampilkan</Button></section>
    {state === "loading" ? <div className="flex min-h-[300px] items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin text-[#0756D9]" /></div> : state === "error" ? <section role="alert" className="mt-8 rounded-xl border border-red-100 bg-white p-10 text-center"><AlertCircle className="mx-auto h-9 w-9 text-red-500" /><p className="mt-3 text-red-700">{error || "Nilai gagal dimuat."}</p></section> : data ? <div className="mt-6"><div className="mb-4 rounded-lg bg-blue-50 p-4 text-sm text-blue-800"><strong>{data.subject.name}</strong> · Guru {data.subject.teacher_name} · KKM {data.subject.kkm}</div><GradeTable students={sorted} components={data.components} grades={data.grades} finalGrades={data.finalGrades} kkm={Number(data.subject.kkm)} sortDirection={sortDirection} onSort={() => setSortDirection((value) => value === "asc" ? "desc" : "asc")} readOnly /></div> : <p className="mt-8 rounded-xl border bg-white p-12 text-center text-[#697184]">Pilih mata pelajaran untuk melihat nilai nyata.</p>}
  </main>;
}
