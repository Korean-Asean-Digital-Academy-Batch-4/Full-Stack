import { getStoredUser } from "../stores/authStore";
import { getActiveHomeroomClassId } from "../utils/teacherPermissions";
import { api } from "./apiClient";

function assertHomeroomClassAccess(classId) {
  if (!classId || getActiveHomeroomClassId(getStoredUser()) !== classId) throw new Error("UNAUTHORIZED_HOMEROOM_REPORT_ACCESS");
}

export async function getHomeroomWorkspace(classId) {
  assertHomeroomClassAccess(classId);
  const [rawOverview, rawCompleteness] = await Promise.all([
    api.get(`/homeroom/classes/${classId}/overview`),
    api.get(`/homeroom/classes/${classId}/completeness`),
  ]);
  let status = "Draft";
  const firstStudentId = rawOverview.students?.[0]?.id;
  if (firstStudentId) {
    try { const report = await api.get(`/homeroom/report-cards/${firstStudentId}`); status = report.status || status; }
    catch (error) { if (error.status !== 404) throw error; }
  }
  const scores = rawOverview.grades.map((item) => item.final_score).filter((value) => value != null).map(Number);
  return {
    status,
    overview: { ...rawOverview, studentCount: rawOverview.students.length, average: scores.length ? Number((scores.reduce((sum, value) => sum + value, 0) / scores.length).toFixed(2)) : null },
    completeness: {
      subjects: rawCompleteness.map((item) => ({ ...item, id: item.subjectId, name: item.subjectName, complete: item.isComplete })),
      complete: rawCompleteness.length > 0 && rawCompleteness.every((item) => item.isComplete),
    },
  };
}

function reportStatus(value) {
  if (value === "Finalized" || value === "Distributed") return "FINALIZED_SUBJECT";
  if (value === "Draft") return "DRAFT";
  return "NOT_CREATED";
}

export async function getHomeroomReportStudents(classId) {
  assertHomeroomClassAccess(classId);
  const overview = await api.get(`/homeroom/classes/${classId}/overview`);
  const reports = await Promise.all(overview.students.map(async (student) => {
    try { return await api.get(`/homeroom/report-cards/${student.id}`); }
    catch (error) { if (error.status === 404) return null; throw error; }
  }));
  return {
    students: overview.students.map((student, index) => {
      const scores = overview.grades
        .filter((grade) => grade.student_id === student.id && Number(grade.missing_count) === 0 && grade.final_score != null)
        .map((grade) => Number(grade.final_score));
      const report = reports[index];
      return {
        ...student,
        initials: student.name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase(),
        avatarColor: ["blue", "purple", "orange", "teal"][index % 4],
        finalGrade: scores.length ? Number((scores.reduce((sum, score) => sum + score, 0) / scores.length).toFixed(1)) : null,
        reportStatus: reportStatus(report?.status),
        reportId: report?.id || null,
      };
    }),
  };
}

export async function generateHomeroomStudentReport(classId, studentId) {
  assertHomeroomClassAccess(classId);
  return api.post(`/homeroom/classes/${classId}/report-cards/${studentId}/generate`);
}

export async function generateAllHomeroomReports(classId) {
  assertHomeroomClassAccess(classId);
  return api.post(`/homeroom/classes/${classId}/report-cards/generate-all`);
}

export async function getHomeroomStudentReport(studentId) {
  return api.get(`/homeroom/report-cards/${studentId}`);
}

export async function finalizeHomeroomStudentReport(studentId) {
  return api.post(`/homeroom/report-cards/${studentId}/finalize`);
}

export async function downloadHomeroomStudentReport(studentId) {
  return api.download(`/homeroom/report-cards/${studentId}/download`);
}

export async function finalizeHomeroomReports(classId) { assertHomeroomClassAccess(classId); return api.post(`/homeroom/classes/${classId}/finalize`); }
export async function distributeHomeroomReports(classId) { assertHomeroomClassAccess(classId); return api.post(`/homeroom/classes/${classId}/distribute`); }
export async function saveHomeroomReportNote(studentId, note) { return api.patch(`/homeroom/report-cards/${studentId}/note`, { note }); }
