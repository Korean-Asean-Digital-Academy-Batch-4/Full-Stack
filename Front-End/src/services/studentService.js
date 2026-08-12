import { getStoredUser } from "../stores/authStore";
import { groupStudentGradeRows } from "../utils/studentGrades";
import { api, downloadBlob } from "./apiClient";

function requireCurrentStudent() {
  const user = getStoredUser();
  if (!user || user.role !== "student") throw new Error("UNAUTHORIZED_STUDENT_ACCESS");
  return user;
}

function normalizeAttendance(items) {
  const percentages = items.map((item) => item.presentPercent).filter(Number.isFinite);
  return {
    overallPercentage: percentages.length ? Math.round(percentages.reduce((sum, value) => sum + value, 0) / percentages.length) : 0,
    subjects: items.map((item, index) => ({ id: `${index}:${item.subjectName}`, name: item.subjectName, subjectName: item.subjectName, totalSessions: item.totalSessions, percentage: item.presentPercent ?? 0, present: item.present ?? 0, permitted: item.permitted ?? 0, sick: item.sick ?? 0, absent: item.absent ?? 0 })),
  };
}

export async function getStudentDashboard() {
  requireCurrentStudent();
  const [gradeRows, attendanceRows] = await Promise.all([api.get("/student/grades"), api.get("/student/attendance")]);
  const subjects = groupStudentGradeRows(gradeRows).map((subject) => ({ id: subject.id, name: subject.name, score: subject.score, status: subject.score == null ? "Belum lengkap" : "Aktif", icon: "book", accent: "blue" }));
  return { attendancePercentage: normalizeAttendance(attendanceRows).overallPercentage, subjects };
}

export async function getStudentAiInsight() { requireCurrentStudent(); return api.post("/student/ai-insight"); }
export async function getStudentGrades() { requireCurrentStudent(); return groupStudentGradeRows(await api.get("/student/grades")); }

export async function getStudentReport() {
  requireCurrentStudent();
  let report;
  try { report = await api.get("/student/report-card"); }
  catch (error) { if (error?.status === 404) return { status: "Unavailable", message: "Rapor belum tersedia" }; throw error; }
  if (report.status !== "Distributed") return report;
  const [gradeRows, attendanceRows] = await Promise.all([api.get("/student/grades"), api.get("/student/attendance")]);
  const subjects = groupStudentGradeRows(gradeRows).map((subject) => ({ id: subject.id, name: subject.name, score: subject.score }));
  const scored = subjects.map((subject) => subject.score).filter(Number.isFinite);
  return { ...report, subjects, average: scored.length ? Number((scored.reduce((sum, score) => sum + score, 0) / scored.length).toFixed(2)) : 0, attendancePercentage: normalizeAttendance(attendanceRows).overallPercentage, teacherNote: report.general_note || "-" };
}

export async function getStudentProfile() {
  const user = requireCurrentStudent();
  return { ...user, roleLabel: "Siswa", joinedAt: user.createdAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "medium" }).format(new Date(user.createdAt)) : "-", status: "Aktif", email: "Tidak digunakan untuk login siswa", nisn: user.nis || "-" };
}

export async function getStudentAttendance() { requireCurrentStudent(); return normalizeAttendance(await api.get("/student/attendance")); }
export async function downloadStudentReport() { const user = requireCurrentStudent(); const blob = await api.download("/student/report-card/download"); downloadBlob(blob, `rapor-${user.nis || user.id}.pdf`); }
