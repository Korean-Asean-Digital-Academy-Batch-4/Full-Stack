import { useEffect, useState } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import Spinner from "../components/ui/Spinner";
import { getCurrentUser } from "../services/authService";

export default function ProtectedRoute() {
  const location = useLocation();
  const [status, setStatus] = useState("checking");

  useEffect(() => {
    let active = true;
    getCurrentUser()
      .then((user) => {
        if (active) setStatus(user ? "authenticated" : "anonymous");
      })
      .catch(() => {
        if (active) setStatus("anonymous");
      });
    return () => { active = false; };
  }, []);

  if (status === "checking") {
    return <div role="status" className="flex min-h-screen items-center justify-center"><Spinner className="h-9 w-9 text-[#0756D9]" /><span className="sr-only">Memeriksa sesi</span></div>;
  }
  if (status === "anonymous") {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return <Outlet />;
}
