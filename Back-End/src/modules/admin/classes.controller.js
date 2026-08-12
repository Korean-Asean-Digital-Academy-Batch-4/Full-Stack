const XLSX = require('xlsx');
const { pool, withTransaction } = require('../../db/pool');
const { ok, created } = require('../../utils/response');
const AppError = require('../../utils/AppError');

async function createClass(req, res) {
  const { name, gradeLevel, semesterId } = req.body;
  if (!name || !gradeLevel || !semesterId) {
    throw AppError.badRequest('name, gradeLevel, dan semesterId wajib diisi');
  }
  if (!['X', 'XI', 'XII'].includes(gradeLevel)) {
    throw AppError.badRequest('gradeLevel harus salah satu dari X, XI, XII');
  }
  const { rows } = await pool.query(
    'INSERT INTO classes (name, grade_level, semester_id) VALUES ($1, $2, $3) RETURNING *',
    [name, gradeLevel, semesterId]
  );
  return created(res, rows[0], 'Kelas berhasil dibuat');
}

async function listClasses(req, res) {
  const { semesterId, gradeLevel } = req.query;
  const conditions = [];
  const params = [];
  if (semesterId) { params.push(semesterId); conditions.push(`c.semester_id = $${params.length}`); }
  if (gradeLevel) { params.push(gradeLevel); conditions.push(`c.grade_level = $${params.length}`); }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const { rows } = await pool.query(
    `SELECT c.*, t.name AS homeroom_teacher_name,
            (SELECT count(*) FROM class_students cs WHERE cs.class_id = c.id) AS student_count,
            (SELECT count(*) FROM class_subjects cs WHERE cs.class_id = c.id) AS subject_count
     FROM classes c LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
     ${where}
     ORDER BY c.name`,
    params
  );
  return ok(res, rows);
}

async function importClassStudents(req, res) {
  const { id: classId } = req.params;
  if (!req.file) throw AppError.badRequest('Berkas Excel wajib diunggah (field "file")');

  const classRes = await pool.query('SELECT * FROM classes WHERE id = $1', [classId]);
  if (!classRes.rows.length) throw AppError.notFound('Kelas tidak ditemukan');

  let wb;
  try {
    wb = XLSX.read(req.file.buffer, { type: 'buffer' });
  } catch (err) {
    throw AppError.badRequest('Berkas Excel tidak dapat dibaca: ' + err.message);
  }
  const sheet = wb.Sheets[wb.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

  let addedCount = 0;
  const failedRows = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const nis = String(row['NIS'] || '').trim();
    if (!nis) { failedRows.push({ row: i + 2, reason: 'NIS kosong' }); continue; }
    try {
      const legacyNis = /^\d+$/.test(nis) ? nis : null;
      const studentRes = await pool.query(
        'SELECT id FROM students WHERE nis = $1 OR nis_legacy_bigint = $2',
        [nis, legacyNis]
      );
      if (!studentRes.rows.length) {
        failedRows.push({ row: i + 2, reason: `NIS ${nis} belum terdaftar sebagai akun Siswa` });
        continue;
      }
      const inserted = await pool.query(
        'INSERT INTO class_students (class_id, student_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
        [classId, studentRes.rows[0].id]
      );
      if (inserted.rowCount) addedCount++;
    } catch (err) {
      failedRows.push({ row: i + 2, reason: err.message });
    }
  }
  return ok(res, { addedCount, failedRows }, `${addedCount} dari ${rows.length} siswa berhasil ditambahkan ke kelas`);
}

// §8.2: mata pelajaran tidak dipilih ulang per siswa — cukup dihubungkan ke kelas.
// Sistem menolak jika jenjang kelas != jenjang mata pelajaran.
async function addClassSubject(req, res) {
  const { id: classId } = req.params;
  const { subjectId } = req.body;
  if (!subjectId) throw AppError.badRequest('subjectId wajib diisi');

  const classRes = await pool.query('SELECT * FROM classes WHERE id = $1', [classId]);
  if (!classRes.rows.length) throw AppError.notFound('Kelas tidak ditemukan');
  const subjectRes = await pool.query('SELECT * FROM subjects WHERE id = $1', [subjectId]);
  if (!subjectRes.rows.length) throw AppError.notFound('Mata pelajaran tidak ditemukan');

  const kelas = classRes.rows[0];
  const subject = subjectRes.rows[0];
  if (kelas.grade_level !== subject.grade_level) {
    throw AppError.badRequest(
      `Kelas berjenjang ${kelas.grade_level} tidak dapat dihubungkan dengan ${subject.name} ${subject.grade_level} (jenjang tidak cocok)`
    );
  }

  const { rows } = await pool.query(
    'INSERT INTO class_subjects (class_id, subject_id) VALUES ($1, $2) RETURNING *',
    [classId, subjectId]
  );
  return created(res, rows[0], 'Mata pelajaran berhasil dihubungkan ke kelas');
}

