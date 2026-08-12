import { KeyRound, LogOut } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AccountHeader from "../../components/account/AccountHeader";
import AccountInformationAlert from "../../components/account/AccountInformationAlert";
import TeacherAccountDetails from "../../components/account/TeacherAccountDetails";
import TeacherAssignmentList from "../../components/account/TeacherAssignmentList";
import TeacherProfileCard from "../../components/account/TeacherProfileCard";
import Button from "../../components/ui/Button";
import Modal from "../../components/ui/Modal";
import Spinner from "../../components/ui/Spinner";
import { getTeacherProfile } from "../../services/accountService";
import { logout as endSession } from "../../services/authService";

export default function TeacherAccountPage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [logoutOpen, setLogoutOpen] = useState(false);
  useEffect(() => { getTeacherProfile().then(setProfile); }, []);
  const logout = async () => { await endSession().catch(() => undefined); navigate("/login", { replace: true }); };

  if (!profile) return <div role="status" className="flex min-h-[55vh] items-center justify-center"><Spinner className="h-9 w-9 text-[#0756D9]" /><span className="sr-only">Memuat profil guru</span></div>;
  return (
    <div className="px-4 py-8 sm:px-7 lg:px-10"><div className="mx-auto max-w-[1050px]">
      <AccountHeader />
      <div className="mt-7 grid gap-5 lg:grid-cols-[300px_1fr]"><TeacherProfileCard profile={profile} /><TeacherAccountDetails profile={profile} /></div>
      <div className="mt-5"><TeacherAssignmentList assignments={profile.assignedClasses} /></div>
      <div className="mt-5"><AccountInformationAlert profile={profile} /></div>
      <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => navigate("/change-password")}><KeyRound aria-hidden="true" className="h-4 w-4" /> Ubah Kata Sandi</Button><Button variant="danger" onClick={() => setLogoutOpen(true)}><LogOut aria-hidden="true" className="h-4 w-4" /> Logout</Button></div>
    </div>
      <Modal open={logoutOpen} onClose={() => setLogoutOpen(false)} title="Keluar dari EduTrack?" description="Anda perlu login kembali untuk mengakses dashboard."><div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end"><Button variant="secondary" onClick={() => setLogoutOpen(false)}>Batal</Button><Button variant="danger" onClick={logout}>Ya, Logout</Button></div></Modal>
    </div>
  );
}
