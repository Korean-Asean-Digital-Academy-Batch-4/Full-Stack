import { NavLink } from "react-router-dom";
import { cn } from "../../utils/cn";

const HOMEROOM_DISABLED_MESSAGE = "Hanya dapat diakses oleh Wali Kelas aktif.";

export default function SidebarItem({ to, icon: Icon, label, collapsed, disabled = false, onNavigate }) {
  const handleClick = (event) => {
    if (disabled) {
      event.preventDefault();
      return;
    }
    onNavigate?.(event);
  };

  return (
    <NavLink
      to={to}
      onClick={handleClick}
      aria-disabled={disabled ? "true" : undefined}
      tabIndex={disabled ? -1 : undefined}
      title={disabled ? HOMEROOM_DISABLED_MESSAGE : collapsed ? label : undefined}
      className={({ isActive }) =>
        cn(
          "group relative flex h-11 items-center rounded-[11px] text-sm font-semibold transition-colors",
          collapsed ? "mx-auto w-11 justify-center" : "mx-4 gap-3 px-4",
          disabled
            ? "cursor-not-allowed text-[#494E5D] opacity-50"
            : isActive
            ? "bg-[#2F67ED] text-white shadow-sm"
            : "text-[#494E5D] hover:bg-[#EEF3FF] hover:text-[#20232D]",
        )
      }
    >
      <Icon aria-hidden="true" className="h-5 w-5 shrink-0" strokeWidth={1.9} />
      {!collapsed && <span>{label}</span>}
      {collapsed && (
        <span className="pointer-events-none absolute left-[calc(100%+10px)] z-50 hidden whitespace-nowrap rounded-md bg-slate-900 px-2 py-1 text-xs font-medium text-white shadow-md group-hover:block group-focus-visible:block">
          {disabled ? HOMEROOM_DISABLED_MESSAGE : label}
        </span>
      )}
    </NavLink>
  );
}
