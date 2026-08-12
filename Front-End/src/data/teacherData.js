export const teacherTeachingAssignments = [
  {
    id: "CLS-001",
    assignmentId: "ASN-001",
    classId: "CLS-001",
    name: "X-MIPA 1",
    subjectId: "SUB-001",
    subjectName: "Matematika Wajib",
    semester: "Ganjil",
    academicYear: "2026/2027",
    status: "active",
  },
  {
    id: "CLS-002",
    assignmentId: "ASN-002",
    classId: "CLS-002",
    name: "XI-IPS 1",
    subjectId: "SUB-001",
    subjectName: "Matematika Wajib",
    semester: "Ganjil",
    academicYear: "2026/2027",
    status: "active",
  },
];

export const teacherUser = {
  id: "TCH-001",
  name: "Budi Raharjo",
  displayName: "Pak Budi",
  email: "guru@sekolah.edu",
  role: "teacher",
  isHomeroomTeacher: false,
  homeroomAssignment: null,
  avatar: null,
  teachingAssignments: teacherTeachingAssignments,
  assignedClasses: teacherTeachingAssignments,
};

export const homeroomTeacherUser = {
  ...teacherUser,
  id: "TCH-002",
  name: "Budi Santoso",
  displayName: "Pak Budi",
  email: "walikelas@sekolah.edu",
  isHomeroomTeacher: true,
  homeroomAssignment: {
    id: "HMR-001",
    classId: "CLS-001",
    className: "X-MIPA 1",
    status: "active",
  },
  homeroomClass: {
    id: "CLS-001",
    name: "X-MIPA 1",
  },
};
