import { Check, Pencil, Plus } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import InlineScoreInput from "../../components/superadmin/InlineScoreInput";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { validateGradeValue } from "../../utils/gradeValidation";
import { createSubject, getSubjects, getTeachers, updateSubject } from "../../services/adminService";

export default function SubjectDatabasePage() {
  const [subjects, setSubjects] = useState([]);
  const [editingSubjectId, setEditingSubjectId] = useState(null);
  const [draftKkm, setDraftKkm] = useState("");
  const [kkmError, setKkmError] = useState("");
  const [actionMessage, setActionMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [teachers, setTeachers] = useState([]);
  const [form, setForm] = useState({ name: "", gradeLevel: "X", kkm: "75", teacherId: "" });
  const [formError, setFormError] = useState("");
  const [savingSubject, setSavingSubject] = useState(false);

  const loadSubjects = useCallback(() => {
    let active = true;
    setLoading(true);
    setLoadError("");
    getSubjects()
      .then((data) => { if (active) setSubjects(data); })
      .catch((error) => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    return loadSubjects();
  }, []);

  const openCreate = async () => {
    setModalOpen(true);
    setFormError("");
    try {
      const response = await getTeachers();
      const available = response.items.filter((teacher) => !teacher.subject_assignment);
      setTeachers(available);
      setForm({ name: "", gradeLevel: "X", kkm: "75", teacherId: available[0]?.id || "" });
    } catch (error) {
      setFormError(error.message || "Daftar guru gagal dimuat.");
    }
  };

  const submitSubject = async (event) => {
    event.preventDefault();
    const kkm = Number(form.kkm);
    if (!form.name.trim() || !form.teacherId || !Number.isFinite(kkm) || kkm < 0 || kkm > 100) {
      setFormError("Nama, guru pengampu, jenjang, dan KKM 0–100 wajib diisi.");
      return;
    }
    setSavingSubject(true);
    setFormError("");
    try {
      await createSubject({ ...form, name: form.name.trim(), kkm });
      setModalOpen(false);
      await loadSubjects();
      setActionMessage(`Mata pelajaran ${form.name.trim()} berhasil dibuat.`);
    } catch (error) {
      setFormError(error.message || "Mata pelajaran gagal dibuat.");
    } finally {
      setSavingSubject(false);
    }
  };

  const startEditing = (subject) => {
    setEditingSubjectId(subject.id);
    setDraftKkm(String(subject.kkm));
    setKkmError("");
  };

  const updateDraftKkm = (value) => {
    setDraftKkm(value);
    setKkmError(value === "" ? "KKM wajib diisi." : validateGradeValue(value));
  };

  const saveKkm = async (subject) => {
    const error = draftKkm === "" ? "KKM wajib diisi." : validateGradeValue(draftKkm);
    setKkmError(error);
    if (error) return;

    try {
      const updated = await updateSubject(subject.id, { kkm: Number(draftKkm) });
      setSubjects((current) => current.map((item) => item.id === subject.id ? updated : item));
      setEditingSubjectId(null);
      setDraftKkm("");
      setActionMessage(`KKM ${subject.name} berhasil diperbarui.`);
    } catch (requestError) {
      setKkmError(requestError.message || "KKM gagal diperbarui.");
    }
  };

  const visibleSubjects = subjects;

  return (
    <main className="mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-bold tracking-[-0.035em] text-[#20232D]">Database Mata Pelajaran</h1>
          <p className="mt-2 text-sm text-[#555D6E]">Kelola daftar mata pelajaran, guru mapel, KKM, dan bobot penilaian untuk semua kelas.</p></div>
        <Button onClick={openCreate}><Plus aria-hidden="true" className="h-4 w-4" /> Tambah Mata Pelajaran</Button>
      </header>

      {loading && <p role="status" className="mt-6 rounded-lg border border-[#D7DCE7] bg-white p-4 text-sm text-[#697184]">Memuat mata pelajaran...</p>}
      {loadError && <p role="alert" className="mt-6 rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p>}

      {!loading && !loadError && <section className="mt-7 overflow-hidden rounded-lg border border-[#D7DCE7] bg-white shadow-[0_1px_3px_rgba(30,42,75,0.04)]" aria-label="Database mata pelajaran">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] border-collapse text-left">
            <thead className="bg-[#F4F5F7] text-[11px] font-semibold uppercase tracking-wide text-[#555D6E]">
              <tr>
                <th scope="col" className="w-16 px-4 py-4 text-center">No</th>
                <th scope="col" className="w-[220px] px-4 py-4">Nama Mapel</th>
                <th scope="col" className="w-[250px] px-4 py-4">Guru Pengampu</th>
                <th scope="col" className="w-28 px-4 py-4">Jenjang</th>
                <th scope="col" className="w-32 px-4 py-4">KKM</th>
                <th scope="col" className="w-40 px-4 py-4">Rumus Nilai</th>
                <th scope="col" className="w-20 px-4 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D7DCE7] text-sm text-[#343946]">
              {visibleSubjects.map((subject, index) => {
                const isEditing = editingSubjectId === subject.id;
                return (
                  <tr key={subject.id} className={isEditing ? "bg-[#F4F8FF]" : "hover:bg-[#FAFBFD]"}>
                    <td className="px-4 py-4 text-center text-[#697184]">{index + 1}</td>
                    <td className="px-4 py-4 font-medium text-[#20232D]">{subject.name}</td>
                    <td className="px-4 py-4">{subject.teacher.name}</td>
                    <td className="px-4 py-4">{subject.level}</td>
                    <td className="px-4 py-3 align-top">
                      {isEditing ? (
                        <div>
                          <div className="flex items-center gap-2">
                            <InlineScoreInput
                              value={draftKkm}
                              onChange={updateDraftKkm}
                              error={kkmError}
                              ariaLabel={`KKM ${subject.name}`}
                              autoFocus
                            />
                            <button
                              type="button"
                              aria-label={`Simpan KKM ${subject.name}`}
                              onClick={() => saveKkm(subject)}
                              className="rounded-md p-2 text-emerald-600 hover:bg-emerald-50"
                            >
                              <Check aria-hidden="true" className="h-4 w-4" />
                            </button>
                          </div>
                          {kkmError && <p role="alert" className="mt-1 text-[10px] text-red-600">{kkmError}</p>}
                        </div>
                      ) : subject.kkm}
                    </td>
                    <td className="px-4 py-4">{subject.formula}</td>
                    <td className="px-4 py-4 text-center">
                      {!isEditing && (
                        <button
                          type="button"
                          aria-label={`Edit ${subject.name}`}
                          onClick={() => startEditing(subject)}
                          className="rounded-md p-2 text-[#697184] hover:bg-[#EEF3FC] hover:text-[#0756D9]"
                        >
                          <Pencil aria-hidden="true" className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {visibleSubjects.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-sm text-[#697184]">
                    Belum ada mata pelajaran di database.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="border-t border-[#D7DCE7] bg-[#FAFBFD] px-5 py-3 text-xs text-[#697184]">Menampilkan {subjects.length} mata pelajaran dari database</footer>
        <p aria-live="polite" className="sr-only">{actionMessage}</p>
      </section>}
      <Modal open={modalOpen} onClose={() => !savingSubject && setModalOpen(false)} title="Tambah Mata Pelajaran" description="Data langsung disimpan ke database dan guru hanya dapat mengampu satu mata pelajaran.">
        <form onSubmit={submitSubject} className="space-y-4">
          <label className="block text-sm font-semibold">Nama Mata Pelajaran<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-[#0756D9]" /></label>
          <label className="block text-sm font-semibold">Jenjang<select value={form.gradeLevel} onChange={(event) => setForm((current) => ({ ...current, gradeLevel: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border px-3"><option value="X">Kelas X</option><option value="XI">Kelas XI</option><option value="XII">Kelas XII</option></select></label>
          <label className="block text-sm font-semibold">Guru Pengampu<select value={form.teacherId} onChange={(event) => setForm((current) => ({ ...current, teacherId: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border px-3" disabled={!teachers.length}><option value="">{teachers.length ? "Pilih guru" : "Tidak ada guru yang belum mendapat mapel"}</option>{teachers.map((teacher) => <option key={teacher.id} value={teacher.id}>{teacher.name} · {teacher.nip}</option>)}</select></label>
          <label className="block text-sm font-semibold">KKM<input type="number" min="0" max="100" value={form.kkm} onChange={(event) => setForm((current) => ({ ...current, kkm: event.target.value }))} className="mt-2 h-11 w-full rounded-lg border px-3 outline-none focus:border-[#0756D9]" /></label>
          {formError && <p role="alert" className="text-sm text-red-600">{formError}</p>}
          <div className="flex justify-end gap-3"><Button variant="secondary" onClick={() => setModalOpen(false)}>Batal</Button><Button type="submit" loading={savingSubject} disabled={!teachers.length}>Simpan</Button></div>
        </form>
      </Modal>
    </main>
  );
}
