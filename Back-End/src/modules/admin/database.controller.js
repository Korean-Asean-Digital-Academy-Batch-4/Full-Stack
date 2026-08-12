const { pool, withTransaction } = require('../../db/pool');
const { ok } = require('../../utils/response');
const AppError = require('../../utils/AppError');
const gradesService = require('../../services/grades.service');
const reportPdfService = require('../../services/reportPdf.service');

const COMPONENT_NAMES = {
  T1: 'Tugas 1', T2: 'Tugas 2', T3: 'Tugas 3',
  U1: 'Ulangan Harian 1', U2: 'Ulangan Harian 2', U3: 'Ulangan Harian 3',
  UTS: 'Ujian Tengah Semester', UAS: 'Ujian Akhir Semester',
};

async function getDashboard(req, res) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM teachers) AS teachers,
       (SELECT count(*)::int FROM students) AS students,
       (SELECT count(*)::int FROM classes) AS classes,
       (SELECT count(*)::int FROM subjects) AS subjects,
       (SELECT count(*)::int FROM attendance_sessions) AS attendance_sessions,
       (SELECT count(*)::int FROM grades WHERE score IS NOT NULL) AS recorded_grades,
       (SELECT count(*)::int FROM report_cards) AS report_cards,
       (SELECT count(*)::int FROM report_cards WHERE status = 'Distributed') AS distributed_reports,
       (SELECT ay.name FROM academic_years ay WHERE ay.is_active = true LIMIT 1) AS academic_year,
       (SELECT sem.name FROM semesters sem WHERE sem.is_active = true LIMIT 1) AS semester`
  );
  return ok(res, rows[0]);
}

async function listAssessmentComponents(req, res) {
  const { rows } = await pool.query(
    'SELECT id, code, weight_percent, sort_order FROM assessment_components ORDER BY sort_order'
  );
  return ok(res, rows.map((item) => ({ ...item, name: COMPONENT_NAMES[item.code] || item.code })));
}

async function updateAssessmentComponents(req, res) {
  const { components } = req.body;
  if (!Array.isArray(components) || components.length !== 8) {
    throw AppError.badRequest('components wajib berisi tepat 8 komponen penilaian');
  }
  const codes = components.map((item) => item.code);
  if (new Set(codes).size !== 8 || components.some((item) => !COMPONENT_NAMES[item.code])) {
    throw AppError.badRequest('Kode komponen penilaian tidak valid atau duplikat');
  }
  const weights = components.map((item) => Number(item.weight));
  if (weights.some((weight) => !Number.isFinite(weight) || weight < 0 || weight > 100)) {
    throw AppError.badRequest('Bobot harus berupa angka 0 sampai 100');
  }
  const total = weights.reduce((sum, weight) => sum + weight, 0);
  if (Math.abs(total - 100) > 0.001) throw AppError.badRequest('Total bobot harus tepat 100%');

  await withTransaction(async (client) => {
    for (let index = 0; index < components.length; index += 1) {
      await client.query(
        'UPDATE assessment_components SET weight_percent = $1, sort_order = $2 WHERE code = $3',
        [weights[index], index + 1, components[index].code]
      );
    }
  });
  return listAssessmentComponents(req, res);
}

async function listAttendance(req, res) {
  const { classId, date, subjectId } = req.query;
  const conditions = [];
  const params = [];
  if (classId) { params.push(classId); conditions.push(`ats.class_id = $${params.length}`); }
  if (date) { params.push(date); conditions.push(`ats.session_date = $${params.length}`); }
  if (subjectId) { params.push(subjectId); conditions.push(`ats.subject_id = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `SELECT ar.id, ar.session_id, ar.student_id, ar.status, ar.updated_at,
            st.nis, st.name AS student_name,
            c.id AS class_id, c.name AS class_name,
            sub.id AS subject_id, sub.name AS subject_name,
            ats.session_date, t.name AS teacher_name
       FROM attendance_records ar
       JOIN attendance_sessions ats ON ats.id = ar.session_id
       JOIN students st ON st.id = ar.student_id
       JOIN classes c ON c.id = ats.class_id
       JOIN subjects sub ON sub.id = ats.subject_id
       JOIN teachers t ON t.id = ats.teacher_id
       ${where}
      ORDER BY ats.session_date DESC, c.name, st.name`,
    params
  );
  return ok(res, { items: rows, meta: { total: rows.length } });
}

