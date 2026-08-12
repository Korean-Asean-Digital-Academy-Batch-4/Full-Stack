export const studentUser = {
  id: "student-001",
  username: "123456",
  name: "Naomi",
  role: "student",
  nis: "102938",
  nisn: "0012345678",
  email: "naomi@sekolah.sch.id",
  className: "X-MIPA 1",
};

export const secondaryStudentUser = {
  id: "student-002",
  username: "654321",
  name: "Raka",
  role: "student",
  nis: "102939",
  nisn: "0012345679",
  email: "raka@sekolah.sch.id",
  className: "X-MIPA 1",
};

export const studentDashboardData = {
  studentId: studentUser.id,
  attendancePercentage: 85,
  subjects: [
    { id: "SUB-001", name: "Matematika Wajib", score: 95, status: "Aktif", icon: "calculator", accent: "emerald" },
    { id: "SUB-002", name: "Ilmu Pengetahuan Alam", score: 88, status: "Aktif", icon: "science", accent: "blue" },
    { id: "SUB-003", name: "Bahasa Indonesia", score: 90, status: "Aktif", icon: "book", accent: "emerald" },
  ],
};

export const studentDashboardDataByStudentId = {
  [studentUser.id]: studentDashboardData,
  [secondaryStudentUser.id]: {
    ...studentDashboardData,
    studentId: secondaryStudentUser.id,
  },
};

export const mockAiInsight = {
  generatedAt: "2026-08-09T09:00:00.000Z",
  dataPeriod: "Semester Ganjil 2026/2027",
  isPartialData: true,
  recommendationParagraph:
    "Capaianmu sudah baik. Prioritaskan penguatan Fisika dan konsistensi kehadiran agar hasil semester semakin stabil.",
  bullets: [
    "Nilai Fisika masih perlu ditingkatkan pada topik Hukum Newton.",
    "Kehadiran saat pembahasan Gaya dan Gerak lebih rendah dibanding materi lain.",
  ],
  actionOptions: [
    "Ulangi latihan Hukum Newton selama 20 menit.",
    "Tanyakan tugas yang belum dipahami kepada Guru Mapel.",
  ],
};

export const studentAttendanceDataByStudentId = {
  [studentUser.id]: {
    overallPercentage: 85,
    subjects: [
      { id: "SUB-001", name: "Matematika Wajib", present: 18, permitted: 1, sick: 0, absent: 1, total: 20, percentage: 90 },
      { id: "SUB-002", name: "Ilmu Pengetahuan Alam", present: 16, permitted: 1, sick: 1, absent: 2, total: 20, percentage: 80 },
      { id: "SUB-003", name: "Bahasa Indonesia", present: 17, permitted: 1, sick: 1, absent: 1, total: 20, percentage: 85 },
    ],
  },
  [secondaryStudentUser.id]: {
    overallPercentage: 90,
    subjects: [
      { id: "SUB-001", name: "Matematika Wajib", present: 18, permitted: 1, sick: 1, absent: 0, total: 20, percentage: 90 },
    ],
  },
};

