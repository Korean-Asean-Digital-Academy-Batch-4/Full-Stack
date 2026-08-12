export const ATTENDANCE_STATUS = {
  PRESENT: "PRESENT",
  PERMITTED: "PERMITTED",
  SICK: "SICK",
  ABSENT: "ABSENT",
  NOT_RECORDED: "NOT_RECORDED",
};

export const statusLabels = {
  PRESENT: "Hadir",
  PERMITTED: "Izin",
  SICK: "Sakit",
  ABSENT: "Alpa",
  NOT_RECORDED: "Belum Dicatat",
};

export const students = [
  { id: "STD-001", name: "Budi Santoso", nis: "10123" },
  { id: "STD-002", name: "Siti Aminah", nis: "10124" },
  { id: "STD-003", name: "Naomi", nis: "10125" },
  { id: "STD-004", name: "Anton", nis: "10126" },
];

export const meetingHistory = [
  { number: 1, date: "2026-07-12" },
  { number: 2, date: "2026-07-19" },
  { number: 3, date: "2026-07-26" },
];

export const historyByStudent = {
  "STD-001": ["PRESENT", "PRESENT", "ABSENT"],
  "STD-002": ["PRESENT", "PRESENT", "PRESENT"],
  "STD-003": ["PRESENT", "PERMITTED", "PRESENT"],
  "STD-004": ["ABSENT", "ABSENT", "SICK"],
};
