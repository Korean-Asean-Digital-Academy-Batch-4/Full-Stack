import { AlertCircle, BookOpenCheck, CirclePlus, Download, LoaderCircle, RefreshCw, School, Settings2, Upload, UsersRound } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import {
  addClassSubject,
  createClass,
  downloadClassStudentTemplate,
  getClassDetail,
  getClasses,
  getSemesters,
  getSubjects,
  getTeachers,
  importClassStudents,
  setClassHomeroomTeacher,
} from "../../services/adminService";

export default function ClassAssignmentPage({ gradeLevel }) {
  const [classes, setClasses] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState(null);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [semesters, setSemesters] = useState([]);
  const [form, setForm] = useState({ name: "", semesterId: "" });
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [manageOpen, setManageOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [homeroomTeacherId, setHomeroomTeacherId] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [studentFile, setStudentFile] = useState(null);
  const [manageError, setManageError] = useState("");
  const [manageMessage, setManageMessage] = useState("");
  const [manageSaving, setManageSaving] = useState(false);

  const loadClasses = useCallback(async () => {
    setState("loading"); setError("");
    try {
      const items = await getClasses({ gradeLevel });
      setClasses(items);
      const nextId = items.some((item) => item.id === selectedId) ? selectedId : items[0]?.id || "";
      setSelectedId(nextId);
      setDetail(nextId ? await getClassDetail(nextId) : null);
      setState("ready");
    } catch (requestError) { setError(requestError.message || "Data kelas gagal dimuat."); setState("error"); }
  }, [gradeLevel, selectedId]);

  useEffect(() => { loadClasses(); }, [gradeLevel]);

  const selectClass = async (classId) => {
    setSelectedId(classId); setState("loading");
    try { setDetail(await getClassDetail(classId)); setState("ready"); }
    catch (requestError) { setError(requestError.message); setState("error"); }
  };

  const openCreate = async () => {
    setModalOpen(true); setFormError("");
    try {
      const items = await getSemesters();
      setSemesters(items);
      const active = items.find((item) => item.is_active) || items[0];
      setForm({ name: "", semesterId: active?.id || "" });
    } catch (requestError) { setFormError(requestError.message); }
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!form.name.trim() || !form.semesterId) { setFormError("Nama kelas dan semester wajib dipilih."); return; }
    setSaving(true); setFormError("");
    try { await createClass({ name: form.name.trim(), gradeLevel, semesterId: form.semesterId }); setModalOpen(false); await loadClasses(); }
    catch (requestError) { setFormError(requestError.message || "Kelas gagal dibuat."); }
    finally { setSaving(false); }
  };

  const refreshSelectedClass = async () => {
    const [classItems, classDetail] = await Promise.all([
      getClasses({ gradeLevel }),
      getClassDetail(selectedId),
    ]);
    setClasses(classItems);
    setDetail(classDetail);
    return classDetail;
  };

  const openManage = async () => {
    setManageOpen(true); setManageError(""); setManageMessage(""); setStudentFile(null);
    try {
      const [teacherResponse, subjectItems] = await Promise.all([getTeachers(), getSubjects()]);
      const matchingSubjects = subjectItems.filter((item) => item.level === gradeLevel && !detail.subjects.some((assigned) => assigned.id === item.id));
      setTeachers(teacherResponse.items);
      setSubjects(matchingSubjects);
      setHomeroomTeacherId(detail.homeroom_teacher_id || teacherResponse.items[0]?.id || "");
      setSubjectId(matchingSubjects[0]?.id || "");
    } catch (requestError) { setManageError(requestError.message || "Data penugasan gagal dimuat."); }
  };

  const runManageAction = async (action, successMessage) => {
    setManageSaving(true); setManageError(""); setManageMessage("");
    try {
      const result = await action();
      const nextDetail = await refreshSelectedClass();
      setManageMessage(typeof successMessage === "function" ? successMessage(result) : successMessage);
      const remainingSubjects = (await getSubjects()).filter((item) => item.level === gradeLevel && !nextDetail.subjects.some((assigned) => assigned.id === item.id));
      setSubjects(remainingSubjects); setSubjectId(remainingSubjects[0]?.id || ""); setStudentFile(null);
    } catch (requestError) { setManageError(requestError.message || "Penugasan gagal disimpan."); }
    finally { setManageSaving(false); }
  };

  return <main className="mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-bold text-[#20232D]">Penugasan Kelas {gradeLevel}</h1><p className="mt-2 text-sm text-[#697184]">Kelas, siswa, wali kelas, dan mapel dari database periode akademik.</p></div><div className="flex gap-2"><Button variant="secondary" onClick={loadClasses}><RefreshCw className="h-4 w-4" /> Muat Ulang</Button><Button onClick={openCreate}><CirclePlus className="h-4 w-4" /> Buat Kelas</Button></div></header>
    {state === "error" ? <section role="alert" className="mt-8 rounded-xl border border-red-100 bg-white p-10 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-3 text-red-700">{error}</p></section> : <div className="mt-7 grid gap-5 lg:grid-cols-[300px_1fr]">
      <aside className="overflow-hidden rounded-xl border border-[#D7DCE7] bg-white"><h2 className="border-b bg-[#F5F7FA] px-4 py-3 text-sm font-semibold">Daftar Kelas ({classes.length})</h2>{state === "loading" && !classes.length ? <LoaderCircle className="mx-auto my-10 h-6 w-6 animate-spin text-[#0756D9]" /> : classes.length ? <div className="divide-y">{classes.map((item) => <button key={item.id} type="button" onClick={() => selectClass(item.id)} className={`w-full px-4 py-4 text-left hover:bg-[#F3F7FF] ${item.id === selectedId ? "bg-[#EAF1FF]" : ""}`}><p className="font-semibold text-[#20232D]">{item.name}</p><p className="mt-1 text-xs text-[#697184]">{item.student_count} siswa · {item.subject_count} mapel</p></button>)}</div> : <p className="p-8 text-center text-sm text-[#697184]">Belum ada kelas pada jenjang ini.</p>}</aside>
      <section className="rounded-xl border border-[#D7DCE7] bg-white p-5">{state === "loading" && selectedId ? <div className="py-20 text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-[#0756D9]" /></div> : detail ? <><div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between"><div><h2 className="text-xl font-bold">{detail.name}</h2><p className="mt-1 text-sm text-[#697184]">Jenjang {detail.grade_level}</p></div><Button variant="secondary" className="h-10" onClick={openManage}><Settings2 className="h-4 w-4" /> Kelola Penugasan</Button></div><div className="mt-5 grid gap-3 sm:grid-cols-3"><Summary icon={UsersRound} label="Siswa" value={detail.students.length} /><Summary icon={BookOpenCheck} label="Mapel" value={detail.subjects.length} /><Summary icon={School} label="Wali Kelas" value={detail.homeroom_teacher_name || "Belum ditetapkan"} /></div><h3 className="mt-7 font-bold">Mata Pelajaran</h3><div className="mt-3 divide-y rounded-lg border">{detail.subjects.length ? detail.subjects.map((subject) => <div key={subject.id} className="flex justify-between gap-4 px-4 py-3 text-sm"><span className="font-semibold">{subject.name}</span><span className="text-[#697184]">{subject.teacher_name} · KKM {subject.kkm}</span></div>) : <p className="p-5 text-sm text-[#697184]">Belum ada mapel yang dihubungkan.</p>}</div><h3 className="mt-7 font-bold">Siswa Terdaftar</h3><div className="mt-3 max-h-[300px] overflow-auto divide-y rounded-lg border">{detail.students.length ? detail.students.map((student) => <div key={student.id} className="flex justify-between px-4 py-3 text-sm"><span className="font-medium">{student.name}</span><span className="font-mono text-xs text-[#697184]">{student.nis}</span></div>) : <p className="p-5 text-sm text-[#697184]">Belum ada siswa di kelas ini.</p>}</div></> : <p className="py-20 text-center text-[#697184]">Pilih kelas untuk melihat penugasan.</p>}</section>
    </div>}
    <Modal open={modalOpen} onClose={() => !saving && setModalOpen(false)} title={`Buat Kelas ${gradeLevel}`} description="Kelas akan disimpan ke periode semester yang dipilih."><form onSubmit={submit} className="space-y-4"><label className="block text-sm font-semibold">Nama Kelas<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder={`Contoh: ${gradeLevel} IPA 1`} className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-[#0756D9]" /></label><label className="block text-sm font-semibold">Semester<select value={form.semesterId} onChange={(event) => setForm((current) => ({ ...current, semesterId: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border px-3">{semesters.map((item) => <option key={item.id} value={item.id}>{item.academic_year_name} · {item.name}{item.is_active ? " (Aktif)" : ""}</option>)}</select></label>{formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}<div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button type="submit" loading={saving}>Simpan Kelas</Button></div></form></Modal>
    <Modal open={manageOpen} onClose={() => !manageSaving && setManageOpen(false)} title={`Kelola ${detail?.name || "Kelas"}`} description="Tetapkan wali kelas, hubungkan mata pelajaran, dan masukkan siswa terdaftar." panelClassName="max-w-xl">
      <div className="space-y-6">
        <section><h3 className="text-sm font-bold">Wali Kelas</h3><div className="mt-2 flex gap-2"><select value={homeroomTeacherId} onChange={(event) => setHomeroomTeacherId(event.target.value)} className="h-11 min-w-0 flex-1 rounded-lg border px-3"><option value="">Pilih guru</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name}</option>)}</select><Button className="h-11" disabled={!homeroomTeacherId} loading={manageSaving} onClick={() => runManageAction(() => setClassHomeroomTeacher(selectedId, homeroomTeacherId), "Wali kelas berhasil ditetapkan.")}>Tetapkan</Button></div></section>
        <section><h3 className="text-sm font-bold">Mata Pelajaran Kelas</h3><div className="mt-2 flex gap-2"><select value={subjectId} onChange={(event) => setSubjectId(event.target.value)} disabled={!subjects.length} className="h-11 min-w-0 flex-1 rounded-lg border px-3"><option value="">{subjects.length ? "Pilih mata pelajaran" : "Semua mapel jenjang sudah terhubung"}</option>{subjects.map((subject) => <option key={subject.id} value={subject.id}>{subject.name} · {subject.teacher.name}</option>)}</select><Button className="h-11" disabled={!subjectId} loading={manageSaving} onClick={() => runManageAction(() => addClassSubject(selectedId, subjectId), "Mata pelajaran berhasil dihubungkan.")}>Hubungkan</Button></div></section>
        <section><div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold">Siswa Kelas</h3><button type="button" onClick={downloadClassStudentTemplate} className="inline-flex items-center gap-1 text-xs font-semibold text-[#0756D9] hover:underline"><Download className="h-3.5 w-3.5" /> Unduh Template</button></div><input type="file" accept=".xlsx,.xls" onChange={(event) => setStudentFile(event.target.files?.[0] || null)} className="mt-2 block w-full rounded-lg border p-2 text-sm" /><Button className="mt-3 h-11 w-full" disabled={!studentFile} loading={manageSaving} onClick={() => runManageAction(() => importClassStudents(selectedId, studentFile), (result) => `${result.addedCount} siswa berhasil dimasukkan${result.failedRows?.length ? `, ${result.failedRows.length} baris gagal.` : "."}`)}><Upload className="h-4 w-4" /> Unggah Daftar Siswa</Button></section>
        {manageError && <p role="alert" className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{manageError}</p>}{manageMessage && <p role="status" className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{manageMessage}</p>}
      </div>
    </Modal>
  </main>;
}

function Summary({ icon: Icon, label, value }) { return <article className="rounded-lg bg-[#F5F8FD] p-4"><Icon className="h-5 w-5 text-[#0756D9]" /><p className="mt-3 text-xs uppercase text-[#697184]">{label}</p><p className="mt-1 font-bold text-[#20232D]">{value}</p></article>; }
