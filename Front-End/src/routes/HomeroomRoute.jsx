import { Navigate, Outlet } from "react-router-dom";
import { getStoredUser } from "../stores/authStore";
import { canViewClassSubjectGrades } from "../utils/teacherPermissions";

export default function HomeroomRoute() {
  const user = getStoredUser();
  if (!canViewClassSubjectGrades(user)) {
    return <Navigate to="/403" replace />;
  }
  return <Outlet />;
}
