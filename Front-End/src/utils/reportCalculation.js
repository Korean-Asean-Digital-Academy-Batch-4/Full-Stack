import { assessmentComponents } from "../data/assessmentComponents";
import { calculateFinalGrade } from "./calculateFinalGrade";

export function calculateSubjectFinalGrade(scores) {
  return calculateFinalGrade(scores, assessmentComponents);
}

export function calculateAttendancePercentage(attendance) {
  if (!attendance?.total) return 0;
  return Math.round((attendance.attended / attendance.total) * 100);
}

export function calculateSemesterAverage(finalizedReports) {
  if (!finalizedReports.length || finalizedReports.some((report) => report.finalGrade == null)) {
    return null;
  }
  const total = finalizedReports.reduce((sum, report) => sum + report.finalGrade, 0);
  return Number((total / finalizedReports.length).toFixed(1));
}
