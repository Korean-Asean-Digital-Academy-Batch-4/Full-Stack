import { AlertCircle, ChevronLeft, ChevronRight, KeyRound, LoaderCircle, RefreshCw, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import ConfirmDialog from "../../components/ui/ConfirmDialog";
import Toast from "../../components/ui/Toast";
import { deleteUser, getStudents, resetUserPassword } from "../../services/adminService";

const PAGE_SIZE = 10;

export default function StudentDirectoryPage() {
  const [students, setStudents] = useState([]);
  const [state, setState] = useState("loading");
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [passwordStudent, setPasswordStudent] = useState(null);
  const [passwordState, setPasswordState] = useState("idle");
  const [newPassword, setNewPassword] = useState("");
  const [deletingStudent, setDeletingStudent] = useState(null);
  const [deleteState, setDeleteState] = useState("idle");
  const [deleteError, setDeleteError] = useState("");
  const [toast, setToast] = useState(null);

  const load = useCallback(async () => {
    setState("loading");
    setError("");
    try {
      const result = await getStudents();
      setStudents(result.items || []);
      setState("ready");
    } catch (requestError) {
      setError(requestError.message || "Data siswa gagal dimuat.");
      setState("error");
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return students;
    return students.filter((student) => [student.name, student.nis, student.class_names, student.academic_periods]
      .some((value) => String(value || "").toLowerCase().includes(query)));
  }, [search, students]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const resetPassword = async () => {
    setPasswordState("loading");
    try {
      const result = await resetUserPassword(passwordStudent.id, "student");
      setNewPassword(result.newPassword);
      setPasswordState("success");
    } catch (requestError) {
      setNewPassword(requestError.message || "Password gagal direset.");
      setPasswordState("error");
    }
  };

  const closeModal = () => {
    if (passwordState === "loading") return;
    setPasswordStudent(null);
    setPasswordState("idle");
    setNewPassword("");
  };

  const removeStudent = async () => {
    setDeleteState("loading"); setDeleteError("");
    try { await deleteUser(deletingStudent.id, "student"); setDeletingStudent(null); setDeleteState("idle"); setToast({ type: "success", message: "Akun siswa berhasil dihapus." }); await load(); }
    catch (requestError) { setDeleteError(requestError.message || "Akun siswa gagal dihapus."); setDeleteState("error"); }
  };

  return (
    <main className="mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div><h1 className="text-3xl font-bold tracking-[-0.035em] text-[#20232D]">Database Siswa</h1><p className="mt-2 text-sm text-[#697184]">Data akun dan penempatan kelas langsung dari database.</p></div>
        <Button variant="secondary" onClick={load} disabled={state === "loading"}><RefreshCw className={`h-4 w-4 ${state === "loading" ? "animate-spin" : ""}`} /> Muat Ulang</Button>
      </header>

      <section className="mt-7 overflow-hidden rounded-lg border border-[#D7DCE7] bg-white">
        <div className="flex flex-col gap-3 border-b border-[#D7DCE7] p-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-semibold text-[#20232D]">{students.length} akun siswa terdaftar</p>
          <label className="relative block w-full sm:w-[320px]"><span className="sr-only">Cari siswa</span><Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A93A6]" /><input type="search" value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Cari nama, NIS, kelas, atau periode..." className="h-10 w-full rounded-md border border-[#D7DCE7] pl-9 pr-3 text-sm outline-none focus:border-[#0756D9]" /></label>
        </div>
        {state === "error" ? <div role="alert" className="p-12 text-center"><AlertCircle className="mx-auto h-8 w-8 text-red-500" /><p className="mt-3 text-sm text-red-700">{error}</p><Button onClick={load} className="mt-4">Coba Lagi</Button></div> : (
          <div className="overflow-x-auto"><table className="w-full min-w-[850px] text-left text-sm"><thead className="bg-[#F4F5F7] text-xs uppercase text-[#697184]"><tr><th className="px-5 py-4">Nama Siswa</th><th className="px-5 py-4">NIS / Username</th><th className="px-5 py-4">Kelas</th><th className="px-5 py-4">Periode</th><th className="px-5 py-4 text-center">Aksi</th></tr></thead><tbody className="divide-y divide-[#E5E8EF]">
            {state === "loading" ? <tr><td colSpan={5} className="py-14 text-center text-[#697184]"><LoaderCircle className="mx-auto mb-2 h-6 w-6 animate-spin text-[#0756D9]" />Memuat data siswa...</td></tr> : visible.length === 0 ? <tr><td colSpan={5} className="py-14 text-center text-[#697184]">{search ? "Siswa tidak ditemukan." : "Belum ada akun siswa."}</td></tr> : visible.map((student) => <tr key={student.id} className="hover:bg-[#FAFBFD]"><td className="px-5 py-4 font-semibold text-[#20232D]">{student.name}</td><td className="px-5 py-4 font-mono text-xs">{student.nis}</td><td className="px-5 py-4">{student.class_names || "Belum ditempatkan"}</td><td className="px-5 py-4">{student.academic_periods || "-"}</td><td className="px-5 py-4 text-center"><div className="flex items-center justify-center gap-2"><button type="button" onClick={() => setPasswordStudent(student)} className="inline-flex items-center gap-1.5 rounded-md border border-[#C8D0DF] px-3 py-2 text-xs font-medium text-[#0756D9] hover:bg-[#E8EFFF]"><KeyRound className="h-3.5 w-3.5" /> Reset Password</button><button type="button" onClick={() => { setDeletingStudent(student); setDeleteError(""); }} aria-label={`Hapus ${student.name}`} className="rounded-md border border-red-200 p-2 text-red-600 hover:bg-red-50"><Trash2 className="h-4 w-4" /></button></div></td></tr>)}
          </tbody></table></div>
        )}
        <footer className="flex items-center justify-between border-t border-[#D7DCE7] bg-[#FAFBFD] px-5 py-4 text-xs text-[#697184]"><p>Menampilkan {filtered.length ? (safePage - 1) * PAGE_SIZE + 1 : 0}-{Math.min(safePage * PAGE_SIZE, filtered.length)} dari {filtered.length}</p><div className="flex items-center gap-2"><button disabled={safePage === 1} onClick={() => setPage((value) => Math.max(1, value - 1))} className="rounded border bg-white p-2 disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button><span>{safePage} / {pageCount}</span><button disabled={safePage === pageCount} onClick={() => setPage((value) => Math.min(pageCount, value + 1))} className="rounded border bg-white p-2 disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button></div></footer>
      </section>

      <Modal open={Boolean(passwordStudent)} onClose={closeModal} title="Reset Password Siswa" description={passwordStudent ? `${passwordStudent.name} (${passwordStudent.nis})` : ""} dismissible={passwordState !== "loading"}>
        {passwordState === "success" ? <div><p className="text-sm text-[#555D6E]">Password baru hanya ditampilkan sekali.</p><code className="mt-4 block rounded-lg bg-emerald-50 p-4 text-lg font-bold text-emerald-800">{newPassword}</code><div className="mt-5 flex justify-end"><Button onClick={closeModal}>Selesai</Button></div></div> : <div><p className="text-sm text-[#555D6E]">Password lama akan diganti dan tidak dapat digunakan kembali.</p>{passwordState === "error" && <p className="mt-3 text-sm text-red-600">{newPassword}</p>}<div className="mt-5 flex justify-end gap-3"><Button variant="secondary" onClick={closeModal}>Batal</Button><Button onClick={resetPassword} loading={passwordState === "loading"}>Reset Password</Button></div></div>}
      </Modal>
      <ConfirmDialog open={Boolean(deletingStudent)} onClose={() => deleteState !== "loading" && setDeletingStudent(null)} title="Hapus Akun Siswa?" description={deletingStudent ? `${deletingStudent.name} (${deletingStudent.nis}) beserta nilai, presensi, rapor, dan penempatan kelas akan dihapus permanen.` : ""} confirmLabel="Hapus Siswa" onConfirm={removeStudent} loading={deleteState === "loading"} error={deleteError} />
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
