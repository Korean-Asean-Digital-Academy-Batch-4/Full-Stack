import { LogOut, UserRound } from "lucide-react";
import { useCallback, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { getStoredUser } from "../../stores/authStore";
import { logout } from "../../services/authService";
import Button from "../ui/Button";
import DropdownMenu from "../ui/DropdownMenu";
import Modal from "../ui/Modal";

export default function UserMenu() {
  const currentUser = getStoredUser();
  const accountPath = currentUser.role === "student"
    ? "/student/settings"
    : currentUser.role === "admin"
      ? "/superadmin/dashboard"
        : "/teacher/account";
  const secondaryIdentity = currentUser?.email || (currentUser?.nip ? `NIP: ${currentUser.nip}` : `NIS: ${currentUser?.nis || "-"}`);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const closeMenu = useCallback(() => setOpen(false), []);

  const confirmLogout = async () => {
    await logout().catch(() => undefined);
    navigate("/login", { replace: true });
  };

  return (
    <div className="relative">
      <button
        id="user-menu-button"
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-label="Buka menu profil"
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0756D9] text-white shadow-sm transition hover:bg-[#0648B8]"
      >
        <UserRound aria-hidden="true" className="h-[17px] w-[17px]" />
      </button>

      <DropdownMenu open={open} onClose={closeMenu} labelledBy="user-menu-button">
        <div className="border-b border-[#ECEEF4] px-3 py-3">
          <p className="font-semibold text-[#20232D]">{currentUser.name}</p>
          <p className="mt-0.5 truncate text-xs text-[#6A7080]">{secondaryIdentity}</p>
        </div>
        <Link
          to={accountPath}
          role="menuitem"
          onClick={closeMenu}
          className="mt-1 flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-[#343946] hover:bg-slate-50"
        >
          <UserRound aria-hidden="true" className="h-4 w-4" /> Akun Saya
        </Link>
        <button
          type="button"
          role="menuitem"
          onClick={() => {
            setOpen(false);
            setConfirmOpen(true);
          }}
          className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm font-medium text-[#DC2626] hover:bg-red-50"
        >
          <LogOut aria-hidden="true" className="h-4 w-4" /> Logout
        </button>
      </DropdownMenu>

      <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Keluar dari EduTrack?"
        description="Anda perlu login kembali untuk mengakses dashboard."
      >
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="secondary" onClick={() => setConfirmOpen(false)}>Batal</Button>
          <Button variant="danger" onClick={confirmLogout}>Ya, Logout</Button>
        </div>
      </Modal>
    </div>
  );
}
