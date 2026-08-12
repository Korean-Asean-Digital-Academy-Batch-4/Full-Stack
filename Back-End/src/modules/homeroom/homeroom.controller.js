const { pool, withTransaction } = require('../../db/pool');
const { ok, fail } = require('../../utils/response');
const AppError = require('../../utils/AppError');
const { getClassCompleteness } = require('../../services/completeness.service');
const gradesService = require('../../services/grades.service');
const reportPdfService = require('../../services/reportPdf.service');
const reportNoteDraftService = require('../../services/reportNoteDraft.service');

function assertHomeroomOfClass(req, classId) {
  if (req.user.role === 'admin') return;
  if (!(req.user.isHomeroomOf || []).includes(classId)) {
    throw AppError.forbidden('Anda bukan Wali Kelas untuk kelas ini');
  }
}

async function getClassOverview(req, res) {
  const { classId } = req.params;
  assertHomeroomOfClass(req, classId);

  const studentsRes = await pool.query(
    `SELECT s.id, s.nis, s.name FROM class_students cs
     JOIN students s ON s.id = cs.student_id WHERE cs.class_id = $1 ORDER BY s.name`,
    [classId]
  );
  const gradesRes = await pool.query(
    `SELECT g.student_id, sub.name AS subject_name, sub.kkm,
            ROUND(SUM(g.score * ac.weight_percent) / 100.0, 2) AS final_score,
            COUNT(*) FILTER (WHERE g.score IS NULL) AS missing_count
     FROM class_subjects csub
     JOIN subjects sub ON sub.id = csub.subject_id
     JOIN class_students cs ON cs.class_id = csub.class_id
     LEFT JOIN grades g ON g.subject_id = sub.id AND g.student_id = cs.student_id AND g.class_id = $1
     LEFT JOIN assessment_components ac ON ac.id = g.component_id
     WHERE csub.class_id = $1
     GROUP BY g.student_id, sub.name, sub.kkm`,
    [classId]
  );

  return ok(res, { students: studentsRes.rows, grades: gradesRes.rows });
}

async function getClassCompletenessHandler(req, res) {
  const { classId } = req.params;
  assertHomeroomOfClass(req, classId);
  const completeness = await getClassCompleteness(classId);
  return ok(res, completeness);
}

async function getSubjectGrades(req, res) {
  const { classId, subjectId } = req.params;
  assertHomeroomOfClass(req, classId);
  const subject = await pool.query(
    `SELECT s.id, s.name, s.grade_level, s.kkm, t.name AS teacher_name
       FROM class_subjects cs
       JOIN subjects s ON s.id = cs.subject_id
       JOIN teachers t ON t.id = s.teacher_id
      WHERE cs.class_id = $1 AND cs.subject_id = $2`,
    [classId, subjectId]
  );
  if (!subject.rows.length) throw AppError.notFound('Mata pelajaran tidak terhubung ke kelas wali');
  const [items, components] = await Promise.all([
    gradesService.getClassGrades(classId, subjectId),
    pool.query('SELECT code, weight_percent, sort_order FROM assessment_components ORDER BY sort_order'),
  ]);
  return ok(res, { subject: subject.rows[0], components: components.rows, items });
}

async function getReportCard(req, res) {
  const { studentId } = req.params;
  const rows = await findReportCardRows(studentId);
  if (!rows.length) throw AppError.notFound('Rapor belum tersedia untuk siswa ini');
  assertHomeroomOfClass(req, rows[0].class_id);
  const [subjects, attendance] = await Promise.all([
    pool.query(
      `SELECT sub.id, sub.name, sub.kkm,
              ROUND(SUM(g.score * ac.weight_percent) / 100.0, 2) AS final_score,
              COUNT(*) FILTER (WHERE g.score IS NULL) AS missing_count,
              COUNT(g.id)::int AS recorded_components
         FROM class_subjects csub
         JOIN subjects sub ON sub.id = csub.subject_id
         LEFT JOIN grades g ON g.class_id = csub.class_id AND g.subject_id = sub.id AND g.student_id = $2
         LEFT JOIN assessment_components ac ON ac.id = g.component_id
        WHERE csub.class_id = $1
        GROUP BY sub.id, sub.name, sub.kkm ORDER BY sub.name`,
      [rows[0].class_id, studentId]
    ),
    pool.query(
      `SELECT COUNT(ar.id)::int AS total,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Hadir')::int AS attended
         FROM attendance_sessions ats
         LEFT JOIN attendance_records ar ON ar.session_id = ats.id AND ar.student_id = $2
        WHERE ats.class_id = $1`,
      [rows[0].class_id, studentId]
    ),
  ]);
  const scored = subjects.rows.filter((item) => item.final_score != null && Number(item.recorded_components) === 8 && Number(item.missing_count) === 0);
  const average = scored.length
    ? Number((scored.reduce((sum, item) => sum + Number(item.final_score), 0) / scored.length).toFixed(2))
    : null;
  const attendanceRow = attendance.rows[0] || { total: 0, attended: 0 };
  return ok(res, {
    ...rows[0],
    subjects: subjects.rows,
    average_score: average,
    attendance: attendanceRow,
    attendance_percentage: attendanceRow.total ? Math.round((attendanceRow.attended / attendanceRow.total) * 100) : 0,
  });
}

