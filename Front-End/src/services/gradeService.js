import { assessmentComponents } from "../data/assessmentComponents";
import { getStoredUser } from "../stores/authStore";
import {
  canManageGrades,
  canManageTeachingAssignment,
  canViewClassSubjectGrades,
  getActiveHomeroomClassId,
  getActiveTeachingAssignments,
} from "../utils/teacherPermissions";
import { api } from "./apiClient";
import { isValidGradePayload } from "../utils/gradeValidation";

export const GRADE_STATUSES = { DRAFT: "Draft" };
const COMPONENT_NAMES = {
  T1: "Tugas 1", T2: "Tugas 2", T3: "Tugas 3",
  U1: "Ulangan Harian 1", U2: "Ulangan Harian 2", U3: "Ulangan Harian 3",
  UTS: "Ujian Tengah Semester", UAS: "Ujian Akhir Semester",
};

function normalizeSemester(value) {
  return String(value).toUpperCase();
}

function resolveAssignment(filters) {
  const user = getStoredUser();
  if (!canManageGrades(user) || !canManageTeachingAssignment(user, filters)) {
    throw new Error("UNAUTHORIZED_ASSIGNMENT");
  }
  const assignedClass = getActiveTeachingAssignments(user).find(
    (item) =>
      (item.classId || item.id) === filters.classId &&
      item.subjectId === filters.subjectId &&
      item.academicYear === filters.academicYear &&
      normalizeSemester(item.semester) === normalizeSemester(filters.semester),
  );

  if (!assignedClass) throw new Error("UNAUTHORIZED_ASSIGNMENT");

  return {
    assignmentId: assignedClass.assignmentId,
    ...assignedClass,
    id: assignedClass.classId || assignedClass.id,
    classId: assignedClass.classId || assignedClass.id,
  };
}

function assertValidGrades(grades) {
  if (!isValidGradePayload(grades, assessmentComponents)) {
    throw new Error("INVALID_GRADE_VALUE");
  }
}

export async function getGradeSheet(filters) {
  const authorizedAssignment = resolveAssignment(filters);
  const [rows, topicData] = await Promise.all([
    api.get(`/teacher/classes/${filters.classId}/grades`),
    api.get(`/teacher/classes/${filters.classId}/assessment-topics`),
  ]);
  const studentMap = new Map();
  const grades = {};
  rows.forEach((row) => {
    if (!studentMap.has(row.student_id)) {
      studentMap.set(row.student_id, { id: row.student_id, name: row.student_name, nis: row.nis });
    }
    grades[row.student_id] ||= {};
    grades[row.student_id][row.component_code] = row.score == null ? null : Number(row.score);
  });

  return {
    assignment: authorizedAssignment,
    students: [...studentMap.values()],
    grades,
    status: GRADE_STATUSES.DRAFT,
    savedAt: null,
    lockedStudentIds: [],
    components: topicData.topics.map((item) => ({
      id: item.component_code,
      label: item.component_code,
      fullName: COMPONENT_NAMES[item.component_code] || item.component_code,
      weight: Number(item.weight_percent),
    })),
  };
}

export async function saveGrades(payload) {
  resolveAssignment(payload);
  assertValidGrades(payload.grades);
  const entries = Object.entries(payload.grades).flatMap(([studentId, scores]) =>
    Object.entries(scores).map(([componentCode, score]) => ({
      studentId,
      componentCode,
      score: score === "" || score === undefined ? null : Number(score),
    })),
  );
  if (!entries.length) throw new Error("EMPTY_GRADE_PAYLOAD");
  const data = await api.put(`/teacher/classes/${payload.classId}/grades`, { entries });
  return {
    success: true,
    savedAt: new Date().toISOString(),
    data: { ...data, grades: payload.grades, status: GRADE_STATUSES.DRAFT },
  };
}

export async function getLearningTopics(assignmentId, filters) {
  const assignment = resolveAssignment(filters);
  if (assignment.assignmentId !== assignmentId) throw new Error("UNAUTHORIZED_ASSIGNMENT");
  const data = await api.get(`/teacher/classes/${filters.classId}/assessment-topics`);
  return Object.fromEntries(
    data.topics.map((item) => [item.component_code, item.topic || ""]),
  );
}

export async function saveLearningTopics(payload) {
  const assignment = resolveAssignment(payload);
  if (assignment.assignmentId !== payload.assignmentId) {
    throw new Error("UNAUTHORIZED_ASSIGNMENT");
  }
  return api.put(`/teacher/classes/${payload.classId}/assessment-topics`, {
    topics: Object.keys(payload.topics).map((componentCode) => ({
      componentCode,
      topic: payload.topics[componentCode] || "",
    })),
  });
}

export async function getHomeroomSubjectGrades({ academicYear, semester, subjectId }) {
  const user = getStoredUser();
  if (!canViewClassSubjectGrades(user)) {
    throw new Error("UNAUTHORIZED_HOMEROOM_ACCESS");
  }
  const classId = getActiveHomeroomClassId(user);
  if (!classId) throw new Error("INVALID_HOMEROOM_ASSIGNMENT");

  const result = await api.get(`/homeroom/classes/${classId}/subjects/${subjectId}/grades`);
  const students = new Map();
  const grades = {};
  result.items.forEach((row) => {
    students.set(row.student_id, { id: row.student_id, name: row.student_name, nis: row.nis });
    grades[row.student_id] ||= {};
    grades[row.student_id][row.component_code] = row.score == null ? null : Number(row.score);
  });
  const components = result.components.map((component) => ({
    id: component.code,
    code: component.code,
    shortName: component.code,
    fullName: component.code,
    weight: Number(component.weight_percent),
  }));
  const finalGrades = Object.fromEntries([...students.keys()].map((studentId) => {
    const scores = grades[studentId] || {};
    const complete = components.every((component) => scores[component.id] != null);
    return [studentId, complete ? Number((components.reduce((sum, component) => sum + scores[component.id] * component.weight, 0) / 100).toFixed(2)) : null];
  }));
  return {
    class: { id: classId, name: user.homeroomAssignment.className || "Kelas Wali" },
    subject: result.subject,
    components,
    students: [...students.values()],
    grades,
    finalGrades,
    academicYear,
    semester,
  };
}
