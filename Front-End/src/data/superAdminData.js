import { ClipboardCheck, Database, LayoutGrid, Settings, Sigma, UserRoundPlus } from "lucide-react";

export const superAdminMenu = [
  {
    id: "dashboard",
    label: "Dashboard",
    path: "/superadmin/dashboard",
    icon: LayoutGrid,
  },
  {
    id: "accounts",
    label: "Pembuatan Akun",
    icon: UserRoundPlus,
    children: [
      { label: "Akun Guru", path: "/superadmin/accounts/teachers" },
      { label: "Akun Siswa", path: "/superadmin/accounts/students" },
    ],
  },
  {
    id: "assignments",
    label: "Penugasan",
    icon: ClipboardCheck,
    children: [
      { label: "Kelas X", path: "/superadmin/assignments/class-x" },
      { label: "Kelas XI", path: "/superadmin/assignments/class-xi" },
      { label: "Kelas XII", path: "/superadmin/assignments/class-xii" },
    ],
  },
  {
    id: "formulas",
    label: "Rumus Nilai",
    icon: Sigma,
    children: [
      { label: "Rumus Utama", path: "/superadmin/formulas/main" },
    ],
  },
  {
    id: "database",
    label: "Database",
    icon: Database,
    children: [
      { label: "DB Guru", path: "/superadmin/database/teachers" },
      { label: "DB Siswa", path: "/superadmin/database/students" },
      { label: "DB Presensi Siswa", path: "/superadmin/database/attendance" },
      { label: "DB Mata Pelajaran", path: "/superadmin/database/subjects" },
      { label: "DB Nilai", path: "/superadmin/database/grades" },
      { label: "DB Rapor", path: "/superadmin/database/reports" },
    ],
  },
  {
    id: "system-settings",
    label: "Pengaturan Sistem",
    path: "/superadmin/system-settings",
    icon: Settings,
  },
];

export const superAdminPages = Object.fromEntries(
  superAdminMenu.flatMap((item) =>
    item.path
      ? [[item.path, item.label]]
      : item.children.map((child) => [child.path, child.label]),
  ),
);
