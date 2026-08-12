import { assessmentComponents, TOTAL_ASSESSMENT_WEIGHT } from "../data/assessmentComponents";
import { REPORT_STATUSES } from "../data/reportData";
import { teacherUser } from "../data/teacherData";
import { calculateSubjectFinalGrade } from "./reportCalculation";

export function isReportScoreComplete(scores) {
  return assessmentComponents.every((component) => {
    const value = scores?.[component.id];
    return value !== null && value !== undefined && value !== "" && Number(value) >= 0 && Number(value) <= 100;
  });
}

export function sanitizeReportNote(value) {
  return String(value || "")
    .replace(/<[^>]*>/g, "")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .slice(0, 1000);
}

export function validateReportNote(value) {
  const sanitized = sanitizeReportNote(value);
  if (sanitized.length > 1000) return "Catatan maksimal 1000 karakter.";
  return "";
}

export function validateReportGeneration({ scores, assignment }) {
  const problems = [];
  if (!isReportScoreComplete(scores)) problems.push("Seluruh nilai wajib harus dilengkapi.");
  if (TOTAL_ASSESSMENT_WEIGHT !== 100) problems.push("Bobot penilaian belum mencapai 100%.");
  const assigned = teacherUser.assignedClasses.some(
    (item) => item.id === assignment?.classId && item.subjectId === assignment?.subjectId,
  );
  if (!assigned) problems.push("Guru tidak memiliki penugasan aktif untuk kelas-mapel ini.");
  return problems;
}

export function validateSubjectFinalization(report) {
  const problems = [];
  if (!report) return ["Rapor belum dibuat."];
  if (!isReportScoreComplete(report.scores)) problems.push("Nilai siswa belum lengkap.");
  if (TOTAL_ASSESSMENT_WEIGHT !== 100) problems.push("Bobot penilaian belum mencapai 100%.");
  if (calculateSubjectFinalGrade(report.scores) == null) problems.push("Nilai akhir belum dapat dihitung.");
  if (!String(report.note || "").trim() || !report.noteReviewed) problems.push("Catatan rapor belum disimpan dan diperiksa.");
  const assigned = teacherUser.assignedClasses.some(
    (item) => item.id === report.classId && item.subjectId === report.subjectId,
  );
  if (!assigned) problems.push("Penugasan Guru Mapel tidak aktif.");
  if (report.status === REPORT_STATUSES.FINALIZED_SUBJECT) problems.push("Rapor sudah difinalisasi.");
  return problems;
}
