import { LogOut } from "lucide-react";
import { Navigate, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { getStoredUser } from "../stores/authStore";
import { logout as endSession } from "../services/authService";

const dashboardByRole = {
  admin: "/superadmin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export default function DashboardPage({ adminMode = false }) {
  const user = getStoredUser();
  const navigate = useNavigate();

  const logout = async () => {
    await endSession().catch(() => undefined);
    navigate("/login", { replace: true });
  };

  if (!adminMode) return <Navigate to={dashboardByRole[user?.role] || "/login"} replace />;

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#F4F5FF] p-4">
      <section className="w-full max-w-md rounded-2xl bg-white p-8 shadow-card">
        <h1 className="text-2xl font-bold">Login berhasil</h1>
        <dl className="mt-6 space-y-3 text-sm">
          <div><dt className="text-slate-500">Nama</dt><dd className="font-semibold">{user?.name}</dd></div>
          <div><dt className="text-slate-500">Email</dt><dd className="font-semibold">{user?.email || "—"}</dd></div>
          <div><dt className="text-slate-500">Role</dt><dd className="font-semibold capitalize">{user?.role}</dd></div>
        </dl>
        <Button onClick={logout} variant="danger" className="mt-7 w-full">
          <LogOut aria-hidden="true" className="h-4 w-4" /> Logout
        </Button>
      </section>
    </main>
  );
}
