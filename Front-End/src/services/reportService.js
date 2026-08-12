import { assessmentComponents, TOTAL_ASSESSMENT_WEIGHT } from "../data/assessmentComponents";
import { defaultLearningTopics, GRADE_KKM } from "../data/gradeData";
import {
  attendanceByStudent,
  REPORT_STATUSES,
  reportScores,
  reportStudents,
} from "../data/reportData";
import { teacherUser } from "../data/teacherData";
import { getStoredUser } from "../stores/authStore";
import { getOfficialGradeRecord, getTopicRecord } from "../stores/gradeStore";
import {
  appendReportVersion,
  getSubjectReport,
  readSubjectReports,
  saveGenerationJob,
  saveReportNoteRecord,
  saveSubjectReport,
} from "../stores/reportStore";
import { calculateAttendancePercentage, calculateSubjectFinalGrade } from "../utils/reportCalculation";
import { downloadSubjectReportPdf } from "../utils/reportPdfGenerator";
import { sanitizeReportNote, validateReportGeneration } from "../utils/reportValidation";
import { canCreateReport, getActiveHomeroomClassId } from "../utils/teacherPermissions";

const wait = (duration, signal) => new Promise((resolve, reject) => {
  const timer = setTimeout(resolve, duration);
  if (!signal) return;
  signal.addEventListener("abort", () => {
    clearTimeout(timer);
    reject(new DOMException("Proses dibatalkan", "AbortError"));
  }, { once: true });
});

function assignmentIdFor(classId) {
  return classId === "CLS-001" ? "ASN-001" : "ASN-002";
}

function assertReportClassAccess(classId) {
  const user = getStoredUser();
  if (!canCreateReport(user) || !classId || getActiveHomeroomClassId(user) !== classId) {
    throw new Error("UNAUTHORIZED_HOMEROOM_REPORT_ACCESS");
  }
}

function resolveAssignment(filters) {
  assertReportClassAccess(filters.classId);
  const assignment = teacherUser.assignedClasses.find(
    (item) =>
      item.id === filters.classId &&
      item.subjectId === filters.subjectId &&
      item.academicYear === filters.academicYear &&
      item.semester.toUpperCase() === String(filters.semester).toUpperCase(),
  );
  if (!assignment) throw new Error("UNAUTHORIZED_ASSIGNMENT");
  return { ...assignment, classId: assignment.id, assignmentId: assignmentIdFor(assignment.id) };
}

function scoresFor(studentId, filters) {
  const official = getOfficialGradeRecord(filters);
  return official?.grades?.[studentId] || reportScores[studentId] || null;
}

function studentsForClass(classId) {
  return classId === "CLS-002" ? reportStudents.slice(0, 1) : reportStudents;
}

function buildReport(student, assignment, filters, existing = null) {
  const scores = scoresFor(student.id, filters);
  const attendance = attendanceByStudent[student.id] || { attended: 0, total: 0 };
  const topicRecord = getTopicRecord(assignment.assignmentId);
  return {
    id: existing?.id || `RPT-SUB-${student.id.replace("STD-", "")}`,
    studentId: student.id,
    assignmentId: assignment.assignmentId,
    classId: assignment.classId,
    subjectId: assignment.subjectId,
    academicYear: filters.academicYear,
    semester: String(filters.semester).toUpperCase(),
    status: REPORT_STATUSES.DRAFT,
    finalGrade: calculateSubjectFinalGrade(scores),
    kkm: GRADE_KKM,
    attendancePercentage: calculateAttendancePercentage(attendance),
    attendance,
    scores,
    topics: topicRecord?.topics || defaultLearningTopics,
    note: existing?.note || "",
    noteReviewed: Boolean(existing?.noteReviewed),
    sourceFacts: [
      `Nilai akhir ${calculateSubjectFinalGrade(scores) ?? "belum lengkap"}`,
      `Kehadiran ${attendance.attended} dari ${attendance.total} pertemuan`,
    ],
    generatedAt: new Date().toISOString(),
    finalizedAt: existing?.finalizedAt || null,
    finalizedBy: existing?.finalizedBy || null,
    distributedAt: null,
    reportVersion: existing?.reportVersion || 1,
  };
}

export async function getReportStudents(filters) {
  await wait(650);
  const assignment = resolveAssignment(filters);
  const reports = readSubjectReports().map((report) => {
    if (report.status !== REPORT_STATUSES.GENERATING) return report;
    const recovered = { ...report, status: REPORT_STATUSES.NOT_CREATED };
    saveSubjectReport(recovered);
    return recovered;
  });
  const students = studentsForClass(filters.classId).map((student) => {
    const scores = scoresFor(student.id, filters);
    const report = reports.find(
      (item) => item.studentId === student.id && item.assignmentId === assignment.assignmentId,
    );
    return {
      ...student,
      scores,
      finalGrade: calculateSubjectFinalGrade(scores),
      reportStatus: report?.status || REPORT_STATUSES.NOT_CREATED,
      reportId: report?.id || null,
    };
  });
  return { assignment, students };
}

