const PDFDocument = require('pdfkit');
const { pool } = require('../db/pool');
const AppError = require('../utils/AppError');

const BLUE = '#0756D9';
const NAVY = '#20232D';
const MUTED = '#697184';
const BORDER = '#DDE3EE';
const LIGHT_BLUE = '#F3F7FF';

function safeFilePart(value) {
  return String(value || 'siswa').replace(/[^a-zA-Z0-9_-]+/g, '-');
}

function scorePredicate(score, kkm) {
  if (score == null) return '-';
  if (Number(score) >= 90) return 'A';
  if (Number(score) >= Number(kkm)) return 'B';
  if (Number(score) >= Number(kkm) - 10) return 'C';
  return 'D';
}

async function getReportData({ reportId, studentId }) {
  const condition = reportId ? 'rc.id = $1' : 'rc.student_id = $1';
  const value = reportId || studentId;
  const { rows } = await pool.query(
    `SELECT rc.*, c.name AS class_name, st.name AS student_name, st.nis,
            sem.name AS semester, ay.name AS academic_year,
            ht.name AS homeroom_teacher_name
       FROM report_cards rc
       JOIN classes c ON c.id = rc.class_id
       JOIN students st ON st.id = rc.student_id
       JOIN semesters sem ON sem.id = rc.semester_id
       JOIN academic_years ay ON ay.id = sem.academic_year_id
       LEFT JOIN teachers ht ON ht.id = c.homeroom_teacher_id
      WHERE ${condition}
      ORDER BY rc.created_at DESC LIMIT 1`,
    [value]
  );
  if (!rows.length) throw AppError.notFound('Rapor belum tersedia');
  const report = rows[0];

  const [subjectsResult, attendanceResult] = await Promise.all([
    pool.query(
      `SELECT sub.id, sub.name, sub.kkm, t.name AS teacher_name,
              CASE
                WHEN COUNT(g.id) = 8 AND COUNT(g.id) FILTER (WHERE g.score IS NULL) = 0
                THEN ROUND(SUM(g.score * ac.weight_percent) / 100.0, 2)
                ELSE NULL
              END AS final_score
         FROM class_subjects csub
         JOIN subjects sub ON sub.id = csub.subject_id
         JOIN teachers t ON t.id = sub.teacher_id
         LEFT JOIN grades g ON g.class_id = csub.class_id
          AND g.subject_id = sub.id AND g.student_id = $2
         LEFT JOIN assessment_components ac ON ac.id = g.component_id
        WHERE csub.class_id = $1
        GROUP BY sub.id, sub.name, sub.kkm, t.name
        ORDER BY sub.name`,
      [report.class_id, report.student_id]
    ),
    pool.query(
      `SELECT COUNT(ar.id)::int AS total,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Hadir')::int AS hadir,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Izin')::int AS izin,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Sakit')::int AS sakit,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Alpa')::int AS alpa
         FROM attendance_sessions ats
         LEFT JOIN attendance_records ar ON ar.session_id = ats.id AND ar.student_id = $2
        WHERE ats.class_id = $1`,
      [report.class_id, report.student_id]
    ),
  ]);
  const scored = subjectsResult.rows.filter((item) => item.final_score != null);
  const average = scored.length
    ? Number((scored.reduce((sum, item) => sum + Number(item.final_score), 0) / scored.length).toFixed(2))
    : null;
  const attendance = attendanceResult.rows[0] || { total: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  return {
    ...report,
    subjects: subjectsResult.rows,
    average_score: average,
    attendance,
    attendance_percentage: attendance.total
      ? Math.round((Number(attendance.hadir) / Number(attendance.total)) * 100)
      : 0,
  };
}

function drawLabelValue(doc, label, value, x, y, width) {
  doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(label.toUpperCase(), x, y, { width });
  doc.font('Helvetica-Bold').fontSize(10).fillColor(NAVY).text(String(value || '-'), x, y + 14, { width });
}

function drawFooter(doc, data) {
  const range = doc.bufferedPageRange();
  for (let pageIndex = range.start; pageIndex < range.start + range.count; pageIndex += 1) {
    doc.switchToPage(pageIndex);
    doc.moveTo(48, 770).lineTo(547, 770).strokeColor(BORDER).stroke();
    doc.font('Helvetica').fontSize(7).fillColor(MUTED)
      .text(`EduTrack - Rapor ${data.student_name}`, 48, 777, { width: 390, lineBreak: false })
      .text(`Halaman ${pageIndex + 1} dari ${range.count}`, 438, 777, { width: 109, align: 'right', lineBreak: false });
  }
}

function buildReportPdf(data) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margins: { top: 42, right: 48, bottom: 55, left: 48 }, bufferPages: true, info: { Title: `Rapor ${data.student_name}`, Author: 'EduTrack' } });
    const chunks = [];
    doc.on('data', (chunk) => chunks.push(chunk));
    doc.on('error', reject);
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.roundedRect(48, 42, 499, 82, 12).fill(BLUE);
    doc.font('Helvetica-Bold').fontSize(22).fillColor('#FFFFFF').text('RAPOR SEMESTER', 68, 62);
    doc.font('Helvetica').fontSize(9).fillColor('#DCE8FF').text('EduTrack - Sistem Informasi Akademik', 68, 93);
    doc.font('Helvetica-Bold').fontSize(10).fillColor('#FFFFFF')
      .text(`${data.semester} | ${data.academic_year}`, 355, 74, { width: 170, align: 'right' });

    if (data.status === 'Draft') {
      doc.save().rotate(-28, { origin: [298, 410] }).font('Helvetica-Bold').fontSize(42)
        .fillColor('#E6ECF7').opacity(0.55).text('DRAFT', 165, 385, { width: 270, align: 'center' }).restore().opacity(1);
    }

    doc.roundedRect(48, 142, 499, 78, 10).fill(LIGHT_BLUE).strokeColor(BORDER).stroke();
    drawLabelValue(doc, 'Nama siswa', data.student_name, 66, 160, 190);
    drawLabelValue(doc, 'NIS', data.nis, 270, 160, 120);
    drawLabelValue(doc, 'Kelas', data.class_name, 406, 160, 120);

    const summaryY = 238;
    const cards = [
      ['Rata-rata Nilai', data.average_score ?? '-'],
      ['Kehadiran', `${data.attendance_percentage}%`],
      ['Status Rapor', data.status],
    ];
    cards.forEach(([label, value], index) => {
      const x = 48 + (index * 169);
      doc.roundedRect(x, summaryY, 155, 62, 9).lineWidth(1).strokeColor(BORDER).stroke();
      doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(label.toUpperCase(), x + 14, summaryY + 13, { width: 127 });
      doc.font('Helvetica-Bold').fontSize(16).fillColor(BLUE).text(String(value), x + 14, summaryY + 31, { width: 127 });
    });

    let y = 326;
    doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY).text('Rangkuman Nilai Mata Pelajaran', 48, y);
    y += 25;
    const columns = [48, 76, 262, 405, 447, 500];
    doc.rect(48, y, 499, 27).fill('#EEF3FA');
    ['NO', 'MATA PELAJARAN', 'GURU', 'KKM', 'NILAI', 'PRED.'].forEach((label, index) => {
      doc.font('Helvetica-Bold').fontSize(7).fillColor(MUTED).text(label, columns[index] + 5, y + 10, { width: (columns[index + 1] || 547) - columns[index] - 8 });
    });
    y += 27;
    const rowHeight = 33;
    data.subjects.forEach((subject, index) => {
      if (y + rowHeight > 730) {
        doc.addPage();
        y = 54;
      }
      if (index % 2 === 1) doc.rect(48, y, 499, rowHeight).fill('#FAFBFD');
      const values = [index + 1, subject.name, subject.teacher_name, subject.kkm, subject.final_score ?? '-', scorePredicate(subject.final_score, subject.kkm)];
      values.forEach((value, columnIndex) => {
        doc.font(columnIndex === 4 ? 'Helvetica-Bold' : 'Helvetica').fontSize(8).fillColor(columnIndex === 4 ? BLUE : NAVY)
          .text(String(value), columns[columnIndex] + 5, y + 11, { width: (columns[columnIndex + 1] || 547) - columns[columnIndex] - 8, ellipsis: true });
      });
      doc.moveTo(48, y + rowHeight).lineTo(547, y + rowHeight).strokeColor(BORDER).stroke();
      y += rowHeight;
    });

    y += 24;
    if (y + 185 > 750) { doc.addPage(); y = 54; }
    doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY).text('Rekap Kehadiran', 48, y);
    y += 24;
    const attendanceItems = [
      ['Hadir', data.attendance.hadir], ['Izin', data.attendance.izin],
      ['Sakit', data.attendance.sakit], ['Alpa', data.attendance.alpa],
    ];
    attendanceItems.forEach(([label, value], index) => {
      const x = 48 + (index * 126);
      doc.roundedRect(x, y, 115, 42, 7).fill(LIGHT_BLUE);
      doc.font('Helvetica').fontSize(8).fillColor(MUTED).text(label, x + 10, y + 8);
      doc.font('Helvetica-Bold').fontSize(14).fillColor(NAVY).text(String(value || 0), x + 10, y + 21);
    });

    y += 65;
    doc.font('Helvetica-Bold').fontSize(13).fillColor(NAVY).text('Catatan Wali Kelas', 48, y);
    doc.font('Helvetica').fontSize(8).fillColor(MUTED)
      .text(data.homeroom_teacher_name || '-', 350, y + 2, { width: 197, align: 'right' });
    y += 22;
    const note = data.general_note || 'Belum ada catatan wali kelas.';
    const noteHeight = Math.max(65, doc.heightOfString(note, { width: 463, lineGap: 3 }) + 26);
    doc.roundedRect(48, y, 499, noteHeight, 9).fill('#FAFBFD').strokeColor(BORDER).stroke();
    doc.font('Helvetica').fontSize(9).fillColor(NAVY).text(note, 66, y + 15, { width: 463, lineGap: 3 });
    drawFooter(doc, data);
    doc.end();
  });
}

async function sendReportPdf(res, options) {
  const data = await getReportData(options);
  const pdf = await buildReportPdf(data);
  const filename = `rapor-${safeFilePart(data.nis || data.student_id)}.pdf`;
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
  res.setHeader('Content-Length', pdf.length);
  return res.send(pdf);
}

module.exports = { buildReportPdf, getReportData, sendReportPdf };