const gradeComponents = {
  math: [
    { id: "math-t1", name: "Tugas 1", topic: "Trigonometri Dasar", score: 92, weight: 6 },
    { id: "math-t2", name: "Tugas 2", topic: "Aljabar Linear", score: 88, weight: 6 },
    { id: "math-t3", name: "Tugas 3", topic: "SPLDV", score: 88, weight: 6 },
    { id: "math-uh1", name: "UH 1", topic: "Trigonometri Dasar", score: 85, weight: 10 },
    { id: "math-uh2", name: "UH 2", topic: "Aljabar Linear", score: 85, weight: 10 },
    { id: "math-uh3", name: "UH 3", topic: "SPLDV", score: 85, weight: 10 },
    { id: "math-uts", name: "UTS", topic: "Ujian Tengah Semester", score: 90, weight: 26 },
    { id: "math-uas", name: "UAS", topic: "Ujian Akhir Semester", score: 94, weight: 26 },
  ],
  science: [
    { id: "science-t1", name: "Tugas 1", topic: "Sistem Organisasi Kehidupan", score: 82, weight: 20 },
    { id: "science-uh1", name: "UH 1", topic: "Ekosistem", score: 78, weight: 20 },
    { id: "science-uts", name: "UTS", topic: "Ujian Tengah Semester", score: 80, weight: 30 },
    { id: "science-uas", name: "UAS", topic: "Ujian Akhir Semester", score: 80, weight: 30 },
  ],
  indonesian: [
    { id: "indonesian-t1", name: "Tugas 1", topic: "Teks Laporan Hasil Observasi", score: 84, weight: 20 },
    { id: "indonesian-uh1", name: "UH 1", topic: "Teks Eksposisi", score: 81, weight: 20 },
    { id: "indonesian-uts", name: "UTS", topic: "Ujian Tengah Semester", score: 82, weight: 30 },
    { id: "indonesian-uas", name: "UAS", topic: "Ujian Akhir Semester", score: 83, weight: 30 },
  ],
  english: [
    { id: "english-t1", name: "Tugas 1", topic: "Descriptive Text", score: 90, weight: 20 },
    { id: "english-uh1", name: "UH 1", topic: "Recount Text", score: 91, weight: 20 },
    { id: "english-uts", name: "UTS", topic: "Ujian Tengah Semester", score: 90, weight: 30 },
    { id: "english-uas", name: "UAS", topic: "Ujian Akhir Semester", score: 93, weight: 30 },
  ],
};

const studentGradeDetails = [
  { id: "math", subject: "Matematika Wajib", average: 89.8, badgeTone: "blue", components: gradeComponents.math },
  { id: "science", subject: "Ilmu Pengetahuan Alam", average: 80.0, badgeTone: "blue", components: gradeComponents.science },
  { id: "indonesian", subject: "Bahasa Indonesia", average: 82.5, badgeTone: "blue", components: gradeComponents.indonesian },
  { id: "english", subject: "Bahasa Inggris", average: 91.0, badgeTone: "green", components: gradeComponents.english },
];

export const studentGradesDataByStudentId = {
  [studentUser.id]: {
    studentId: studentUser.id,
    academicYear: "2026/2027",
    semester: "Semester Ganjil",
    subjects: studentGradeDetails,
  },
  [secondaryStudentUser.id]: {
    studentId: secondaryStudentUser.id,
    academicYear: "2026/2027",
    semester: "Semester Ganjil",
    subjects: studentGradeDetails,
  },
};

const distributedReport = {
  status: "Distributed",
  academicYear: "2026/2027",
  semester: "Semester Ganjil",
  average: 88.5,
  attendancePercentage: 85,
  subjects: [
    { id: "report-math", name: "Matematika Wajib", score: 92 },
    { id: "report-science", name: "IPA (Biologi)", score: 85 },
    { id: "report-indonesian", name: "Bahasa Indonesia", score: 89 },
    { id: "report-english", name: "Bahasa Inggris", score: 94 },
  ],
  teacherNote:
    "{studentName} menunjukkan performa konsisten di atas rata-rata kelas (82.1). Berdasarkan tren nilai, {studentName} memiliki potensi besar di bidang studi Bahasa dan Komunikasi. Disarankan untuk mengambil program pengayaan di kompetisi debat atau penulisan ilmiah.",
};

export const studentReportDataByStudentId = {
  [studentUser.id]: { ...distributedReport, id: "report-001", studentId: studentUser.id },
  [secondaryStudentUser.id]: { ...distributedReport, id: "report-002", studentId: secondaryStudentUser.id },
};

export const studentProfileDataByStudentId = {
  [studentUser.id]: { joinedAt: "Juli 2023", status: "Aktif", roleLabel: "Siswa" },
  [secondaryStudentUser.id]: { joinedAt: "Juli 2023", status: "Aktif", roleLabel: "Siswa" },
};