export async function generateStudentReport(payload, options = {}) {
  const assignment = resolveAssignment(payload.filters);
  const student = reportStudents.find((item) => item.id === payload.studentId);
  if (!student) throw new Error("STUDENT_NOT_FOUND");
  const scores = scoresFor(student.id, payload.filters);
  const problems = validateReportGeneration({ scores, assignment });
  if (problems.length || TOTAL_ASSESSMENT_WEIGHT !== 100 || assessmentComponents.length !== 8) {
    throw new Error(problems[0] || "INVALID_REPORT_DATA");
  }
  const existing = getSubjectReport(student.id, assignment.assignmentId);
  const previousStatus = existing?.status || REPORT_STATUSES.NOT_CREATED;
  saveSubjectReport({
    ...(existing || buildReport(student, assignment, payload.filters)),
    status: REPORT_STATUSES.GENERATING,
  });
  try {
    await wait(options.delay ?? 1150, options.signal);
  } catch (error) {
    if (error.name === "AbortError") {
      saveSubjectReport({
        ...(existing || buildReport(student, assignment, payload.filters)),
        status: previousStatus,
      });
    }
    throw error;
  }
  if (options.simulateError) {
    const failed = { ...(existing || buildReport(student, assignment, payload.filters)), status: REPORT_STATUSES.ERROR };
    saveSubjectReport(failed);
    throw new Error("REPORT_GENERATION_FAILED");
  }
  return saveSubjectReport(buildReport(student, assignment, payload.filters, existing));
}

export async function generateAllReports(payload, options = {}) {
  assertReportClassAccess(payload.filters.classId);
  const eligibleIds = payload.studentIds || [];
  const job = {
    id: `JOB-${Date.now()}`,
    assignmentId: assignmentIdFor(payload.filters.classId),
    total: eligibleIds.length,
    completed: 0,
    failed: 0,
    status: "RUNNING",
    startedAt: new Date().toISOString(),
  };
  saveGenerationJob(job);
  const results = [];
  for (let index = 0; index < eligibleIds.length; index += 1) {
    if (options.signal?.aborted) break;
    const studentId = eligibleIds[index];
    try {
      const report = await generateStudentReport(
        { studentId, filters: payload.filters },
        { signal: options.signal, delay: 700, simulateError: options.failIds?.includes(studentId) },
      );
      results.push({ studentId, success: true, report });
      job.completed += 1;
    } catch (error) {
      if (error.name === "AbortError") break;
      results.push({ studentId, success: false, error: error.message });
      job.failed += 1;
    }
    saveGenerationJob({ ...job });
    options.onProgress?.({ processed: index + 1, total: eligibleIds.length, completed: job.completed, failed: job.failed });
  }
  job.status = options.signal?.aborted ? "CANCELLED" : "COMPLETED";
  job.finishedAt = new Date().toISOString();
  saveGenerationJob(job);
  return { ...job, results };
}

export async function getStudentReport(studentId, assignmentId = "ASN-001") {
  await wait(500);
  const report = getSubjectReport(studentId, assignmentId);
  if (!report) throw new Error("REPORT_NOT_FOUND");
  assertReportClassAccess(report.classId);
  const student = reportStudents.find((item) => item.id === studentId);
  const assignment = teacherUser.assignedClasses.find(
    (item) => assignmentIdFor(item.id) === assignmentId && item.subjectId === report.subjectId,
  );
  if (!student || !assignment) throw new Error("UNAUTHORIZED_REPORT");
  return { report, student, assignment: { ...assignment, assignmentId, classId: assignment.id } };
}

export async function saveReportNote(payload) {
  await wait(650);
  const report = getSubjectReport(payload.studentId, payload.assignmentId);
  if (!report || report.status === REPORT_STATUSES.FINALIZED_SUBJECT) throw new Error("REPORT_LOCKED");
  assertReportClassAccess(report.classId);
  const note = sanitizeReportNote(payload.note);
  const updated = saveSubjectReport({ ...report, note, noteReviewed: true, noteSavedAt: new Date().toISOString() });
  saveReportNoteRecord({ reportId: report.id, studentId: report.studentId, assignmentId: report.assignmentId, note });
  return updated;
}

export async function finalizeSubjectReport(payload) {
  await wait(900);
  const report = getSubjectReport(payload.studentId, payload.assignmentId);
  if (!report) throw new Error("REPORT_NOT_FOUND");
  assertReportClassAccess(report.classId);
  const currentUser = getStoredUser();
  appendReportVersion(report, { action: "FINALIZE", actorId: currentUser.id });
  const updated = saveSubjectReport({
    ...report,
    status: REPORT_STATUSES.FINALIZED_SUBJECT,
    finalizedAt: new Date().toISOString(),
    finalizedBy: currentUser.id,
    reportVersion: (report.reportVersion || 1) + 1,
  });
  return updated;
}

export async function downloadSubjectReport(payload) {
  assertReportClassAccess(payload.report?.classId);
  await wait(350);
  return downloadSubjectReportPdf(payload.report, payload.student, payload.assignment, { preview: payload.preview });
}