async function generateStudentReport(req, res) {
  const { classId, studentId } = req.params;
  assertHomeroomOfClass(req, classId);
  const kelas = await pool.query('SELECT id, semester_id FROM classes WHERE id = $1', [classId]);
  if (!kelas.rowCount) throw AppError.notFound('Kelas tidak ditemukan');
  const enrolled = await pool.query(
    'SELECT 1 FROM class_students WHERE class_id = $1 AND student_id = $2',
    [classId, studentId]
  );
  if (!enrolled.rowCount) throw AppError.notFound('Siswa tidak terdaftar pada kelas wali');
  const { rows } = await pool.query(
    `INSERT INTO report_cards (class_id, student_id, semester_id, status)
     VALUES ($1, $2, $3, 'Draft')
     ON CONFLICT (student_id, semester_id)
     DO UPDATE SET class_id = EXCLUDED.class_id
     RETURNING *`,
    [classId, studentId, kelas.rows[0].semester_id]
  );
  return ok(res, rows[0], 'Draft rapor berhasil dibuat');
}

async function generateAllReports(req, res) {
  const { classId } = req.params;
  assertHomeroomOfClass(req, classId);
  const kelas = await pool.query('SELECT id, semester_id FROM classes WHERE id = $1', [classId]);
  if (!kelas.rowCount) throw AppError.notFound('Kelas tidak ditemukan');
  const { rows } = await pool.query(
    `INSERT INTO report_cards (class_id, student_id, semester_id, status)
     SELECT $1, cs.student_id, $2, 'Draft' FROM class_students cs WHERE cs.class_id = $1
     ON CONFLICT (student_id, semester_id)
     DO UPDATE SET class_id = EXCLUDED.class_id
     RETURNING id, student_id, status`,
    [classId, kelas.rows[0].semester_id]
  );
  return ok(res, { generatedCount: rows.length, items: rows }, `${rows.length} draft rapor berhasil dibuat`);
}

async function updateReportCardNote(req, res) {
  const { studentId } = req.params;
  const { note } = req.body;
  if (typeof note !== 'string') throw AppError.badRequest('Catatan rapor wajib berupa teks');
  if (note.trim().length > 2000) throw AppError.badRequest('Catatan rapor maksimal 2000 karakter');
  const rows = await findReportCardRows(studentId);
  if (!rows.length) throw AppError.notFound('Rapor belum tersedia untuk siswa ini');
  assertHomeroomOfClass(req, rows[0].class_id);
  if (rows[0].status !== 'Draft') throw AppError.forbidden('Catatan rapor yang sudah difinalisasi tidak dapat diubah');

  const { rows: updated } = await pool.query(
    'UPDATE report_cards SET general_note = $1 WHERE id = $2 RETURNING *',
    [note.trim() || null, rows[0].id]
  );
  return ok(res, updated[0], 'Catatan rapor berhasil disimpan');
}

async function generateReportCardNoteDraft(req, res) {
  const { studentId } = req.params;
  const rows = await findReportCardRows(studentId);
  if (!rows.length) throw AppError.notFound('Rapor belum tersedia untuk siswa ini');
  const report = rows[0];
  assertHomeroomOfClass(req, report.class_id);
  if (report.status !== 'Draft') throw AppError.forbidden('Draf AI hanya dapat dibuat sebelum rapor difinalisasi');

  try {
    const draft = await reportNoteDraftService.generateReportNoteDraft({
      classId: report.class_id,
      studentId,
      studentName: report.student_name,
    });
    return ok(res, draft, 'Draf catatan berdasarkan nilai dan kehadiran berhasil dibuat');
  } catch (error) {
    if (error.isAiFailure) return fail(res, 503, 'AI belum dapat membuat draf. Silakan coba lagi.');
    throw error;
  }
}

