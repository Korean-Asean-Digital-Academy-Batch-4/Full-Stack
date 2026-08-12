export function isReportFinalizedForPeriod(report, filters) {
  return Boolean(
    report?.status === "FINALIZED_SUBJECT" &&
    report.studentId === filters?.studentId &&
    report.classId === filters?.classId &&
    report.academicYear === filters?.academicYear &&
    String(report.semester).toUpperCase() === String(filters?.semester).toUpperCase(),
  );
}
