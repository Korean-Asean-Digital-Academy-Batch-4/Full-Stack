import { ChevronDown, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import logo from "../../assets/logo-edutrack.svg";
import { superAdminMenu } from "../../data/superAdminData";
import { cn } from "../../utils/cn";

export default function SuperAdminSidebar({ collapsed, onToggle, mobile = false, onNavigate }) {
  const location = useLocation();
  const [openMenuId, setOpenMenuId] = useState(() =>
    superAdminMenu.find((item) =>
      item.children?.some((child) => child.path === location.pathname),
    )?.id || null,
  );

  useEffect(() => {
    const activeParent = superAdminMenu.find((item) =>
      item.children?.some((child) => child.path === location.pathname),
    );
    if (activeParent) setOpenMenuId(activeParent.id);
  }, [location.pathname]);

  return (
    <aside
      aria-label={mobile ? "Navigasi Superadmin mobile" : "Navigasi Superadmin"}
      className={cn(
        "flex h-full flex-col border-r border-[#D7DCE7] bg-[#F7F8FA] text-[#444B5B]",
        !mobile && "fixed inset-y-0 left-0 z-40 hidden transition-[width] duration-200 md:flex",
        !mobile && (collapsed ? "w-[76px]" : "w-[255px]"),
        mobile && "w-[280px] max-w-[86vw] shadow-2xl",
      )}
    >
      <div className={cn("flex h-[74px] shrink-0 items-center", collapsed && !mobile ? "justify-center" : "px-5")}>
        <img src={logo} alt="" aria-hidden="true" className="h-9 w-9 shrink-0" />
        {(!collapsed || mobile) && <span className="ml-3 text-base font-semibold text-[#0756D9]">EduTrack</span>}
        <button
          type="button"
          onClick={mobile ? onNavigate : onToggle}
          aria-label={mobile ? "Tutup sidebar" : collapsed ? "Tampilkan menu" : "Sembunyikan menu"}
          className={cn("rounded-lg p-1.5 text-[#4E5667] hover:bg-slate-200", collapsed && !mobile ? "ml-1" : "ml-auto")}
        >
          {mobile ? <X aria-hidden="true" className="h-5 w-5" /> : collapsed ? <ChevronRight aria-hidden="true" className="h-5 w-5" /> : <ChevronLeft aria-hidden="true" className="h-5 w-5" />}
        </button>
      </div>

      <nav aria-label="Menu Superadmin" className={cn("flex-1 overflow-y-auto pb-8 pt-4", collapsed && !mobile ? "px-2" : "px-4")}>
        <ul className="space-y-2">
          {superAdminMenu.map((item) => {
            const Icon = item.icon;
            if (item.path) {
              return (
                <li key={item.id}>
                  <NavLink
                    to={item.path}
                    onClick={onNavigate}
                    title={collapsed && !mobile ? item.label : undefined}
                    className={({ isActive }) => cn(
                      "flex h-11 items-center rounded-md text-sm font-medium transition-colors",
                      collapsed && !mobile ? "justify-center px-0" : "gap-3 px-3",
                      isActive ? "bg-[#2F67ED] text-white" : "hover:bg-[#E9EDF5]",
                    )}
                  >
                    <Icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={1.9} />
                    {(!collapsed || mobile) && <span>{item.label}</span>}
                  </NavLink>
                </li>
              );
            }

            const parentActive = item.children.some((child) => child.path === location.pathname);
            const expanded = openMenuId === item.id;
            return (
              <li key={item.id}>
                <button
                  type="button"
                  aria-expanded={!collapsed && expanded}
                  onClick={() => {
                    if (collapsed && !mobile) {
                      setOpenMenuId(item.id);
                      onToggle();
                      return;
                    }
                    setOpenMenuId((current) => current === item.id ? null : item.id);
                  }}
                  title={collapsed && !mobile ? item.label : undefined}
                  className={cn(
                    "flex h-10 w-full items-center rounded-md text-sm font-medium transition-colors hover:bg-[#E9EDF5]",
                    collapsed && !mobile ? "justify-center" : "gap-3 px-3",
                    parentActive && collapsed && !mobile ? "bg-[#2F67ED] text-white" : parentActive && "text-[#0756D9]",
                  )}
                >
                  <Icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={1.8} />
                  {(!collapsed || mobile) && <><span>{item.label}</span><ChevronDown aria-hidden="true" className={cn("ml-auto h-4 w-4 transition-transform", expanded && "rotate-180")} /></>}
                </button>
                {expanded && (!collapsed || mobile) && (
                  <ul className="mt-1 space-y-0.5 pb-1 pl-10">
                    {item.children.map((child) => (
                      <li key={child.path}>
                        <NavLink
                          to={child.path}
                          onClick={onNavigate}
                          className={({ isActive }) => cn(
                            "block rounded-md px-3 py-2 text-xs transition-colors hover:bg-[#E9EDF5]",
                            isActive ? "bg-[#E8EFFF] font-semibold text-[#0756D9]" : "text-[#555D6E]",
                          )}
                        >
                          {child.label}
                        </NavLink>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
