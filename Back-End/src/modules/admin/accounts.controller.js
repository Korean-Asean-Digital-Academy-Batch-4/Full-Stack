const { parse } = require('csv-parse/sync');
const { pool, withTransaction } = require('../../db/pool');
const { ok, created } = require('../../utils/response');
const AppError = require('../../utils/AppError');
const { generateInitialPassword, hashPassword } = require('../../utils/password');

// ---- Guru -------------------------------------------------------------

async function createTeacher(req, res) {
  const { name } = req.body;
  const nip = normalizeNumericIdentifier(req.body.nip, 'NIP');
  if (!name) throw AppError.badRequest('nip dan name wajib diisi');
  await ensureTeacherIdentifierAvailable(nip);
  const plainPassword = generateInitialPassword();
  const { rows } = await pool.query(
    'INSERT INTO teachers (nip, name, password_hash) VALUES ($1, $2, $3) RETURNING id, nip, name, created_at',
    [nip, name, hashPassword(plainPassword)]
  );
  return created(res, { ...rows[0], initialPassword: plainPassword }, 'Akun Guru berhasil dibuat');
}

async function importTeachers(req, res) {
  const rows = parseCsv(req, ['Nama', 'NIP']);
  const result = await bulkInsert(rows, async (row) => {
    const name = (row['Nama'] || '').trim();
    const nip = normalizeNumericIdentifier(row['NIP'], 'NIP', Error);
    if (!name) throw new Error('Nama kosong');
    await ensureTeacherIdentifierAvailable(nip);
    const plainPassword = generateInitialPassword();
    const { rows: insertedRows } = await pool.query(
      'INSERT INTO teachers (nip, name, password_hash) VALUES ($1, $2, $3) RETURNING id, nip, name, created_at',
      [nip, name, hashPassword(plainPassword)]
    );
    return { ...insertedRows[0], initialPassword: plainPassword };
  });
  return ok(res, result, `${result.createdCount} dari ${rows.length} akun berhasil dibuat`);
}

async function listTeachers(req, res) {
  const { query } = req.query;
  const params = [];
  let where = '';
  if (query) {
    params.push(`%${query}%`);
    where = 'WHERE t.name ILIKE $1 OR t.nip ILIKE $1';
  }
  const { rows } = await pool.query(
    `SELECT t.id, t.nip, t.name, t.created_at,
            COALESCE(string_agg(DISTINCT s.name, ', ') FILTER (WHERE s.id IS NOT NULL), '') AS subject_assignment,
            COALESCE(string_agg(DISTINCT c.name, ', ') FILTER (WHERE c.id IS NOT NULL), '') AS homeroom_classes
       FROM teachers t
       LEFT JOIN subjects s ON s.teacher_id = t.id
       LEFT JOIN classes c ON c.homeroom_teacher_id = t.id
       ${where}
      GROUP BY t.id, t.nip, t.name, t.created_at
      ORDER BY t.name`,
    params
  );
  return ok(res, { items: rows, meta: { total: rows.length } });
}

async function resetTeacherPassword(req, res) {
  const { id } = req.params;
  const plainPassword = generateInitialPassword();
  const { rowCount } = await pool.query(
    'UPDATE teachers SET password_hash = $1 WHERE id = $2',
    [hashPassword(plainPassword), id]
  );
  if (!rowCount) throw AppError.notFound('Guru tidak ditemukan');
  return ok(res, { newPassword: plainPassword }, 'Kata sandi berhasil direset');
}

