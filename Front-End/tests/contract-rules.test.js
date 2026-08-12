import test from "node:test";
import assert from "node:assert/strict";
import { assessmentComponents, TOTAL_ASSESSMENT_WEIGHT } from "../src/data/assessmentComponents.js";
import { calculateFinalGrade } from "../src/utils/calculateFinalGrade.js";
import { isValidGradePayload, validateGradeValue } from "../src/utils/gradeValidation.js";
import { MAX_IMPORT_FILE_SIZE, validateImportFile } from "../src/utils/importFile.js";
import { isReportFinalizedForPeriod } from "../src/utils/reportFinalization.js";
import { normalizeIsoDate } from "../src/utils/dateFormatter.js";
import { groupStudentGradeRows } from "../src/utils/studentGrades.js";
import {
  canCreateReport,
  canManageGrades,
  canManageTeachingAssignment,
  canViewClassSubjectGrades,
  getActiveTeachingAssignments,
  getActiveHomeroomClassId,
  isActiveHomeroomTeacher,
} from "../src/utils/teacherPermissions.js";

test("template nilai mengikuti 8 komponen API dengan total bobot 100%", () => {
  assert.equal(assessmentComponents.length, 8);
  assert.equal(TOTAL_ASSESSMENT_WEIGHT, 100);
});

test("nilai di luar rentang 0 sampai 100 ditolak", () => {
  assert.match(validateGradeValue(-1), /0–100/);
  assert.match(validateGradeValue(101), /0–100/);
  assert.equal(validateGradeValue(0), "");
  assert.equal(validateGradeValue(100), "");
});

test("payload nilai hanya menerima komponen resmi dengan nilai 0 sampai 100", () => {
  assert.equal(isValidGradePayload({ "STD-001": { T1: 0, UAS: 100 } }, assessmentComponents), true);
  assert.equal(isValidGradePayload({ "STD-001": { T1: -1 } }, assessmentComponents), false);
  assert.equal(isValidGradePayload({ "STD-001": { UAS: 101 } }, assessmentComponents), false);
  assert.equal(isValidGradePayload({ "STD-001": { UNKNOWN: 80 } }, assessmentComponents), false);
});

test("nilai kosong tetap dianggap belum lengkap, bukan nol", () => {
  const scores = Object.fromEntries(assessmentComponents.map((component) => [component.id, 80]));
  scores.UTS = null;
  assert.equal(calculateFinalGrade(scores, assessmentComponents), null);
});

test("ringkasan siswa tidak membuat progress nilai dari komponen yang masih kosong", () => {
  const rows = assessmentComponents.map((component) => ({
    subject_id: "BIO-X",
    subject_name: "Biologi",
    grade_level: "X",
    kkm: 65,
    component_code: component.id,
    weight_percent: component.weight,
    topic: null,
    score: null,
  }));
  const [subject] = groupStudentGradeRows(rows);
  assert.equal(subject.complete, false);
  assert.equal(subject.average, null);
  assert.equal(subject.score, null);
});

test("perhitungan nilai akhir menggunakan bobot kontrak", () => {
  const scores = Object.fromEntries(assessmentComponents.map((component) => [component.id, 80]));
  assert.equal(calculateFinalGrade(scores, assessmentComponents), 80);
});

test("unggahan akun mengikuti batas multipart backend 5 MB", () => {
  assert.equal(MAX_IMPORT_FILE_SIZE, 5 * 1024 * 1024);
  assert.match(validateImportFile({ name: "guru.csv", size: MAX_IMPORT_FILE_SIZE + 1 }), /5MB/);
  assert.equal(validateImportFile({ name: "guru.csv", size: MAX_IMPORT_FILE_SIZE }), "");
  assert.match(validateImportFile({ name: "guru.pdf", size: 1000 }), /tidak didukung/);
});

test("akses wali kelas hanya aktif berdasarkan status homeroomAssignment", () => {
  assert.equal(canViewClassSubjectGrades({ role: "teacher", isHomeroomTeacher: false }), false);
  assert.equal(canViewClassSubjectGrades({ role: "teacher", isHomeroomTeacher: true }), false);
  const activeHomeroomTeacher = {
    role: "teacher",
    homeroomAssignment: { status: "active", classId: "CLS-001" },
  };
  assert.equal(isActiveHomeroomTeacher(activeHomeroomTeacher), true);
  assert.equal(canViewClassSubjectGrades(activeHomeroomTeacher), true);
  assert.equal(canCreateReport(activeHomeroomTeacher), true);
  assert.equal(getActiveHomeroomClassId(activeHomeroomTeacher), "CLS-001");
  assert.equal(isActiveHomeroomTeacher({
    role: "teacher",
    homeroomAssignment: { status: "inactive", classId: "CLS-001" },
  }), false);
  assert.equal(isActiveHomeroomTeacher({
    role: "student",
    homeroomAssignment: { status: "active", classId: "CLS-001" },
  }), false);
});

test("semua teacher dapat mengelola nilai hanya untuk teaching assignment aktifnya", () => {
  const filters = {
    classId: "CLS-001",
    subjectId: "SUB-001",
    academicYear: "2026/2027",
    semester: "GANJIL",
  };
  const regularTeacher = {
    role: "teacher",
    homeroomAssignment: null,
    teachingAssignments: [{ ...filters, status: "active" }],
  };
  const homeroomTeacher = {
    ...regularTeacher,
    homeroomAssignment: { status: "active", classId: "CLS-001" },
  };
  assert.equal(canManageGrades(regularTeacher), true);
  assert.equal(canManageGrades(homeroomTeacher), true);
  assert.equal(canManageTeachingAssignment(regularTeacher, filters), true);
  assert.equal(canManageTeachingAssignment(homeroomTeacher, filters), true);
  assert.equal(canManageTeachingAssignment(homeroomTeacher, { ...filters, subjectId: "SUB-002" }), false);
  assert.equal(getActiveTeachingAssignments({
    ...regularTeacher,
    teachingAssignments: [{ ...filters, status: "inactive" }],
  }).length, 0);
  assert.equal(canManageGrades({ role: "student", teachingAssignments: [{ ...filters, status: "active" }] }), false);
});

test("finalisasi rapor mengunci siswa hanya pada kelas dan periode yang sama", () => {
  const report = {
    studentId: "STD-001",
    classId: "CLS-001",
    academicYear: "2026/2027",
    semester: "GANJIL",
    status: "FINALIZED_SUBJECT",
  };
  const period = {
    studentId: "STD-001",
    classId: "CLS-001",
    academicYear: "2026/2027",
    semester: "ganjil",
  };
  assert.equal(isReportFinalizedForPeriod(report, period), true);
  assert.equal(isReportFinalizedForPeriod({ ...report, status: "DRAFT" }, period), false);
  assert.equal(isReportFinalizedForPeriod(report, { ...period, studentId: "STD-002" }), false);
  assert.equal(isReportFinalizedForPeriod(report, { ...period, classId: "CLS-002" }), false);
  assert.equal(isReportFinalizedForPeriod(report, { ...period, academicYear: "2027/2028" }), false);
});

test("tanggal kalender dari API tidak mundur satu hari karena konversi UTC", () => {
  assert.equal(normalizeIsoDate("2026-08-11"), "2026-08-11");
  assert.equal(normalizeIsoDate("2026-08-10T17:00:00.000Z"), "2026-08-11");
});