async function listGrades(req, res) {
  const { classId, subjectId } = req.query;
  if (!classId || !subjectId) throw AppError.badRequest('classId dan subjectId wajib diisi');
  const subjectResult = await pool.query(
    `SELECT s.id, s.name, s.grade_level, s.kkm, t.name AS teacher_name
       FROM subjects s JOIN teachers t ON t.id = s.teacher_id
      WHERE s.id = $1 AND EXISTS (
        SELECT 1 FROM class_subjects cs WHERE cs.class_id = $2 AND cs.subject_id = s.id
      )`,
    [subjectId, classId]
  );
  if (!subjectResult.rows.length) throw AppError.notFound('Mata pelajaran tidak terhubung ke kelas');
  const [items, components] = await Promise.all([
    gradesService.getClassGrades(classId, subjectId),
    pool.query('SELECT id, code, weight_percent, sort_order FROM assessment_components ORDER BY sort_order'),
  ]);
  return ok(res, { subject: subjectResult.rows[0], components: components.rows, items });
}

async function listReports(req, res) {
  const { classId, status } = req.query;
  const conditions = [];
  const params = [];
  if (classId) { params.push(classId); conditions.push(`rc.class_id = $${params.length}`); }
  if (status) { params.push(status); conditions.push(`rc.status = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const { rows } = await pool.query(
    `WITH subject_scores AS (
       SELECT g.student_id, g.class_id, g.subject_id,
              SUM(g.score * ac.weight_percent) / 100.0 AS final_score
         FROM grades g
         JOIN assessment_components ac ON ac.id = g.component_id
        GROUP BY g.student_id, g.class_id, g.subject_id
       HAVING COUNT(*) FILTER (WHERE g.score IS NULL) = 0 AND COUNT(*) = 8
     ), student_scores AS (
       SELECT student_id, class_id, ROUND(AVG(final_score), 2) AS average_score
         FROM subject_scores GROUP BY student_id, class_id
     )
     SELECT rc.id, rc.status, rc.general_note, rc.finalized_at, rc.distributed_at, rc.created_at,
            st.id AS student_id, st.nis, st.name AS student_name,
            c.id AS class_id, c.name AS class_name,
            ay.name AS academic_year, sem.name AS semester,
            ss.average_score
       FROM report_cards rc
       JOIN students st ON st.id = rc.student_id
       JOIN classes c ON c.id = rc.class_id
       JOIN semesters sem ON sem.id = rc.semester_id
       JOIN academic_years ay ON ay.id = sem.academic_year_id
       LEFT JOIN student_scores ss ON ss.student_id = rc.student_id AND ss.class_id = rc.class_id
       ${where}
      ORDER BY rc.created_at DESC, st.name`,
    params
  );
  return ok(res, { items: rows, meta: { total: rows.length } });
}

async function deleteReport(req, res) {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM report_cards WHERE id = $1', [id]);
  if (!rowCount) throw AppError.notFound('Rapor tidak ditemukan');
  return ok(res, null, 'Rapor berhasil dihapus');
}

async function downloadReport(req, res) {
  return reportPdfService.sendReportPdf(res, { reportId: req.params.id });
}

async function getSystemStatus(req, res) {
  const { rows } = await pool.query(
    `SELECT
       (SELECT count(*)::int FROM pg_tables WHERE schemaname = 'public') AS public_tables,
       (SELECT count(*)::int FROM pg_class c JOIN pg_namespace n ON n.oid = c.relnamespace
         WHERE n.nspname = 'public' AND c.relkind = 'r' AND c.relrowsecurity) AS rls_enabled_tables,
       (SELECT count(*)::int FROM pg_indexes WHERE schemaname = 'public') AS indexes,
       (SELECT count(*)::int FROM information_schema.table_constraints
         WHERE table_schema = 'public' AND constraint_type = 'FOREIGN KEY') AS foreign_keys,
       current_database() AS database_name,
       now() AS checked_at`
  );
  return ok(res, { databaseConnected: true, ...rows[0] });
}

module.exports = {
  getDashboard,
  listAssessmentComponents,
  updateAssessmentComponents,
  listAttendance,
  listGrades,
  listReports,
  downloadReport,
  deleteReport,
  getSystemStatus,
};