async function deleteTeacher(req, res) {
  const { id } = req.params;
  await withTransaction(async (client) => {
    const teacher = await client.query('SELECT id FROM teachers WHERE id = $1', [id]);
    if (!teacher.rowCount) throw AppError.notFound('Guru tidak ditemukan');
    const subjects = await client.query('SELECT id FROM subjects WHERE teacher_id = $1', [id]);
    const subjectIds = subjects.rows.map((row) => row.id);

    await client.query('UPDATE classes SET homeroom_teacher_id = NULL WHERE homeroom_teacher_id = $1', [id]);
    await client.query('UPDATE grades SET filled_by_teacher_id = NULL WHERE filled_by_teacher_id = $1', [id]);
    await client.query('UPDATE report_cards SET finalized_by = NULL WHERE finalized_by = $1', [id]);
    await client.query('UPDATE report_cards SET distributed_by = NULL WHERE distributed_by = $1', [id]);
    await client.query('DELETE FROM assessment_topics WHERE updated_by_teacher_id = $1', [id]);
    await client.query('DELETE FROM attendance_sessions WHERE teacher_id = $1', [id]);
    if (subjectIds.length) {
      await client.query('DELETE FROM attendance_sessions WHERE subject_id = ANY($1::uuid[])', [subjectIds]);
      await client.query('DELETE FROM grades WHERE subject_id = ANY($1::uuid[])', [subjectIds]);
      await client.query('DELETE FROM class_subjects WHERE subject_id = ANY($1::uuid[])', [subjectIds]);
      await client.query('DELETE FROM subjects WHERE id = ANY($1::uuid[])', [subjectIds]);
    }
    await client.query('DELETE FROM teachers WHERE id = $1', [id]);
  });
  return ok(res, null, 'Akun Guru dan seluruh penugasan terkait berhasil dihapus');
}

// ---- Siswa --------------------------------------------------------------

async function createStudent(req, res) {
  const { name } = req.body;
  const nis = normalizeNumericIdentifier(req.body.nis, 'NIS');
  if (!name) throw AppError.badRequest('nis dan name wajib diisi');
  await ensureStudentIdentifierAvailable(nis);
  const plainPassword = generateInitialPassword();
  const { rows } = await pool.query(
    'INSERT INTO students (nis, name, password_hash) VALUES ($1, $2, $3) RETURNING id, nis, name, created_at',
    [nis, name, hashPassword(plainPassword)]
  );
  return created(res, { ...rows[0], initialPassword: plainPassword }, 'Akun Siswa berhasil dibuat');
}

async function importStudents(req, res) {
  const rows = parseCsv(req, ['Nama', 'NIS']);
  const result = await bulkInsert(rows, async (row) => {
    const name = (row['Nama'] || '').trim();
    const nis = normalizeNumericIdentifier(row['NIS'], 'NIS', Error);
    if (!name) throw new Error('Nama kosong');
    await ensureStudentIdentifierAvailable(nis);
    const plainPassword = generateInitialPassword();
    const { rows: insertedRows } = await pool.query(
      'INSERT INTO students (nis, name, password_hash) VALUES ($1, $2, $3) RETURNING id, nis, name, created_at',
      [nis, name, hashPassword(plainPassword)]
    );
    return { ...insertedRows[0], initialPassword: plainPassword };
  });
  return ok(res, result, `${result.createdCount} dari ${rows.length} akun berhasil dibuat`);
}

async function listStudents(req, res) {
  const { query } = req.query;
  const params = [];
  let where = '';
  if (query) {
    params.push(`%${query}%`);
    where = 'WHERE st.name ILIKE $1 OR st.nis ILIKE $1';
  }
  const { rows } = await pool.query(
    `SELECT st.id, st.nis, st.name, st.created_at,
            COALESCE(string_agg(DISTINCT c.name, ', ') FILTER (WHERE c.id IS NOT NULL), '') AS class_names,
            COALESCE(string_agg(DISTINCT ay.name || ' ' || sem.name, ', ') FILTER (WHERE c.id IS NOT NULL), '') AS academic_periods
       FROM students st
       LEFT JOIN class_students cs ON cs.student_id = st.id
       LEFT JOIN classes c ON c.id = cs.class_id
       LEFT JOIN semesters sem ON sem.id = c.semester_id
       LEFT JOIN academic_years ay ON ay.id = sem.academic_year_id
       ${where}
      GROUP BY st.id, st.nis, st.name, st.created_at
      ORDER BY st.name`,
    params
  );
  return ok(res, { items: rows, meta: { total: rows.length } });
}

