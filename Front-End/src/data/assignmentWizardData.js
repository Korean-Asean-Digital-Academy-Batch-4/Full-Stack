export const assignmentTeachers = [
  { id: "teacher-budi", name: "Budi Santoso, M.Pd.", initials: "BS", nip: "198203152006041002" },
  { id: "teacher-siti", name: "Siti Rahmawati, S.Si.", initials: "SR", nip: "198609082010012008" },
  { id: "teacher-ahmad", name: "Ahmad Ridwan, S.Pd., M.Kom", initials: "AR", nip: "198108122005011006" },
];

export const assignmentSemesterOptions = [
  { id: "Ganjil", name: "Ganjil" },
  { id: "Genap", name: "Genap" },
];

export const assignmentAcademicYearOptions = [
  { id: "2023/2024", name: "2023/2024" },
  { id: "2024/2025", name: "2024/2025" },
  { id: "2025/2026", name: "2025/2026" },
  { id: "2026/2027", name: "2026/2027" },
];

export const assignmentSubjects = [
  { id: "math", name: "Matematika" },
  { id: "indonesian", name: "Bahasa Indonesia" },
  { id: "english", name: "Bahasa Inggris" },
  { id: "physics", name: "Fisika" },
  { id: "chemistry", name: "Kimia" },
];

export const createInitialAssignmentClasses = () => [
  {
    id: "class-x-mipa-1",
    name: "Kelas X-MIPA-1",
    shortName: "X-MIPA-1",
    studentCount: 36,
    homeroomTeacherId: "teacher-budi",
    subjects: [
      { id: "subject-math", subjectId: "math", teacherId: "teacher-siti" },
      { id: "subject-indonesian", subjectId: "indonesian", teacherId: "" },
    ],
  },
];

export const classXStudentPreview = [
  { id: "student-1", nis: "10234", name: "Ahmad Fauzi" },
  { id: "student-2", nis: "10235", name: "Siti Aminah" },
  { id: "student-3", nis: "10236", name: "Bintang Ramadhan" },
  { id: "student-4", nis: "10237", name: "Diana Kusuma" },
];

export const classXStudentTotal = 32;