async function finalizeStudentReport(req, res) {
  const { studentId } = req.params;
  const rows = await findReportCardRows(studentId);
  if (!rows.length) throw AppError.notFound('Rapor belum tersedia untuk siswa ini');
  assertHomeroomOfClass(req, rows[0].class_id);
  const completeness = await getClassCompleteness(rows[0].class_id);
  const incomplete = completeness.filter((item) => !item.isComplete);
  if (incomplete.length) {
    throw AppError.unprocessable('Rapor belum dapat difinalisasi karena nilai mata pelajaran belum lengkap', incomplete);
  }
  const { rows: updated } = await pool.query(
    `UPDATE report_cards SET status = 'Finalized', finalized_by = $1, finalized_at = now()
     WHERE id = $2 RETURNING *`,
    [req.user.sub, rows[0].id]
  );
  return ok(res, updated[0], 'Rapor siswa berhasil difinalisasi');
}

// Finalisasi seluruh siswa di kelas sekaligus (§6.3). Ditolak bila ada mapel belum lengkap.
async function finalizeClass(req, res) {
  const { classId } = req.params;
  assertHomeroomOfClass(req, classId);

  const classRes = await pool.query('SELECT * FROM classes WHERE id = $1', [classId]);
  if (!classRes.rows.length) throw AppError.notFound('Kelas tidak ditemukan');
  const kelas = classRes.rows[0];

  const completeness = await getClassCompleteness(classId);
  const incomplete = completeness.filter((c) => !c.isComplete);
  if (incomplete.length) {
    throw AppError.unprocessable(
      'Finalisasi ditolak, terdapat mata pelajaran yang belum lengkap',
      incomplete.map((c) => ({
        subject: c.subjectName,
        reason: `Data Mapel ${c.subjectName} belum ada, tolong hubungi guru yang bertanggung jawab.`,
      }))
    );
  }

  const finalizedCount = await withTransaction(async (client) => {
    const studentsRes = await client.query(
      'SELECT student_id FROM class_students WHERE class_id = $1',
      [classId]
    );
    for (const { student_id: studentId } of studentsRes.rows) {
      await client.query(
        `INSERT INTO report_cards (class_id, student_id, semester_id, status, finalized_by, finalized_at)
         VALUES ($1, $2, $3, 'Finalized', $4, now())
         ON CONFLICT (student_id, semester_id)
         DO UPDATE SET status = 'Finalized', finalized_by = EXCLUDED.finalized_by, finalized_at = now()`,
        [classId, studentId, kelas.semester_id, req.user.sub]
      );
    }
    return studentsRes.rows.length;
  });

  return ok(res, { finalizedCount }, `Rapor kelas ${kelas.name} berhasil difinalisasi`);
}

async function distributeClass(req, res) {
  const { classId } = req.params;
  assertHomeroomOfClass(req, classId);

  const { rows } = await pool.query(
    `UPDATE report_cards SET status = 'Distributed', distributed_by = $1, distributed_at = now()
     WHERE class_id = $2 AND status = 'Finalized' RETURNING id`,
    [req.user.sub, classId]
  );
  if (!rows.length) {
    throw AppError.unprocessable('Tidak ada rapor berstatus Finalized pada kelas ini untuk didistribusikan');
  }
  return ok(res, { distributedCount: rows.length }, 'Rapor berhasil didistribusikan');
}

async function downloadReportCard(req, res) {
  const { studentId } = req.params;
  const rows = await findReportCardRows(studentId);
  if (!rows.length) throw AppError.notFound('Rapor belum tersedia untuk siswa ini');
  assertHomeroomOfClass(req, rows[0].class_id);
  return reportPdfService.sendReportPdf(res, { studentId });
}

async function findReportCardRows(studentId) {
  const { rows } = await pool.query(
    `SELECT rc.*, c.name AS class_name, st.name AS student_name, st.nis,
            sem.name AS semester, ay.name AS academic_year
     FROM report_cards rc
     JOIN classes c ON c.id = rc.class_id
     JOIN students st ON st.id = rc.student_id
     JOIN semesters sem ON sem.id = rc.semester_id
     JOIN academic_years ay ON ay.id = sem.academic_year_id
     WHERE rc.student_id = $1
     ORDER BY rc.created_at DESC LIMIT 1`,
    [studentId]
  );
  return rows;
}

module.exports = {
  getClassOverview, getClassCompletenessHandler, getSubjectGrades, getReportCard, updateReportCardNote,
  generateReportCardNoteDraft,
  generateStudentReport, generateAllReports, finalizeStudentReport,
  finalizeClass, distributeClass, downloadReportCard,
};
