import { X } from "lucide-react";
import logo from "../../assets/logo-edutrack.svg";
import SidebarItem from "./SidebarItem";
import { getNavigationItems } from "./Sidebar";

export default function MobileSidebar({ open, onClose }) {
  const navigationItems = getNavigationItems();
  return (
    <div className={`fixed inset-0 z-[70] md:hidden ${open ? "pointer-events-auto" : "pointer-events-none"}`} aria-hidden={!open}>
      <button
        type="button"
        aria-label="Tutup menu navigasi"
        onClick={onClose}
        tabIndex={open ? 0 : -1}
        className={`absolute inset-0 bg-slate-950/45 transition-opacity duration-200 ${open ? "opacity-100" : "opacity-0"}`}
      />
      <aside
        aria-label="Menu navigasi mobile"
        className={`absolute inset-y-0 left-0 flex w-[280px] max-w-[86vw] flex-col bg-white shadow-2xl transition-transform duration-200 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-16 items-center border-b border-[#E5E8F0] px-5">
          <img src={logo} alt="" aria-hidden="true" className="h-8 w-8" />
          <span className="ml-3 text-lg font-bold text-[#0756D9]">EduTrack</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup sidebar"
            className="ml-auto rounded-lg p-2 text-[#545968] hover:bg-slate-100"
          >
            <X aria-hidden="true" className="h-5 w-5" />
          </button>
        </div>
        <nav aria-label="Navigasi utama mobile" className="flex-1 space-y-1 py-4">
          {navigationItems.map((item) => (
            <SidebarItem key={item.to} {...item} collapsed={false} onNavigate={onClose} />
          ))}
        </nav>
      </aside>
    </div>
  );
}
