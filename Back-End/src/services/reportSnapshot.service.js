const { pool } = require('../db/pool');
const AppError = require('../utils/AppError');

function numberOrNull(value) {
  return value == null ? null : Number(value);
}

function normalizeAttendance(row = {}) {
  const hadir = Number(row.hadir || 0);
  return {
    total: Number(row.total || 0),
    hadir,
    attended: hadir,
    izin: Number(row.izin || 0),
    sakit: Number(row.sakit || 0),
    alpa: Number(row.alpa || 0),
  };
}

function groupSubjects(rows) {
  const subjects = new Map();
  for (const row of rows) {
    if (!subjects.has(row.id)) {
      subjects.set(row.id, {
        id: row.id,
        name: row.name,
        grade_level: row.grade_level,
        kkm: Number(row.kkm),
        teacher_id: row.teacher_id,
        teacher_name: row.teacher_name,
        components: [],
      });
    }
    subjects.get(row.id).components.push({
      id: row.component_id,
      code: row.component_code,
      weight_percent: Number(row.weight_percent),
      sort_order: Number(row.sort_order),
      topic: row.topic || null,
      score: numberOrNull(row.score),
    });
  }

  return [...subjects.values()].map((subject) => {
    const complete = subject.components.length === 8
      && subject.components.every((component) => component.score != null);
    const finalScore = complete
      ? subject.components.reduce(
        (sum, component) => sum + (component.score * component.weight_percent),
        0,
      ) / 100
      : null;
    return {
      ...subject,
      recorded_components: subject.components.filter((component) => component.score != null).length,
      missing_count: subject.components.filter((component) => component.score == null).length,
      final_score: finalScore == null ? null : Number(finalScore.toFixed(2)),
    };
  });
}

async function findReport({ reportId, studentId, queryable = pool, forUpdate = false }) {
  const condition = reportId ? 'rc.id = $1' : 'rc.student_id = $1';
  const value = reportId || studentId;
  const { rows } = await queryable.query(
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
      ORDER BY rc.created_at DESC LIMIT 1${forUpdate ? ' FOR UPDATE OF rc' : ''}`,
    [value],
  );
  if (!rows.length) throw AppError.notFound('Rapor belum tersedia');
  return rows[0];
}

async function buildLiveReportData({ reportId, studentId, queryable = pool }) {
  const report = await findReport({ reportId, studentId, queryable });
  const [subjectsResult, attendanceResult] = await Promise.all([
    queryable.query(
      `SELECT sub.id, sub.name, sub.grade_level, sub.kkm,
              t.id AS teacher_id, t.name AS teacher_name,
              ac.id AS component_id, ac.code AS component_code,
              ac.weight_percent, ac.sort_order, at.topic, g.score
         FROM class_subjects csub
         JOIN subjects sub ON sub.id = csub.subject_id
         JOIN teachers t ON t.id = sub.teacher_id
         CROSS JOIN assessment_components ac
         LEFT JOIN assessment_topics at
           ON at.class_id = csub.class_id AND at.subject_id = sub.id
          AND at.component_id = ac.id
         LEFT JOIN grades g
           ON g.class_id = csub.class_id AND g.subject_id = sub.id
          AND g.student_id = $2 AND g.component_id = ac.id
        WHERE csub.class_id = $1
        ORDER BY sub.name, ac.sort_order`,
      [report.class_id, report.student_id],
    ),
    queryable.query(
      `SELECT COUNT(ar.id)::int AS total,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Hadir')::int AS hadir,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Izin')::int AS izin,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Sakit')::int AS sakit,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Alpa')::int AS alpa
         FROM attendance_sessions ats
         LEFT JOIN attendance_records ar
           ON ar.session_id = ats.id AND ar.student_id = $2
        WHERE ats.class_id = $1`,
      [report.class_id, report.student_id],
    ),
  ]);
  const subjects = groupSubjects(subjectsResult.rows);
  const scored = subjects.filter((subject) => subject.final_score != null);
  const averageScore = scored.length
    ? Number((scored.reduce((sum, subject) => sum + subject.final_score, 0) / scored.length).toFixed(2))
    : null;
  const attendance = normalizeAttendance(attendanceResult.rows[0]);

  return {
    ...report,
    subjects,
    average_score: averageScore,
    attendance,
    attendance_percentage: attendance.total
      ? Math.round((attendance.hadir / attendance.total) * 100)
      : 0,
  };
}

function snapshotFromLiveData(data, capturedAt = new Date().toISOString()) {
  return {
    snapshot_version: 1,
    captured_at: capturedAt,
    class_id: data.class_id,
    class_name: data.class_name,
    student_id: data.student_id,
    student_name: data.student_name,
    nis: data.nis,
    semester_id: data.semester_id,
    semester: data.semester,
    academic_year: data.academic_year,
    homeroom_teacher_name: data.homeroom_teacher_name || null,
    general_note: data.general_note || null,
    subjects: data.subjects,
    average_score: data.average_score,
    attendance: data.attendance,
    attendance_percentage: data.attendance_percentage,
  };
}

async function createReportSnapshot({ reportId, queryable = pool }) {
  const data = await buildLiveReportData({ reportId, queryable });
  if (!data.subjects.length || data.subjects.some((subject) => subject.final_score == null)) {
    throw AppError.unprocessable('Snapshot rapor tidak dapat dibuat karena nilai belum lengkap');
  }
  return snapshotFromLiveData(data);
}

function applySnapshot(report) {
  const snapshot = report.snapshot_data;
  if (!snapshot || report.status === 'Draft') return report;
  return {
    ...report,
    ...snapshot,
    id: report.id,
    status: report.status,
    finalized_by: report.finalized_by,
    finalized_at: report.finalized_at,
    distributed_by: report.distributed_by,
    distributed_at: report.distributed_at,
    created_at: report.created_at,
    snapshot_data: undefined,
  };
}

async function getReportData({ reportId, studentId, queryable = pool }) {
  const report = await findReport({ reportId, studentId, queryable });
  if (report.snapshot_data && report.status !== 'Draft') return applySnapshot(report);
  return buildLiveReportData({ reportId, studentId, queryable });
}

module.exports = {
  applySnapshot,
  buildLiveReportData,
  createReportSnapshot,
  findReport,
  getReportData,
  groupSubjects,
  snapshotFromLiveData,
};
