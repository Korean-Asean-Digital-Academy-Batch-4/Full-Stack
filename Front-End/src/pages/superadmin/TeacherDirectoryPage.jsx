import { AlertCircle, ChevronLeft, ChevronRight, KeyRound, LoaderCircle, RefreshCw, Search } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import { getTeachers, resetUserPassword } from "../../services/adminService";

const PAGE_SIZE = 8;
const avatarTones = [
  "bg-[#E4E9FF] text-[#173A75]",
  "bg-[#FFE4D8] text-[#7C3418]",
  "bg-[#E7EAED] text-[#4F5665]",
  "bg-[#E5E9FF] text-[#354B8C]",
];

function getInitials(name) {
  return String(name || "?")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function formatCreatedAt(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export default function TeacherDirectoryPage() {
  const [teachers, setTeachers] = useState([]);
  const [status, setStatus] = useState("loading");
  const [errorMessage, setErrorMessage] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [passwordTeacher, setPasswordTeacher] = useState(null);
  const [passwordStatus, setPasswordStatus] = useState("idle");
  const [newPassword, setNewPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const loadTeachers = useCallback(async () => {
    setStatus("loading");
    setErrorMessage("");
    try {
      const result = await getTeachers();
      setTeachers(result.items || []);
      setStatus("ready");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error.message || "Data guru gagal dimuat dari server.");
    }
  }, []);

  useEffect(() => {
    loadTeachers();
  }, [loadTeachers]);

  const openPasswordModal = (teacher) => {
    setPasswordTeacher(teacher);
    setPasswordStatus("idle");
    setNewPassword("");
    setPasswordError("");
  };

  const closePasswordModal = () => {
    if (passwordStatus === "loading") return;
    setPasswordTeacher(null);
    setNewPassword("");
    setPasswordError("");
  };

  const resetPassword = async () => {
    if (!passwordTeacher || passwordStatus === "loading") return;
    setPasswordStatus("loading");
    setPasswordError("");
    try {
      const result = await resetUserPassword(passwordTeacher.id, "teacher");
      setNewPassword(result.newPassword);
      setPasswordStatus("success");
    } catch (error) {
      setPasswordError(error.message || "Password gagal direset.");
      setPasswordStatus("error");
    }
  };

  const filteredTeachers = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return teachers;
    return teachers.filter((teacher) => [
      teacher.name,
      teacher.nip,
      teacher.subject_assignment,
      teacher.homeroom_classes,
    ].some((value) => String(value || "").toLowerCase().includes(query)));
  }, [search, teachers]);

  const pageCount = Math.max(1, Math.ceil(filteredTeachers.length / PAGE_SIZE));
  const safePage = Math.min(page, pageCount);
  const visibleTeachers = filteredTeachers.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
  const rangeStart = filteredTeachers.length === 0 ? 0 : ((safePage - 1) * PAGE_SIZE) + 1;
  const rangeEnd = Math.min(safePage * PAGE_SIZE, filteredTeachers.length);

  return (
    <main className="mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-[-0.035em] text-[#20232D]">Database Guru</h1>
          <p className="mt-2 text-base text-[#697184]">Data guru langsung dari database EduTrack.</p>
        </div>
        <Button variant="secondary" onClick={loadTeachers} disabled={status === "loading"} className="h-10 self-start px-4 sm:self-auto">
          <RefreshCw aria-hidden="true" className={`h-4 w-4 ${status === "loading" ? "animate-spin" : ""}`} />
          Muat Ulang
        </Button>
      </header>

      <section className="mt-8 overflow-hidden rounded-lg border border-[#C8D0DF] bg-white shadow-[0_1px_3px_rgba(30,42,75,0.04)]" aria-label="Direktori guru">
        <div className="flex flex-col gap-3 border-b border-[#D7DCE7] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#20232D]">Daftar Guru</h2>
            <p className="mt-1 text-xs text-[#697184]">{teachers.length} akun terdaftar</p>
          </div>
          <label className="relative block w-full sm:w-[300px]">
            <span className="sr-only">Cari guru</span>
            <Search aria-hidden="true" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8A93A6]" />
            <input
              type="search"
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Cari nama, NIP, kelas, atau mapel..."
              className="h-10 w-full rounded-md border border-[#D7DCE7] bg-white pl-9 pr-3 text-sm text-[#343946] outline-none placeholder:text-[#A4AABC] focus:border-[#0756D9] focus:ring-2 focus:ring-[#DCE8FF]"
            />
          </label>
        </div>

        {status === "error" ? (
          <div className="flex flex-col items-center gap-3 px-6 py-14 text-center" role="alert">
            <AlertCircle aria-hidden="true" className="h-8 w-8 text-red-500" />
            <div>
              <p className="font-medium text-red-700">Data guru tidak dapat dimuat.</p>
              <p className="mt-1 text-sm text-[#697184]">{errorMessage}</p>
            </div>
            <Button variant="secondary" onClick={loadTeachers}>Coba Lagi</Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left">
              <thead className="bg-[#F4F5F7] text-xs font-semibold uppercase tracking-[0.05em] text-[#697184]">
                <tr>
                  <th scope="col" className="w-[260px] px-7 py-4">Nama Guru</th>
                  <th scope="col" className="w-[190px] px-5 py-4">NIP / Username</th>
                  <th scope="col" className="w-[170px] px-5 py-4">Wali Kelas</th>
                  <th scope="col" className="px-5 py-4">Mata Pelajaran</th>
                  <th scope="col" className="w-[130px] px-5 py-4">Dibuat</th>
                  <th scope="col" className="w-[150px] px-5 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7DCE7] text-sm text-[#343946]">
                {status === "loading" ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[#697184]">
                      <LoaderCircle aria-hidden="true" className="mx-auto mb-2 h-6 w-6 animate-spin text-[#0756D9]" />
                      Memuat data guru dari database...
                    </td>
                  </tr>
                ) : visibleTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-14 text-center text-[#697184]">
                      {search ? "Guru tidak ditemukan untuk pencarian tersebut." : "Belum ada akun guru di database."}
                    </td>
                  </tr>
                ) : visibleTeachers.map((teacher, index) => (
                  <tr key={teacher.id} className="hover:bg-[#FAFBFD]">
                    <td className="px-7 py-5">
                      <div className="flex items-center gap-3">
                        <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-medium ${avatarTones[((safePage - 1) * PAGE_SIZE + index) % avatarTones.length]}`}>
                          {getInitials(teacher.name)}
                        </span>
                        <span className="font-medium text-[#20232D]">{teacher.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-5 font-mono text-xs text-[#555D6E]">{teacher.nip}</td>
                    <td className="px-5 py-5">
                      {teacher.homeroom_classes ? (
                        <Badge className="border border-[#BFC9F7] bg-[#E8EBFF] px-3 py-1 font-medium text-[#26355D]">{teacher.homeroom_classes}</Badge>
                      ) : <span className="text-[#8A93A6]">-</span>}
                    </td>
                    <td className="px-5 py-5">{teacher.subject_assignment || <span className="text-[#8A93A6]">Belum ditugaskan</span>}</td>
                    <td className="px-5 py-5 text-xs text-[#697184]">{formatCreatedAt(teacher.created_at)}</td>
                    <td className="px-5 py-5 text-center">
                      <button type="button" onClick={() => openPasswordModal(teacher)} className="inline-flex items-center gap-1.5 rounded-md border border-[#C8D0DF] px-3 py-2 text-xs font-medium text-[#0756D9] transition-colors hover:bg-[#E8EFFF]">
                        <KeyRound aria-hidden="true" className="h-3.5 w-3.5" /> Reset Password
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <footer className="flex items-center justify-between border-t border-[#D7DCE7] bg-[#FAFBFD] px-5 py-4 text-xs text-[#697184]">
          <p>Menampilkan {rangeStart}-{rangeEnd} dari {filteredTeachers.length} entri</p>
          <nav aria-label="Pagination direktori guru" className="flex items-center gap-2">
            <button type="button" aria-label="Halaman sebelumnya" disabled={safePage === 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E1E6F0] bg-white disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronLeft aria-hidden="true" className="h-4 w-4" />
            </button>
            <span className="min-w-14 text-center">{safePage} / {pageCount}</span>
            <button type="button" aria-label="Halaman berikutnya" disabled={safePage === pageCount} onClick={() => setPage((current) => Math.min(pageCount, current + 1))} className="flex h-8 w-8 items-center justify-center rounded-md border border-[#E1E6F0] bg-white disabled:cursor-not-allowed disabled:opacity-40">
              <ChevronRight aria-hidden="true" className="h-4 w-4" />
            </button>
          </nav>
        </footer>
      </section>

      <Modal
        open={Boolean(passwordTeacher)}
        onClose={closePasswordModal}
        title="Reset Password Guru"
        description={passwordTeacher ? `${passwordTeacher.name} (${passwordTeacher.nip})` : ""}
        dismissible={passwordStatus !== "loading"}
      >
        {passwordStatus === "success" ? (
          <div>
            <p className="text-sm text-[#555D6E]">Password baru berhasil dibuat. Salin dan berikan kepada guru terkait.</p>
            <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-700">Password baru</p>
              <code className="mt-2 block break-all text-lg font-semibold text-emerald-900">{newPassword}</code>
            </div>
            <p className="mt-3 text-xs text-[#697184]">Password ini hanya ditampilkan sekarang dan tidak dapat dibaca kembali dari database.</p>
            <div className="mt-5 flex justify-end">
              <Button onClick={closePasswordModal}>Selesai</Button>
            </div>
          </div>
        ) : (
          <div>
            <p className="text-sm leading-6 text-[#555D6E]">Tindakan ini mengganti password lama dengan password acak baru. Akun tidak dapat login menggunakan password sebelumnya.</p>
            {passwordError && <p className="mt-3 text-sm text-red-600" role="alert">{passwordError}</p>}
            <div className="mt-5 flex justify-end gap-3">
              <Button variant="secondary" onClick={closePasswordModal} disabled={passwordStatus === "loading"}>Batal</Button>
              <Button onClick={resetPassword} loading={passwordStatus === "loading"}>Reset Password</Button>
            </div>
          </div>
        )}
      </Modal>
    </main>
  );
}
