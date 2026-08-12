import { LogOut, Menu, UserRound } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { logout as endSession } from "../../services/authService";

export default function SuperAdminTopbar({ onOpenMobile }) {
  const navigate = useNavigate();
  const menuRef = useRef(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);

  useEffect(() => {
    if (!isProfileMenuOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!menuRef.current?.contains(event.target)) setIsProfileMenuOpen(false);
    };
    const handleKeyDown = (event) => {
      if (event.key === "Escape") setIsProfileMenuOpen(false);
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isProfileMenuOpen]);

  const logout = async () => {
    setIsProfileMenuOpen(false);
    await endSession().catch(() => undefined);
    navigate("/login", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 flex h-[56px] items-center border-b border-[#D7DCE7] bg-white px-4 sm:px-6">
      <button type="button" onClick={onOpenMobile} aria-label="Buka menu navigasi" className="rounded-lg p-2 text-[#4E5667] hover:bg-slate-100 md:hidden">
        <Menu aria-hidden="true" className="h-5 w-5" />
      </button>
      <div ref={menuRef} className="relative ml-auto flex items-center gap-3">
        <div className="hidden text-right sm:block">
          <p className="text-xs font-semibold text-[#20232D]">Administrator</p>
          <p className="text-[10px] text-[#697184]">Admin Sekolah</p>
        </div>
        <button
          id="superadmin-profile-button"
          type="button"
          onClick={() => setIsProfileMenuOpen((current) => !current)}
          aria-label="Buka menu profil"
          aria-haspopup="menu"
          aria-expanded={isProfileMenuOpen}
          className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0756D9] text-white shadow-sm transition hover:bg-[#0648B8]"
        >
          <UserRound aria-hidden="true" className="h-[17px] w-[17px]" />
        </button>
        {isProfileMenuOpen && (
          <div
            role="menu"
            aria-labelledby="superadmin-profile-button"
            className="absolute right-0 top-[calc(100%+10px)] z-50 w-40 rounded-md border border-[#D7DCE7] bg-white p-1.5 shadow-[0_8px_18px_rgba(30,42,75,0.18)]"
          >
            <button
              type="button"
              role="menuitem"
              onClick={logout}
              className="flex w-full items-center gap-2 rounded px-3 py-2 text-left text-sm font-medium text-[#DC2626] hover:bg-red-50"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
