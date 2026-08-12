import {
  ArrowRight,
  BarChart3,
  BookOpenCheck,
  CalendarCheck2,
  CheckCircle2,
  FileText,
  GraduationCap,
  Menu,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../assets/logo-edutrack.svg";
import { getStoredUser, hasAuthSession } from "../stores/authStore";

const dashboardByRole = {
  admin: "/superadmin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

const roles = [
  {
    id: "admin",
    label: "Administrator",
    icon: ShieldCheck,
    title: "Kelola sekolah dalam satu tempat",
    description: "Atur akun, kelas, mata pelajaran, penugasan, dan database akademik dengan alur yang rapi.",
    points: ["Pembuatan akun massal", "Pengaturan kelas & mapel", "Database akademik terpusat"],
    tone: "blue",
  },
  {
    id: "teacher",
    label: "Guru",
    icon: BookOpenCheck,
    title: "Mengajar tanpa pekerjaan berulang",
    description: "Catat presensi, isi nilai, dan susun rapor dari data yang sama tanpa berpindah aplikasi.",
    points: ["Presensi cepat", "Nilai berbobot otomatis", "Rapor wali kelas"],
    tone: "violet",
  },
  {
    id: "student",
    label: "Siswa",
    icon: GraduationCap,
    title: "Pantau perkembangan dengan jelas",
    description: "Lihat nilai, kehadiran, insight pembelajaran, dan rapor yang sudah didistribusikan.",
    points: ["Ringkasan nilai", "Riwayat kehadiran", "Rapor PDF"],
    tone: "emerald",
  },
];

const features = [
  { icon: CalendarCheck2, title: "Presensi sinkron", description: "Tanggal pertemuan, status siswa, dan rekap CSV tersimpan konsisten." },
  { icon: BarChart3, title: "Nilai terukur", description: "Delapan komponen penilaian dihitung otomatis memakai bobot resmi." },
  { icon: FileText, title: "Rapor aman", description: "Rapor final memakai snapshot permanen dan siap diunduh sebagai PDF." },
  { icon: Sparkles, title: "Bantuan AI", description: "Draf catatan rapor disusun dari nilai dan kehadiran untuk ditinjau guru." },
];

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeRole, setActiveRole] = useState("teacher");
  const user = getStoredUser();
  const signedIn = hasAuthSession();
  const primaryTarget = signedIn ? dashboardByRole[user?.role] || "/login" : "/login";
  const primaryLabel = signedIn ? "Buka Dashboard" : "Masuk EduTrack";
  const role = roles.find((item) => item.id === activeRole) || roles[1];
  const RoleIcon = role.icon;

  const closeMenu = () => setMobileMenuOpen(false);

  return (
    <main className="min-h-screen bg-[#F7F9FD] text-[#172033]">
      <header className="fixed inset-x-0 top-0 z-50 border-b border-white/70 bg-white/85 backdrop-blur-xl">
        <nav className="mx-auto flex h-[72px] max-w-[1180px] items-center justify-between px-5 lg:px-8" aria-label="Navigasi utama">
          <Link to="/" className="inline-flex items-center gap-2.5" onClick={closeMenu}>
            <img src={logo} alt="" className="h-9 w-9" />
            <span className="text-lg font-bold tracking-[-0.03em] text-[#0756D9]">EduTrack</span>
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-[#5B6475] md:flex">
            <a href="#fitur" className="transition hover:text-[#0756D9]">Fitur</a>
            <a href="#pengguna" className="transition hover:text-[#0756D9]">Untuk Siapa</a>
            <a href="#cara-kerja" className="transition hover:text-[#0756D9]">Cara Kerja</a>
          </div>

          <div className="hidden md:block">
            <Link to={primaryTarget} className="inline-flex h-10 items-center gap-2 rounded-xl bg-[#0756D9] px-4 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(7,86,217,0.22)] transition hover:-translate-y-0.5 hover:bg-[#0648B8]">
              {primaryLabel} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <button type="button" className="rounded-lg p-2 text-[#344054] hover:bg-slate-100 md:hidden" onClick={() => setMobileMenuOpen((current) => !current)} aria-expanded={mobileMenuOpen} aria-label={mobileMenuOpen ? "Tutup menu" : "Buka menu"}>
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="border-t bg-white px-5 py-4 shadow-lg md:hidden">
            <div className="mx-auto flex max-w-[1180px] flex-col gap-1 text-sm font-medium">
              <a href="#fitur" onClick={closeMenu} className="rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-[#0756D9]">Fitur</a>
              <a href="#pengguna" onClick={closeMenu} className="rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-[#0756D9]">Untuk Siapa</a>
              <a href="#cara-kerja" onClick={closeMenu} className="rounded-lg px-3 py-2.5 hover:bg-blue-50 hover:text-[#0756D9]">Cara Kerja</a>
              <Link to={primaryTarget} onClick={closeMenu} className="mt-2 inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-[#0756D9] text-white">{primaryLabel} <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        )}
      </header>

      <section className="landing-grid relative overflow-hidden px-5 pb-20 pt-32 sm:pt-36 lg:px-8 lg:pb-28">
        <div className="landing-orb landing-orb-one" />
        <div className="landing-orb landing-orb-two" />
        <div className="relative mx-auto grid max-w-[1180px] items-center gap-14 lg:grid-cols-[1.02fr_0.98fr]">
          <div className="max-w-[650px]">
            <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-white/80 px-3 py-1.5 text-xs font-semibold text-[#0756D9] shadow-sm">
              <Sparkles className="h-3.5 w-3.5" /> Sistem akademik yang lebih sederhana
            </div>
            <h1 className="mt-6 text-4xl font-bold leading-[1.1] tracking-[-0.05em] text-[#172033] sm:text-5xl lg:text-[62px]">
              Semua aktivitas sekolah, <span className="text-[#0756D9]">lebih terhubung.</span>
            </h1>
            <p className="mt-6 max-w-[590px] text-base leading-7 text-[#5B6475] sm:text-lg">
              EduTrack menyatukan presensi, nilai, dan rapor untuk Administrator, Guru, dan Siswa dalam satu alur yang mudah dipahami.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to={primaryTarget} className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-[#0756D9] px-6 text-sm font-semibold text-white shadow-[0_12px_24px_rgba(7,86,217,0.25)] transition hover:-translate-y-0.5 hover:bg-[#0648B8]">
                {primaryLabel} <ArrowRight className="h-4 w-4" />
              </Link>
              <a href="#fitur" className="inline-flex h-12 items-center justify-center rounded-xl border border-[#D9E0EC] bg-white px-6 text-sm font-semibold text-[#344054] transition hover:border-blue-200 hover:bg-blue-50 hover:text-[#0756D9]">Lihat Fitur</a>
            </div>
            <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-medium text-[#667085]">
              {["Data terpusat", "Akses sesuai peran", "Rapor PDF aman"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> {item}</span>
              ))}
            </div>
          </div>

          <div className="landing-float relative mx-auto w-full max-w-[540px]">
            <div className="absolute -inset-4 rounded-[32px] bg-gradient-to-br from-blue-200/60 to-violet-200/50 blur-2xl" />
            <div className="relative overflow-hidden rounded-[26px] border border-white/90 bg-white p-4 shadow-[0_28px_70px_rgba(40,62,120,0.18)] sm:p-5">
              <div className="flex items-center justify-between border-b border-[#EDF0F5] pb-4">
                <div className="flex items-center gap-2"><img src={logo} alt="" className="h-8 w-8" /><span className="text-sm font-bold">Dashboard Sekolah</span></div>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700">Aktif</span>
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {[{ label: "Kehadiran", value: "96%", icon: CalendarCheck2, color: "text-emerald-600 bg-emerald-50" }, { label: "Nilai masuk", value: "88%", icon: BarChart3, color: "text-blue-600 bg-blue-50" }, { label: "Rapor siap", value: "32", icon: FileText, color: "text-violet-600 bg-violet-50" }].map((item) => {
                  const Icon = item.icon;
                  return <article key={item.label} className="rounded-2xl border border-[#EDF0F5] p-3.5 last:col-span-2 sm:last:col-span-1"><span className={`flex h-8 w-8 items-center justify-center rounded-lg ${item.color}`}><Icon className="h-4 w-4" /></span><p className="mt-4 text-[10px] uppercase tracking-wide text-[#7A8394]">{item.label}</p><p className="mt-1 text-xl font-bold">{item.value}</p></article>;
                })}
              </div>
              <div className="mt-3 rounded-2xl bg-[#F5F7FC] p-4">
                <div className="flex items-center justify-between"><p className="text-xs font-semibold">Progress akademik</p><span className="text-xs font-bold text-[#0756D9]">Semester Ganjil</span></div>
                <div className="mt-4 space-y-3">
                  {[{ name: "Matematika", value: 86 }, { name: "Fisika", value: 74 }, { name: "Bahasa Indonesia", value: 92 }].map((item) => <div key={item.name}><div className="mb-1.5 flex justify-between text-[10px] text-[#667085]"><span>{item.name}</span><span>{item.value}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-white"><div className="h-full rounded-full bg-gradient-to-r from-[#7357F6] to-[#2F67ED]" style={{ width: `${item.value}%` }} /></div></div>)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="fitur" className="scroll-mt-24 bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="max-w-2xl"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0756D9]">Fitur utama</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Dari kelas sampai rapor, satu alur.</h2><p className="mt-4 leading-7 text-[#667085]">Data cukup dimasukkan sekali, lalu digunakan secara konsisten di setiap halaman.</p></div>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => { const Icon = feature.icon; return <article key={feature.title} className="group rounded-2xl border border-[#E7EBF2] bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:shadow-soft"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#0756D9] transition group-hover:bg-[#0756D9] group-hover:text-white"><Icon className="h-5 w-5" /></span><h3 className="mt-5 font-bold">{feature.title}</h3><p className="mt-2 text-sm leading-6 text-[#667085]">{feature.description}</p></article>; })}
          </div>
        </div>
      </section>

      <section id="pengguna" className="scroll-mt-24 px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-[1180px]">
          <div className="text-center"><p className="text-xs font-bold uppercase tracking-[0.18em] text-[#7357F6]">Sesuai kebutuhan pengguna</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Satu platform, tiga pengalaman.</h2></div>
          <div className="mt-10 grid gap-4 lg:grid-cols-[0.78fr_1.22fr]">
            <div className="space-y-3" role="tablist" aria-label="Pilih peran pengguna">
              {roles.map((item) => { const Icon = item.icon; const selected = item.id === activeRole; return <button key={item.id} type="button" role="tab" aria-selected={selected} onClick={() => setActiveRole(item.id)} className={`flex w-full items-center gap-4 rounded-2xl border p-4 text-left transition ${selected ? "border-blue-200 bg-white shadow-soft" : "border-transparent bg-transparent hover:bg-white/70"}`}><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${selected ? "bg-[#0756D9] text-white" : "bg-white text-[#667085]"}`}><Icon className="h-5 w-5" /></span><span><strong className="block text-sm">{item.label}</strong><small className="mt-1 block text-xs text-[#7A8394]">Lihat pengalaman {item.label.toLowerCase()}</small></span><ArrowRight className={`ml-auto h-4 w-4 transition ${selected ? "translate-x-0 text-[#0756D9]" : "-translate-x-1 text-[#B3BAC7]"}`} /></button>; })}
            </div>
            <article role="tabpanel" className="relative overflow-hidden rounded-[26px] bg-[#14213D] p-7 text-white sm:p-10">
              <div className="absolute -right-20 -top-24 h-60 w-60 rounded-full bg-blue-500/30 blur-3xl" />
              <div className="relative"><span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10"><RoleIcon className="h-6 w-6" /></span><p className="mt-7 text-xs font-semibold uppercase tracking-[0.16em] text-blue-200">Untuk {role.label}</p><h3 className="mt-3 max-w-xl text-2xl font-bold tracking-[-0.03em] sm:text-3xl">{role.title}</h3><p className="mt-4 max-w-xl text-sm leading-7 text-slate-300">{role.description}</p><div className="mt-7 grid gap-3 sm:grid-cols-3">{role.points.map((point) => <div key={point} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs font-medium"><CheckCircle2 className="mb-3 h-4 w-4 text-emerald-400" />{point}</div>)}</div></div>
            </article>
          </div>
        </div>
      </section>

      <section id="cara-kerja" className="scroll-mt-24 bg-white px-5 py-20 lg:px-8">
        <div className="mx-auto max-w-[980px] text-center">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#0756D9]">Cara kerja</p><h2 className="mt-3 text-3xl font-bold tracking-[-0.04em] sm:text-4xl">Mudah dimulai, mudah dipantau.</h2>
          <div className="mt-12 grid gap-5 text-left md:grid-cols-3">
            {[{ n: "01", title: "Siapkan data", text: "Admin membuat akun, kelas, mata pelajaran, dan penugasan." }, { n: "02", title: "Catat aktivitas", text: "Guru mengisi presensi, topik pembelajaran, dan nilai siswa." }, { n: "03", title: "Bagikan hasil", text: "Wali kelas memeriksa, memfinalisasi, lalu mendistribusikan rapor." }].map((step) => <article key={step.n} className="relative rounded-2xl border border-[#E7EBF2] p-6"><span className="text-sm font-bold text-[#0756D9]">{step.n}</span><h3 className="mt-8 font-bold">{step.title}</h3><p className="mt-2 text-sm leading-6 text-[#667085]">{step.text}</p></article>)}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-8 overflow-hidden rounded-[28px] bg-gradient-to-r from-[#0756D9] to-[#7357F6] px-7 py-12 text-center text-white shadow-[0_24px_55px_rgba(40,78,180,0.24)] md:flex-row md:px-12 md:text-left">
          <div><h2 className="text-2xl font-bold tracking-[-0.03em] sm:text-3xl">Siap membuat aktivitas akademik lebih rapi?</h2><p className="mt-3 text-sm text-blue-100">Masuk dengan akun yang sudah diberikan oleh sekolah.</p></div>
          <Link to={primaryTarget} className="inline-flex h-12 shrink-0 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-[#0756D9] transition hover:-translate-y-0.5 hover:bg-blue-50">{primaryLabel} <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>

      <footer className="border-t border-[#E7EBF2] bg-white px-5 py-7 lg:px-8">
        <div className="mx-auto flex max-w-[1180px] flex-col items-center justify-between gap-4 text-center text-xs text-[#7A8394] sm:flex-row sm:text-left"><div className="inline-flex items-center gap-2"><img src={logo} alt="" className="h-7 w-7" /><span className="font-bold text-[#344054]">EduTrack</span></div><p>© 2026 EduTrack. Sistem informasi akademik sekolah.</p></div>
      </footer>
    </main>
  );
}
