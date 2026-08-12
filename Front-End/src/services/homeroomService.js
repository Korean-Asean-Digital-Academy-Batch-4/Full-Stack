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

export async function finalizeHomeroomReports(classId) { assertHomeroomClassAccess(classId); return api.post(`/homeroom/classes/${classId}/finalize`); }
export async function distributeHomeroomReports(classId) { assertHomeroomClassAccess(classId); return api.post(`/homeroom/classes/${classId}/distribute`); }
export async function saveHomeroomReportNote(studentId, note) { return api.patch(`/homeroom/report-cards/${studentId}/note`, { note }); }
