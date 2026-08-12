import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import { useLayoutStore } from "../../stores/layoutStore";
import MobileSidebar from "./MobileSidebar";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const { sidebarCollapsed, toggleSidebar } = useLayoutStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleEscape = (event) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    document.addEventListener("keydown", handleEscape);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <div className="min-h-screen bg-[#F7F9FC]">
      <Sidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />
      <MobileSidebar open={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div
        className={`min-h-screen transition-[margin] duration-200 ${
          sidebarCollapsed ? "md:ml-[72px]" : "md:ml-[255px]"
        }`}
      >
        <Topbar onOpenMobile={() => setMobileOpen(true)} />
        <main><Outlet /></main>
      </div>
    </div>
  );
}
