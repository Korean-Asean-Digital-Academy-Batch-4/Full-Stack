const { pool, withTransaction } = require('../db/pool');
const AppError = require('../utils/AppError');

// Guru hanya mengampu tepat 1 mata pelajaran → cari subject miliknya yang terhubung ke classId.
async function resolveTeacherSubjectForClass(teacherId, classId) {
  const { rows } = await pool.query(
    `SELECT s.id FROM subjects s
     JOIN class_subjects csub ON csub.subject_id = s.id
     WHERE s.teacher_id = $1 AND csub.class_id = $2`,
    [teacherId, classId]
  );
  if (!rows.length) {
    throw AppError.forbidden('Anda tidak mengajar mata pelajaran pada kelas ini');
  }
  return rows[0].id;
}

// entries: [{ studentId, componentCode, score }]
async function saveGrades({ classId, subjectId, entries, filledByTeacherId }) {
  if (!Array.isArray(entries) || !entries.length) {
    throw AppError.badRequest('entries wajib berupa array dan tidak boleh kosong');
  }
  return withTransaction(async (client) => {
    const assignment = await client.query(
      'SELECT 1 FROM class_subjects WHERE class_id = $1 AND subject_id = $2',
      [classId, subjectId],
    );
    if (!assignment.rowCount) {
      throw AppError.badRequest('Mata pelajaran tidak terhubung ke kelas tersebut');
    }

    const componentsRes = await client.query('SELECT id, code FROM assessment_components');
    const componentByCode = Object.fromEntries(componentsRes.rows.map((component) => [component.code, component.id]));
    const studentIds = [...new Set(entries.map((entry) => entry?.studentId).filter(Boolean))];
    const enrolled = await client.query(
      'SELECT student_id FROM class_students WHERE class_id = $1 AND student_id = ANY($2::uuid[])',
      [classId, studentIds],
    );
    const enrolledIds = new Set(enrolled.rows.map((row) => row.student_id));
    const entryKeys = new Set();

    for (const entry of entries) {
      const { studentId, componentCode, score } = entry || {};
      if (!studentId || !componentByCode[componentCode]) {
        throw AppError.badRequest('Entri nilai memiliki studentId atau componentCode yang tidak valid');
      }
      if (!enrolledIds.has(studentId)) {
        throw AppError.badRequest(`Siswa ${studentId} tidak terdaftar pada kelas ini`);
      }
      const key = `${studentId}:${componentCode}`;
      if (entryKeys.has(key)) throw AppError.badRequest(`Entri nilai duplikat untuk ${componentCode}`);
      entryKeys.add(key);
      if (score !== null && score !== undefined && (!Number.isFinite(Number(score)) || Number(score) < 0 || Number(score) > 100)) {
        throw AppError.badRequest(`Skor harus 0-100 atau null (siswa ${studentId}, ${componentCode})`);
      }
    }

    for (const { studentId, componentCode, score } of entries) {
      await client.query(
        `INSERT INTO grades (student_id, class_id, subject_id, component_id, score, filled_by_teacher_id)
         VALUES ($1, $2, $3, $4, $5, $6)
         ON CONFLICT (student_id, subject_id, component_id)
         DO UPDATE SET class_id = EXCLUDED.class_id, score = EXCLUDED.score,
                       filled_by_teacher_id = EXCLUDED.filled_by_teacher_id, updated_at = now()`,
        [studentId, classId, subjectId, componentByCode[componentCode], score ?? null, filledByTeacherId],
      );
    }
    return { savedCount: entries.length };
  });
}

// Selalu mengembalikan grid lengkap siswa × 8 komponen, walau belum pernah disimpan (score: null).
async function getClassGrades(classId, subjectId) {
  const { rows } = await pool.query(
    `SELECT cs.student_id, s.name AS student_name, s.nis, ac.code AS component_code, g.score
     FROM class_students cs
     JOIN students s ON s.id = cs.student_id
     CROSS JOIN assessment_components ac
     LEFT JOIN grades g
       ON g.student_id = cs.student_id AND g.subject_id = $2
      AND g.class_id = $1 AND g.component_id = ac.id
     WHERE cs.class_id = $1
     ORDER BY s.name, ac.sort_order`,
    [classId, subjectId]
  );
  return rows;
}

module.exports = { resolveTeacherSubjectForClass, saveGrades, getClassGrades };
