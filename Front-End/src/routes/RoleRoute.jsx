import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "../stores/authStore";

const dashboardByRole = {
  admin: "/superadmin/dashboard",
  teacher: "/teacher/dashboard",
  student: "/student/dashboard",
};

export default function RoleRoute({ allowedRoles }) {
  const user = getStoredUser();
  if (!user || !allowedRoles.includes(user.role)) {
    return <Navigate to={dashboardByRole[user?.role] || "/login"} replace />;
  }
  return <Outlet />;
}
