import {
  BarChart3,
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  FileChartColumn,
  FileText,
  FilePenLine,
  LayoutGrid,
  Settings,
  UserRound,
} from "lucide-react";
import logo from "../../assets/logo-edutrack.svg";
import { getStoredUser } from "../../stores/authStore";
import { canCreateReport, canManageGrades, canViewClassSubjectGrades } from "../../utils/teacherPermissions";
import SidebarItem from "./SidebarItem";

export function getNavigationItems(user = getStoredUser()) {
  if (user?.role === "student") {
    return [
      { to: "/student/dashboard", label: "Dashboard", icon: LayoutGrid },
      { to: "/student/grades", label: "Nilai", icon: BarChart3 },
      { to: "/student/attendance", label: "Presensi", icon: CalendarCheck },
      { to: "/student/report", label: "Rapor", icon: FileText },
      { to: "/student/settings", label: "Pengaturan", icon: Settings },
    ];
  }

  return [
    { to: "/teacher/dashboard", label: "Dashboard", icon: LayoutGrid },
    { to: "/teacher/attendance", label: "Presensi", icon: CalendarCheck },
    { to: "/teacher/grades", label: "Input Nilai", icon: FilePenLine, disabled: !canManageGrades(user) },
    {
      to: "/teacher/subject-grades",
      label: "Lihat Nilai Mapel",
      icon: BarChart3,
      disabled: !canViewClassSubjectGrades(user),
    },
    {
      to: "/teacher/reports",
      label: "Buat Rapor",
      icon: FileChartColumn,
      disabled: !canCreateReport(user),
    },
    { to: "/teacher/account", label: "Akun", icon: UserRound },
  ];
}

export default function Sidebar({ collapsed, onToggle }) {
  const navigationItems = getNavigationItems();
  return (
    <aside
      className={`fixed inset-y-0 left-0 z-40 hidden border-r border-[#DCE1EB] bg-white transition-[width] duration-200 md:flex md:flex-col ${
        collapsed ? "w-[72px]" : "w-[255px]"
      }`}
    >
      <div className={`flex h-20 shrink-0 items-center ${collapsed ? "flex-col justify-center gap-1" : "px-6"}`}>
        <img src={logo} alt="" aria-hidden="true" className="h-8 w-8 shrink-0" />
        {!collapsed && <span className="ml-3 text-lg font-bold tracking-[-0.02em] text-[#0756D9]">EduTrack</span>}
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Buka sidebar" : "Tutup sidebar"}
          className={
            collapsed
              ? "rounded p-0.5 text-[#555B6B] hover:bg-slate-100"
              : "ml-auto rounded p-1.5 text-[#555B6B] hover:bg-slate-100"
          }
        >
          {collapsed ? (
            <ChevronRight aria-hidden="true" className="h-5 w-5" />
          ) : (
            <ChevronLeft aria-hidden="true" className="h-5 w-5" />
          )}
        </button>
      </div>

      <nav aria-label="Navigasi utama" className={`flex-1 space-y-1 ${collapsed ? "pt-3" : "pt-2"}`}>
        {navigationItems.map((item) => (
          <SidebarItem key={item.to} {...item} collapsed={collapsed} />
        ))}
      </nav>
    </aside>
  );
}
