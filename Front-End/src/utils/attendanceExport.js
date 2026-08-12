import { statusLabels } from "../data/attendanceData.js";

function escapeCsv(value) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text;
}

export function createAttendanceCsv(rows) {
  const header = ["Nama Siswa", "NIS", "P1", "P2", "P3", "P4"];
  const body = rows.map((row) => [
    row.name,
    row.nis,
    ...row.statuses.map((status) => statusLabels[status]),
  ]);
  return `\uFEFF${[header, ...body].map((row) => row.map(escapeCsv).join(",")).join("\r\n")}`;
}

export function triggerCsvDownload(content, fileName) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