async function resetStudentPassword(req, res) {
  const { id } = req.params;
  const plainPassword = generateInitialPassword();
  const { rowCount } = await pool.query(
    'UPDATE students SET password_hash = $1 WHERE id = $2',
    [hashPassword(plainPassword), id]
  );
  if (!rowCount) throw AppError.notFound('Siswa tidak ditemukan');
  return ok(res, { newPassword: plainPassword }, 'Kata sandi berhasil direset');
}

async function deleteStudent(req, res) {
  const { id } = req.params;
  await withTransaction(async (client) => {
    const student = await client.query('SELECT id FROM students WHERE id = $1', [id]);
    if (!student.rowCount) throw AppError.notFound('Siswa tidak ditemukan');
    await client.query('DELETE FROM attendance_records WHERE student_id = $1', [id]);
    await client.query('DELETE FROM grades WHERE student_id = $1', [id]);
    await client.query('DELETE FROM report_cards WHERE student_id = $1', [id]);
    await client.query('DELETE FROM class_students WHERE student_id = $1', [id]);
    await client.query('DELETE FROM students WHERE id = $1', [id]);
  });
  return ok(res, null, 'Akun Siswa dan seluruh data akademik terkait berhasil dihapus');
}

// ---- Helper ---------------------------------------------------------------

function parseCsv(req, expectedColumns) {
  if (!req.file) throw AppError.badRequest('Berkas CSV wajib diunggah (field "file")');
  let records;
  try {
    records = parse(req.file.buffer, {
      bom: true,
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
  } catch (err) {
    throw AppError.badRequest('Berkas CSV tidak dapat dibaca: ' + err.message);
  }
  const missingCols = expectedColumns.filter((c) => !(c in (records[0] || {})));
  if (records.length && missingCols.length) {
    throw AppError.badRequest(`Kolom berikut tidak ditemukan pada berkas: ${missingCols.join(', ')}`);
  }
  return records;
}

async function bulkInsert(rows, insertOneRow) {
  let createdCount = 0;
  const createdItems = [];
  const failedRows = [];
  for (let i = 0; i < rows.length; i++) {
    try {
      const createdItem = await insertOneRow(rows[i], i);
      if (createdItem) createdItems.push(createdItem);
      createdCount++;
    } catch (err) {
      const reason = err.code === '23505' ? 'sudah terdaftar' : err.message;
      failedRows.push({ row: i + 2, reason, values: rows[i] }); // +2: header + 1-based index
    }
  }
  return { createdCount, createdItems, failedRows };
}

function normalizeNumericIdentifier(value, label, ErrorType = null) {
  const normalized = String(value ?? '').trim();
  const message = normalized ? `${label} hanya boleh berisi angka` : `${label} kosong`;
  if (!normalized || !/^\d+$/.test(normalized)) {
    if (ErrorType) throw new ErrorType(message);
    throw AppError.badRequest(message);
  }
  return normalized;
}

async function ensureTeacherIdentifierAvailable(nip) {
  const legacy = Number(nip);
  const existing = await pool.query(
    'SELECT 1 FROM teachers WHERE nip = $1 OR nip_legacy_real = $2 LIMIT 1',
    [nip, Number.isFinite(legacy) ? legacy : null]
  );
  if (existing.rowCount) throw AppError.conflict('NIP sudah terdaftar');
}

async function ensureStudentIdentifierAvailable(nis) {
  const existing = await pool.query(
    'SELECT 1 FROM students WHERE nis = $1 OR nis_legacy_bigint = $2 LIMIT 1',
    [nis, nis]
  );
  if (existing.rowCount) throw AppError.conflict('NIS sudah terdaftar');
}

module.exports = {
  createTeacher, importTeachers, listTeachers, resetTeacherPassword, deleteTeacher,
  createStudent, importStudents, listStudents, resetStudentPassword, deleteStudent,
};
