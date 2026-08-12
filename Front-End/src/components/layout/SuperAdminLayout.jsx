import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import SuperAdminSidebar from "../superadmin/SuperAdminSidebar";
import SuperAdminTopbar from "../superadmin/SuperAdminTopbar";

export default function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleEscape = (event) => event.key === "Escape" && setMobileOpen(false);
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#F7F8FA]">
      <SuperAdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((current) => !current)} />
      <div className={`fixed inset-0 z-[70] md:hidden ${mobileOpen ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!mobileOpen}>
        <button type="button" aria-label="Tutup menu navigasi" onClick={() => setMobileOpen(false)} className={`absolute inset-0 bg-slate-950/45 transition-opacity ${mobileOpen ? "opacity-100" : "opacity-0"}`} />
        <div className={`absolute inset-y-0 left-0 transition-transform duration-200 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}>
          <SuperAdminSidebar mobile collapsed={false} onNavigate={() => setMobileOpen(false)} />
        </div>
      </div>
      <div className={`min-h-screen transition-[margin] duration-200 ${collapsed ? "md:ml-[76px]" : "md:ml-[255px]"}`}>
        <SuperAdminTopbar onOpenMobile={() => setMobileOpen(true)} />
        <main><Outlet /></main>
      </div>
    </div>
  );
}
