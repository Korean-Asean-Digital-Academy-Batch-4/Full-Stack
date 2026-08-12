import { getCurrentUser } from "./authService";
import { getTeacherClasses } from "./teacherService";

export async function getTeacherProfile() {
  const user = await getCurrentUser();
  const assignments = await getTeacherClasses();
  return {
    ...user,
    username: user.nip || "—",
    email: "Tidak digunakan untuk login guru",
    systemRole: "Guru",
    internalId: user.id,
    identityNumber: user.nip || "—",
    joinedAt: user.createdAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(user.createdAt)) : "—",
    employmentStatus: "Aktif",
    lastLogin: "Sesi saat ini",
    assignedClasses: assignments,
  };
}
