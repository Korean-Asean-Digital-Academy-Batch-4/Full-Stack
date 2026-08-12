import { assessmentComponents } from "./assessmentComponents";
import { defaultLearningTopics, GRADE_KKM, initialGrades } from "./gradeData";

export const REPORT_STATUSES = {
  NOT_CREATED: "NOT_CREATED",
  GENERATING: "GENERATING",
  DRAFT: "DRAFT",
  FINALIZED_SUBJECT: "FINALIZED_SUBJECT",
  REOPENED: "REOPENED",
  ERROR: "ERROR",
};

export const reportStudents = [
  { id: "STD-001", name: "Aditya Ananta", nis: "102938", initials: "AA", avatarColor: "blue" },
  { id: "STD-002", name: "Bunga Safira", nis: "102939", initials: "BS", avatarColor: "purple" },
  { id: "STD-003", name: "Chandra Dinata", nis: "102940", initials: "CD", avatarColor: "orange" },
  { id: "STD-004", name: "Naomi", nis: "102941", initials: "N", avatarColor: "teal" },
];

export const reportScores = {
  ...initialGrades,
  "STD-004": { T1: 90, T2: 89, U1: 85, U2: 89, UTS: 85, UAS: 90 },
};

export const attendanceByStudent = {
  "STD-001": { attended: 18, total: 20 },
  "STD-002": { attended: 20, total: 20 },
  "STD-003": { attended: 17, total: 20 },
  "STD-004": { attended: 19, total: 20 },
};

export const defaultNaomiNote =
  "Naomi menunjukkan performa sangat baik pada tugas dan ulangan harian. Hasil UTS perlu ditingkatkan dengan mengulang materi pertengahan semester. Secara keseluruhan, Naomi aktif dalam diskusi kelas.";

export const initialSubjectReports = [
  {
    id: "RPT-SUB-002",
    studentId: "STD-002",
    assignmentId: "ASN-001",
    classId: "CLS-001",
    subjectId: "SUB-001",
    academicYear: "2026/2027",
    semester: "GANJIL",
    status: REPORT_STATUSES.DRAFT,
    scores: reportScores["STD-002"],
    finalGrade: 89.5,
    kkm: GRADE_KKM,
    attendancePercentage: 100,
    attendance: attendanceByStudent["STD-002"],
    topics: defaultLearningTopics,
    note: "Bunga konsisten menunjukkan penguasaan materi yang sangat baik. Pertahankan ketelitian dalam menyelesaikan soal bertahap.",
    noteReviewed: true,
    sourceFacts: ["Nilai akhir 89.5", "Kehadiran 20 dari 20 pertemuan"],
    generatedAt: "2026-10-24T01:10:00.000Z",
    finalizedAt: null,
    finalizedBy: null,
    distributedAt: null,
    reportVersion: 1,
  },
  {
    id: "RPT-SUB-004",
    studentId: "STD-004",
    assignmentId: "ASN-001",
    classId: "CLS-001",
    subjectId: "SUB-001",
    academicYear: "2026/2027",
    semester: "GANJIL",
    status: REPORT_STATUSES.DRAFT,
    scores: reportScores["STD-004"],
    finalGrade: 88,
    kkm: GRADE_KKM,
    attendancePercentage: 95,
    attendance: attendanceByStudent["STD-004"],
    topics: defaultLearningTopics,
    note: defaultNaomiNote,
    noteReviewed: true,
    sourceFacts: ["Nilai akhir 88.0", "Kehadiran 19 dari 20 pertemuan", "Nilai UTS 85"],
    generatedAt: "2026-10-24T01:15:00.000Z",
    finalizedAt: null,
    finalizedBy: null,
    distributedAt: null,
    reportVersion: 1,
  },
];

export const reportAssessmentComponents = assessmentComponents;
