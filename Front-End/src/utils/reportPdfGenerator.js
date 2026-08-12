import { assessmentComponents } from "../data/assessmentComponents";
import { teacherUser } from "../data/teacherData";

function slug(value) {
  return String(value).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function writeWrapped(doc, text, x, y, maxWidth, lineHeight = 6) {
  const lines = doc.splitTextToSize(String(text || "—"), maxWidth);
  doc.text(lines, x, y);
  return y + lines.length * lineHeight;
}

export async function buildSubjectReportPdf(report, student, assignment, { preview = false } = {}) {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = doc.internal.pageSize.getWidth();
  doc.setFillColor(7, 86, 217);
  doc.roundedRect(14, 12, 14, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.text("ET", 18, 21);
  doc.setTextColor(32, 40, 56);
  doc.setFontSize(17);
  doc.text("EduTrack — Rapor Mata Pelajaran", 34, 19);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text("SMA EduTrack Indonesia (Demo)", 34, 25);

  if (preview) {
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(28);
    doc.setFont("helvetica", "bold");
    doc.text("DRAFT — BELUM DIFINALISASI", pageWidth / 2, 150, {
      align: "center",
      angle: 35,
    });
  }

  doc.setTextColor(32, 40, 56);
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.text("Identitas Siswa", 14, 38);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const identityRows = [
    ["Nama", student.name],
    ["NIS", student.nis],
    ["Kelas", assignment.name],
    ["Mata Pelajaran", assignment.subjectName],
    ["Periode", `${assignment.semester} ${assignment.academicYear}`],
  ];
  identityRows.forEach(([label, value], index) => {
    const y = 46 + index * 6;
    doc.setTextColor(100, 116, 139);
    doc.text(label, 14, y);
    doc.setTextColor(32, 40, 56);
    doc.text(String(value), 54, y);
  });

  let y = 82;
  doc.setFont("helvetica", "bold");
  doc.text("Komponen Nilai", 14, y);
  y += 7;
  doc.setFillColor(243, 243, 255);
  doc.rect(14, y - 5, 182, 8, "F");
  doc.text("Komponen", 18, y);
  doc.text("Bobot", 88, y);
  doc.text("Nilai", 142, y);
  doc.setFont("helvetica", "normal");
  assessmentComponents.forEach((component) => {
    y += 8;
    doc.setDrawColor(228, 232, 241);
    doc.line(14, y + 2, 196, y + 2);
    doc.text(component.fullName, 18, y);
    doc.text(`${component.weight}%`, 88, y);
    doc.text(String(report.scores?.[component.id] ?? "—"), 142, y);
  });

  y += 12;
  doc.setFont("helvetica", "bold");
  doc.text(`Nilai Akhir: ${report.finalGrade ?? "Belum Lengkap"}`, 14, y);
  doc.text(`KKM: ${report.kkm}`, 88, y);
  doc.text(report.finalGrade >= report.kkm ? "Tuntas" : "Di bawah KKM", 142, y);
  y += 10;
  doc.setFont("helvetica", "normal");
  doc.text(`Kehadiran: ${report.attendance?.attended ?? 0} dari ${report.attendance?.total ?? 0} pertemuan (${report.attendancePercentage}%)`, 14, y);

  y += 11;
  doc.setFont("helvetica", "bold");
  doc.text("Topik Materi", 14, y);
  doc.setFont("helvetica", "normal");
  y = writeWrapped(
    doc,
    assessmentComponents.map((component) => `${component.label}: ${report.topics?.[component.id] || "—"}`).join("  •  "),
    14,
    y + 7,
    182,
  );

  y += 7;
  doc.setFont("helvetica", "bold");
  doc.text("Catatan Guru", 14, y);
  doc.setFont("helvetica", "normal");
  y = writeWrapped(doc, report.note || "Belum ada catatan.", 14, y + 7, 182);

  y += 8;
  doc.setTextColor(100, 116, 139);
  doc.text(`Guru Mapel: ${teacherUser.name}`, 14, y);
  doc.text(`Versi rapor: ${report.reportVersion || 1}`, 14, y + 6);
  doc.text(
    `Tanggal finalisasi: ${report.finalizedAt ? new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(new Date(report.finalizedAt)) : "Belum difinalisasi"}`,
    14,
    y + 12,
  );
  return doc;
}

export async function downloadSubjectReportPdf(report, student, assignment, options = {}) {
  const preview = options.preview ?? report.status !== "FINALIZED_SUBJECT";
  const doc = await buildSubjectReportPdf(report, student, assignment, { preview });
  const base = `rapor-mapel-${slug(student.name)}-${slug(assignment.subjectName)}`;
  const fileName = preview
    ? `preview-${base}.pdf`
    : `${base}-${assignment.academicYear.replace("/", "-")}.pdf`;
  doc.save(fileName);
  return fileName;
}
