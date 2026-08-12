const { pool, withTransaction } = require('../../db/pool');
const { ok, fail } = require('../../utils/response');
const AppError = require('../../utils/AppError');
const { getClassCompleteness } = require('../../services/completeness.service');
const gradesService = require('../../services/grades.service');
const reportPdfService = require('../../services/reportPdf.service');
const reportNoteDraftService = require('../../services/reportNoteDraft.service');
const reportSnapshotService = require('../../services/reportSnapshot.service');

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
  const report = await reportSnapshotService.getReportData({ studentId });
  assertHomeroomOfClass(req, report.class_id);
  return ok(res, report);
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
  await pool.query(
    `INSERT INTO report_cards (class_id, student_id, semester_id, status)
     VALUES ($1, $2, $3, 'Draft')
     ON CONFLICT (student_id, semester_id) DO NOTHING`,
    [classId, studentId, kelas.rows[0].semester_id]
  );
  const report = await pool.query(
    'SELECT * FROM report_cards WHERE student_id = $1 AND semester_id = $2',
    [studentId, kelas.rows[0].semester_id]
  );
  return ok(res, report.rows[0], report.rows[0].status === 'Draft'
    ? 'Draft rapor berhasil dibuat'
    : 'Rapor sudah difinalisasi dan tidak diubah');
}

async function generateAllReports(req, res) {
  const { classId } = req.params;
  assertHomeroomOfClass(req, classId);
  const kelas = await pool.query('SELECT id, semester_id FROM classes WHERE id = $1', [classId]);
  if (!kelas.rowCount) throw AppError.notFound('Kelas tidak ditemukan');
  const { rows } = await pool.query(
    `INSERT INTO report_cards (class_id, student_id, semester_id, status)
     SELECT $1, cs.student_id, $2, 'Draft' FROM class_students cs WHERE cs.class_id = $1
     ON CONFLICT (student_id, semester_id) DO NOTHING
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
  const updated = await withTransaction(async (client) => {
    const locked = await client.query(
      'SELECT id, status, snapshot_data FROM report_cards WHERE id = $1 FOR UPDATE',
      [rows[0].id]
    );
    if (!locked.rows.length) throw AppError.notFound('Rapor belum tersedia untuk siswa ini');
    if (locked.rows[0].status !== 'Draft' || locked.rows[0].snapshot_data) {
      throw AppError.conflict('Rapor yang sudah difinalisasi tidak dapat difinalisasi ulang');
    }
    const snapshot = await reportSnapshotService.createReportSnapshot({
      reportId: rows[0].id,
      queryable: client,
    });
    const result = await client.query(
      `UPDATE report_cards
          SET status = 'Finalized', finalized_by = $1, finalized_at = now(),
              snapshot_data = $3::jsonb
        WHERE id = $2 AND status = 'Draft'
        RETURNING *`,
      [req.user.sub, rows[0].id, JSON.stringify(snapshot)]
    );
    return result.rows[0];
  });
  return ok(res, updated, 'Rapor siswa berhasil difinalisasi dan snapshot tersimpan');
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
    let count = 0;
    for (const { student_id: studentId } of studentsRes.rows) {
      await client.query(
        `INSERT INTO report_cards (class_id, student_id, semester_id, status)
         VALUES ($1, $2, $3, 'Draft')
         ON CONFLICT (student_id, semester_id) DO NOTHING`,
        [classId, studentId, kelas.semester_id]
      );
      const reportRes = await client.query(
        `SELECT id, status, snapshot_data FROM report_cards
          WHERE student_id = $1 AND semester_id = $2 FOR UPDATE`,
        [studentId, kelas.semester_id]
      );
      const report = reportRes.rows[0];
      if (!report || report.status !== 'Draft' || report.snapshot_data) continue;
      const snapshot = await reportSnapshotService.createReportSnapshot({
        reportId: report.id,
        queryable: client,
      });
      await client.query(
        `UPDATE report_cards
            SET status = 'Finalized', finalized_by = $1, finalized_at = now(),
                snapshot_data = $3::jsonb
          WHERE id = $2 AND status = 'Draft'`,
        [req.user.sub, report.id, JSON.stringify(snapshot)]
      );
      count += 1;
    }
    return count;
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
