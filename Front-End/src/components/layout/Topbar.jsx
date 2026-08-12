import { Menu } from "lucide-react";
import { getStoredUser } from "../../stores/authStore";
import UserMenu from "./UserMenu";

export default function Topbar({ onOpenMobile }) {
  const activePeriod = getStoredUser()?.academicPeriod || { semester: "-", academicYear: "-" };
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center border-b border-[#DCE1EB] bg-white px-4 sm:px-6">
      <button
        type="button"
        onClick={onOpenMobile}
        aria-label="Buka menu navigasi"
        className="mr-3 rounded-lg p-2 text-[#4B5060] hover:bg-slate-100 md:hidden"
      >
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>
      <p className="truncate text-[11px] font-medium uppercase tracking-[0.09em] text-[#545968] sm:text-xs">
        Semester {activePeriod.semester} {activePeriod.academicYear}
      </p>
      <div className="ml-auto">
        <UserMenu />
      </div>
    </header>
  );
}
