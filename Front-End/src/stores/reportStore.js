import { initialSubjectReports } from "../data/reportData";
import { isReportFinalizedForPeriod } from "../utils/reportFinalization";

export const SUBJECT_REPORTS_KEY = "edutrack_subject_reports";
export const REPORT_NOTES_KEY = "edutrack_report_notes";
export const REPORT_VERSIONS_KEY = "edutrack_report_versions";
export const REPORT_JOBS_KEY = "edutrack_report_generation_jobs";

function read(key, fallback = []) {
  if (typeof localStorage === "undefined") return fallback;
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return Array.isArray(value) ? value : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
  return value;
}

export function readSubjectReports() {
  const stored = read(SUBJECT_REPORTS_KEY);
  if (stored.length) return stored;
  if (typeof localStorage === "undefined") return initialSubjectReports;
  return write(SUBJECT_REPORTS_KEY, initialSubjectReports);
}

export function getSubjectReport(studentId, assignmentId) {
  return readSubjectReports().find(
    (report) => report.studentId === studentId && report.assignmentId === assignmentId,
  ) || null;
}

export function getFinalizedStudentIds(filters) {
  return new Set(
    readSubjectReports()
      .filter((report) => isReportFinalizedForPeriod(report, { ...filters, studentId: report.studentId }))
      .map((report) => report.studentId),
  );
}

export function saveSubjectReport(report) {
  const reports = readSubjectReports();
  const index = reports.findIndex(
    (item) => item.studentId === report.studentId && item.assignmentId === report.assignmentId,
  );
  if (index >= 0) reports[index] = report;
  else reports.push(report);
  write(SUBJECT_REPORTS_KEY, reports);
  return report;
}

export function saveReportNoteRecord(payload) {
  const notes = read(REPORT_NOTES_KEY);
  const next = { ...payload, savedAt: new Date().toISOString() };
  const index = notes.findIndex((item) => item.reportId === payload.reportId);
  if (index >= 0) notes[index] = next;
  else notes.push(next);
  write(REPORT_NOTES_KEY, notes);
  return next;
}

export function appendReportVersion(report, metadata = {}) {
  const versions = read(REPORT_VERSIONS_KEY);
  versions.push({ ...report, versionArchivedAt: new Date().toISOString(), ...metadata });
  write(REPORT_VERSIONS_KEY, versions);
  return versions;
}

export function saveGenerationJob(job) {
  const jobs = read(REPORT_JOBS_KEY);
  const index = jobs.findIndex((item) => item.id === job.id);
  if (index >= 0) jobs[index] = job;
  else jobs.push(job);
  write(REPORT_JOBS_KEY, jobs);
  return job;
}
