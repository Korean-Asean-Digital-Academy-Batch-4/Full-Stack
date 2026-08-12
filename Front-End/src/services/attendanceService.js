import { createAttendanceCsv, triggerCsvDownload } from "../utils/attendanceExport";
import { normalizeIsoDate } from "../utils/dateFormatter";
import { api } from "./apiClient";

const apiToUiStatus = { Hadir: "PRESENT", Izin: "PERMITTED", Sakit: "SICK", Alpa: "ABSENT" };
const uiToApiStatus = { PRESENT: "Hadir", PERMITTED: "Izin", SICK: "Sakit", ABSENT: "Alpa" };

export async function getAttendance(filters) {
  const [sessions, classStudents] = await Promise.all([
    api.get(`/teacher/classes/${filters.classId}/attendance-sessions`),
    api.get(`/teacher/classes/${filters.classId}/students`),
  ]);
  const selectedSession = sessions.find((session) => normalizeIsoDate(session.session_date) === filters.date);
  const detail = selectedSession ? await api.get(`/teacher/attendance-sessions/${selectedSession.id}`) : null;
  const records = detail?.students || [];
  return {
    meetingNumber: sessions.length + (selectedSession ? 0 : 1),
    meetings: sessions.map((session, index) => ({
      number: sessions.length - index,
      date: normalizeIsoDate(session.session_date),
    })),
    students: classStudents.map((student) => {
      const record = records.find((item) => item.student_id === student.id);
      return { ...student, history: [], currentStatus: apiToUiStatus[record?.status] || "ABSENT" };
    }),
    savedRecord: selectedSession ? { ...selectedSession, sessionId: selectedSession.id } : null,
  };
}

export async function saveAttendance(payload) {
  const created = await api.post(`/teacher/classes/${payload.classId}/attendance-sessions`, { date: payload.date });
  const sessionId = created.session.id;
  await api.put(`/teacher/attendance-sessions/${sessionId}/records`, {
    records: payload.records.map((record) => ({ studentId: record.studentId, status: uiToApiStatus[record.status] })),
  });
  return { ...payload, sessionId };
}

export async function updateAttendance(payload) {
  if (!payload.sessionId) throw new Error("ATTENDANCE_SESSION_NOT_FOUND");
  await api.put(`/teacher/attendance-sessions/${payload.sessionId}/records`, {
    records: payload.records.map((record) => ({ studentId: record.studentId, status: uiToApiStatus[record.status] })),
  });
  return payload;
}

export function downloadAttendanceCsv(rows, fileName) {
  triggerCsvDownload(createAttendanceCsv(rows), fileName);
}