async function setHomeroomTeacher(req, res) {
  const { id: classId } = req.params;
  const { teacherId } = req.body;
  if (!teacherId) throw AppError.badRequest('teacherId wajib diisi');

  const teacherRes = await pool.query('SELECT id, name FROM teachers WHERE id = $1', [teacherId]);
  if (!teacherRes.rows.length) throw AppError.notFound('Guru tidak ditemukan');

  const { rows } = await pool.query(
    'UPDATE classes SET homeroom_teacher_id = $1 WHERE id = $2 RETURNING *',
    [teacherId, classId]
  );
  if (!rows.length) throw AppError.notFound('Kelas tidak ditemukan');
  return ok(res, rows[0], `${teacherRes.rows[0].name} ditetapkan sebagai Wali Kelas`);
}

async function clearHomeroomTeacher(req, res) {
  const { id: classId } = req.params;
  const { rows } = await pool.query(
    'UPDATE classes SET homeroom_teacher_id = NULL WHERE id = $1 RETURNING *',
    [classId]
  );
  if (!rows.length) throw AppError.notFound('Kelas tidak ditemukan');
  return ok(res, rows[0], 'Penugasan wali kelas berhasil dihapus');
}

async function removeClassSubject(req, res) {
  const { id: classId, subjectId } = req.params;
  await withTransaction(async (client) => {
    const assignment = await client.query(
      'SELECT id FROM class_subjects WHERE class_id = $1 AND subject_id = $2',
      [classId, subjectId]
    );
    if (!assignment.rowCount) throw AppError.notFound('Penugasan mata pelajaran tidak ditemukan');
    await client.query('DELETE FROM attendance_sessions WHERE class_id = $1 AND subject_id = $2', [classId, subjectId]);
    await client.query('DELETE FROM grades WHERE class_id = $1 AND subject_id = $2', [classId, subjectId]);
    await client.query('DELETE FROM class_subjects WHERE class_id = $1 AND subject_id = $2', [classId, subjectId]);
  });
  return ok(res, null, 'Mata pelajaran berhasil dilepas dari kelas');
}

async function removeClassStudent(req, res) {
  const { id: classId, studentId } = req.params;
  await withTransaction(async (client) => {
    const enrollment = await client.query(
      'SELECT id FROM class_students WHERE class_id = $1 AND student_id = $2',
      [classId, studentId]
    );
    if (!enrollment.rowCount) throw AppError.notFound('Siswa tidak terdaftar pada kelas');
    await client.query(
      `DELETE FROM attendance_records ar USING attendance_sessions ats
       WHERE ar.session_id = ats.id AND ats.class_id = $1 AND ar.student_id = $2`,
      [classId, studentId]
    );
    await client.query('DELETE FROM grades WHERE class_id = $1 AND student_id = $2', [classId, studentId]);
    await client.query('DELETE FROM report_cards WHERE class_id = $1 AND student_id = $2', [classId, studentId]);
    await client.query('DELETE FROM class_students WHERE class_id = $1 AND student_id = $2', [classId, studentId]);
  });
  return ok(res, null, 'Siswa berhasil dikeluarkan dari kelas');
}

async function deleteClass(req, res) {
  const { id: classId } = req.params;
  await withTransaction(async (client) => {
    const kelas = await client.query('SELECT id FROM classes WHERE id = $1', [classId]);
    if (!kelas.rowCount) throw AppError.notFound('Kelas tidak ditemukan');
    await client.query('DELETE FROM grades WHERE class_id = $1', [classId]);
    await client.query('DELETE FROM report_cards WHERE class_id = $1', [classId]);
    await client.query('DELETE FROM classes WHERE id = $1', [classId]);
  });
  return ok(res, null, 'Kelas dan seluruh data akademik terkait berhasil dihapus');
}

async function getClassDetail(req, res) {
  const { id: classId } = req.params;
  const classRes = await pool.query(
    `SELECT c.*, t.name AS homeroom_teacher_name
     FROM classes c LEFT JOIN teachers t ON t.id = c.homeroom_teacher_id
     WHERE c.id = $1`,
    [classId]
  );
  if (!classRes.rows.length) throw AppError.notFound('Kelas tidak ditemukan');

  const studentsRes = await pool.query(
    `SELECT s.id, s.nis, s.name FROM class_students cs
     JOIN students s ON s.id = cs.student_id WHERE cs.class_id = $1 ORDER BY s.name`,
    [classId]
  );
  const subjectsRes = await pool.query(
    `SELECT s.id, s.name, s.grade_level, s.kkm, t.id AS teacher_id, t.name AS teacher_name
     FROM class_subjects csub
     JOIN subjects s ON s.id = csub.subject_id
     JOIN teachers t ON t.id = s.teacher_id
     WHERE csub.class_id = $1 ORDER BY s.name`,
    [classId]
  );

  return ok(res, {
    ...classRes.rows[0],
    students: studentsRes.rows,
    subjects: subjectsRes.rows,
  });
}

module.exports = {
  createClass, listClasses, importClassStudents, addClassSubject, setHomeroomTeacher,
  clearHomeroomTeacher, removeClassSubject, removeClassStudent, deleteClass, getClassDetail,
};
