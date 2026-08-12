const { pool } = require('../../db/pool');
const { comparePassword, hashPassword } = require('../../utils/password');
const { signToken } = require('../../utils/jwt');
const { ok, fail } = require('../../utils/response');
const AppError = require('../../utils/AppError');

// identifier: email (Administrator) | NIP (Guru) | NIS (Siswa)
async function login(req, res) {
  const { identifier, password } = req.body;
  if (!identifier || !password) {
    throw AppError.badRequest('identifier dan password wajib diisi');
  }

  const normalizedIdentifier = String(identifier).trim();
  const isNumericIdentifier = /^\d+$/.test(normalizedIdentifier);
  const legacyNip = isNumericIdentifier ? Number(normalizedIdentifier) : null;
  const legacyNis = isNumericIdentifier ? normalizedIdentifier : null;

  const admin = await pool.query('SELECT * FROM administrators WHERE email = $1', [normalizedIdentifier]);
  if (admin.rows.length) {
    return respondIfValid(res, admin.rows[0], password, 'admin', buildAdminProfile);
  }

  const teacher = await pool.query(
    'SELECT * FROM teachers WHERE nip = $1 OR nip_legacy_real = $2',
    [normalizedIdentifier, Number.isFinite(legacyNip) ? legacyNip : null]
  );
  if (teacher.rows.length) {
    return respondIfValidTeacher(res, teacher.rows[0], password);
  }

  const student = await pool.query(
    'SELECT * FROM students WHERE nis = $1 OR nis_legacy_bigint = $2',
    [normalizedIdentifier, legacyNis]
  );
  if (student.rows.length) {
    return respondIfValidStudent(res, student.rows[0], password);
  }

  return fail(res, 401, 'NIP/NIS/email atau kata sandi salah');
}

async function respondIfValid(res, user, password, role, buildProfile) {
  if (!comparePassword(password, user.password_hash)) {
    return fail(res, 401, 'NIP/NIS/email atau kata sandi salah');
  }
  const token = signToken({ sub: user.id, role, isHomeroomOf: [] });
  const academicPeriod = await getActiveAcademicPeriod();
  return ok(res, {
    token,
    role,
    profile: { ...buildProfile(user), academicPeriod },
  }, 'Berhasil masuk');
}

async function respondIfValidTeacher(res, teacher, password) {
  if (!comparePassword(password, teacher.password_hash)) {
    return fail(res, 401, 'NIP/NIS/email atau kata sandi salah');
  }
  const homeroomClasses = await pool.query(
    'SELECT id, name FROM classes WHERE homeroom_teacher_id = $1 ORDER BY created_at DESC',
    [teacher.id]
  );
  const isHomeroomOf = homeroomClasses.rows.map((r) => r.id);
  const assignments = await pool.query(
    `SELECT c.id AS class_id, c.name AS class_name, c.grade_level,
            sub.id AS subject_id, sub.name AS subject_name,
            ay.name AS academic_year, sem.name AS semester
       FROM classes c
       JOIN class_subjects csub ON csub.class_id = c.id
       JOIN subjects sub ON sub.id = csub.subject_id
       JOIN semesters sem ON sem.id = c.semester_id
       JOIN academic_years ay ON ay.id = sem.academic_year_id
      WHERE sub.teacher_id = $1
      ORDER BY ay.name DESC, sem.name, c.name`,
    [teacher.id]
  );
  const academicPeriod = await getActiveAcademicPeriod();
  const token = signToken({ sub: teacher.id, role: 'teacher', isHomeroomOf });
  return ok(res, {
    token,
    role: 'teacher',
    profile: {
      id: teacher.id,
      name: teacher.name,
      nip: teacher.nip,
      isHomeroom: isHomeroomOf.length > 0,
      homeroomClassId: isHomeroomOf[0] || null,
      homeroomClassName: homeroomClasses.rows[0]?.name || null,
      createdAt: teacher.created_at,
      teachingAssignments: assignments.rows.map((item) => ({
        id: item.class_id,
        classId: item.class_id,
        name: item.class_name,
        subjectId: item.subject_id,
        subjectName: item.subject_name,
        gradeLevel: item.grade_level,
        academicYear: item.academic_year,
        semester: item.semester,
        status: 'active',
      })),
      academicPeriod,
    },
  }, 'Berhasil masuk');
}

async function respondIfValidStudent(res, student, password) {
  if (!comparePassword(password, student.password_hash)) {
    return fail(res, 401, 'NIP/NIS/email atau kata sandi salah');
  }
  const enrollment = await pool.query(
    `SELECT c.id, c.name, c.grade_level, ay.name AS academic_year, sem.name AS semester
       FROM class_students cs
       JOIN classes c ON c.id = cs.class_id
       JOIN semesters sem ON sem.id = c.semester_id
       JOIN academic_years ay ON ay.id = sem.academic_year_id
      WHERE cs.student_id = $1
      ORDER BY c.created_at DESC LIMIT 1`,
    [student.id]
  );
  const academicPeriod = await getActiveAcademicPeriod();
  const currentClass = enrollment.rows[0] || null;
  const token = signToken({ sub: student.id, role: 'student', isHomeroomOf: [] });
  return ok(res, {
    token,
    role: 'student',
    profile: {
      id: student.id,
      name: student.name,
      nis: student.nis,
      createdAt: student.created_at,
      classId: currentClass?.id || null,
      className: currentClass?.name || null,
      gradeLevel: currentClass?.grade_level || null,
      academicPeriod,
    },
  }, 'Berhasil masuk');
}

async function changePassword(req, res) {
  const { currentPassword, newPassword } = req.body;
  if (!currentPassword || !newPassword) {
    throw AppError.badRequest('currentPassword dan newPassword wajib diisi');
  }
  if (String(newPassword).length < 8) {
    throw AppError.badRequest('Kata sandi baru minimal 8 karakter');
  }
  const tableByRole = { admin: 'administrators', teacher: 'teachers', student: 'students' };
  const table = tableByRole[req.user.role];
  if (!table) throw AppError.forbidden('Peran tidak dapat mengubah kata sandi');
  const { rows } = await pool.query(`SELECT password_hash FROM ${table} WHERE id = $1`, [req.user.sub]);
  if (!rows.length || !comparePassword(currentPassword, rows[0].password_hash)) {
    throw AppError.unauthorized('Kata sandi saat ini salah');
  }
  await pool.query(`UPDATE ${table} SET password_hash = $1 WHERE id = $2`, [hashPassword(newPassword), req.user.sub]);
  return ok(res, null, 'Kata sandi berhasil diperbarui');
}

async function getActiveAcademicPeriod() {
  const { rows } = await pool.query(
    `SELECT ay.name AS academic_year, sem.name AS semester
     FROM semesters sem
     JOIN academic_years ay ON ay.id = sem.academic_year_id
     WHERE sem.is_active = true AND ay.is_active = true
     ORDER BY ay.name DESC
     LIMIT 1`,
  );
  return rows.length
    ? { academicYear: rows[0].academic_year, semester: rows[0].semester }
    : null;
}

function buildAdminProfile(u) {
  return { id: u.id, name: u.name, email: u.email };
}

module.exports = { login, changePassword };
