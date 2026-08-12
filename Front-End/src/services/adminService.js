import { api, downloadBlob } from "./apiClient";

export async function importAccounts(type, file) {
  const formData = new FormData();
  formData.append("file", file);
  const endpoint = type === "teacher" ? "/admin/teachers/import" : "/admin/students/import";
  return api.post(endpoint, formData);
}

export async function downloadAccountTemplate(type) {
  const endpoint = type === "teacher"
    ? "/admin/templates/teachers-csv"
    : "/admin/templates/students-csv";
  const blob = await api.download(endpoint);
  downloadBlob(blob, `template-${type === "teacher" ? "guru" : "siswa"}.csv`);
  return true;
}

export async function getUsers() {
  const [teachers, students] = await Promise.all([
    api.get("/admin/teachers"),
    api.get("/admin/students"),
  ]);
  return [
    ...teachers.items.map((item) => ({ ...item, role: "teacher", username: item.nip })),
    ...students.items.map((item) => ({ ...item, role: "student", username: item.nis })),
  ];
}

export async function getTeachers(options = {}) {
  return api.get("/admin/teachers", { query: options });
}

export async function getStudents(options = {}) {
  return api.get("/admin/students", { query: options });
}

export async function createUser({ name, username, role }) {
  const endpoint = role === "teacher" ? "/admin/teachers" : "/admin/students";
  return api.post(endpoint, role === "teacher"
    ? { name, nip: username }
    : { name, nis: username });
}

export async function resetUserPassword(userId, role) {
  const resource = role === "teacher" ? "teachers" : "students";
  return api.patch(`/admin/${resource}/${userId}/reset-password`, {});
}

export async function getSubjects() {
  const subjects = await api.get("/admin/subjects");
  return subjects.map((subject) => ({
    id: subject.id,
    code: subject.id,
    name: subject.name,
    level: subject.grade_level,
    kkm: Number(subject.kkm),
    teacher: {
      id: subject.teacher_id,
      name: subject.teacher_name,
      username: subject.teacher_nip,
    },
    formula: "Komponen Utama",
  }));
}

export async function createSubject({ name, gradeLevel, kkm, teacherId }) {
  return api.post("/admin/subjects", { name, gradeLevel, kkm, teacherId });
}

export async function updateSubject(subjectId, patch) {
  const data = await api.patch(`/admin/subjects/${subjectId}`, {
    ...(patch.kkm !== undefined ? { kkm: patch.kkm } : {}),
    ...(patch.teacherId !== undefined ? { teacherId: patch.teacherId } : {}),
  });
  return {
    id: data.id,
    code: data.id,
    name: data.name,
    level: data.grade_level,
    kkm: Number(data.kkm),
    teacher: {
      id: data.teacher_id,
      name: patch.teacherName || "Guru Pengampu",
      username: "",
    },
    formula: "Komponen Utama",
  };
}

export async function getAssessmentComponents() {
  const components = await api.get("/admin/assessment-components");
  return components.map((item) => ({
    id: item.id,
    kode: item.code,
    nama: item.name,
    bobot: Number(item.weight_percent),
    sortOrder: item.sort_order,
  }));
}

export async function updateAssessmentComponents(components) {
  return api.put("/admin/assessment-components", {
    components: components.map((item) => ({ code: item.kode, weight: Number(item.bobot) })),
  });
}

export async function getAcademicYears() {
  return api.get("/admin/academic-years");
}

export async function getSemesters() {
  return api.get("/admin/semesters");
}

export async function getClasses(options = {}) {
  return api.get("/admin/classes", { query: options });
}

export async function getClassDetail(classId) {
  return api.get(`/admin/classes/${classId}`);
}

export async function createClass(payload) {
  return api.post("/admin/classes", payload);
}

export async function setClassHomeroomTeacher(classId, teacherId) {
  return api.patch(`/admin/classes/${classId}/homeroom-teacher`, { teacherId });
}

export async function addClassSubject(classId, subjectId) {
  return api.post(`/admin/classes/${classId}/subjects`, { subjectId });
}

export async function importClassStudents(classId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return api.post(`/admin/classes/${classId}/students/import`, formData);
}

export async function downloadClassStudentTemplate() {
  const blob = await api.download("/admin/templates/class-students-xlsx");
  downloadBlob(blob, "template-siswa-kelas.xlsx");
}

export async function getAdminDashboard() {
  return api.get("/admin/dashboard");
}

export async function getAdminAttendance(options = {}) {
  return api.get("/admin/database/attendance", { query: options });
}

export async function updateAdminAttendance(sessionId, records) {
  return api.put(`/admin/attendance-sessions/${sessionId}/records`, { records });
}

export async function getAdminGrades({ classId, subjectId }) {
  return api.get("/admin/database/grades", { query: { classId, subjectId } });
}

export async function updateAdminGrades({ classId, subjectId, entries }) {
  return api.put("/admin/grades", { classId, subjectId, entries });
}

export async function getAdminReports(options = {}) {
  return api.get("/admin/database/reports", { query: options });
}

export async function downloadAdminReport(studentId, fileName) {
  const blob = await api.download(`/homeroom/report-cards/${studentId}/download`);
  downloadBlob(blob, fileName);
}

export async function getSystemStatus() {
  return api.get("/admin/system-status");
}
