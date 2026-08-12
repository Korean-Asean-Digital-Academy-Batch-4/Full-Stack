const { pool } = require('../../db/pool');
const { ok } = require('../../utils/response');
const AppError = require('../../utils/AppError');
const gradesService = require('../../services/grades.service');
const attendanceService = require('../../services/attendance.service');

// Admin dapat mengisi/mengubah nilai kelas & mapel manapun (§8.1), termasuk yang sudah Final.
async function putGrades(req, res) {
  const { classId, subjectId, entries } = req.body;
  if (!classId || !subjectId) throw AppError.badRequest('classId dan subjectId wajib diisi');
  const result = await gradesService.saveGrades({
    classId, subjectId, entries, filledByTeacherId: null,
  });
  return ok(res, result, 'Nilai berhasil disimpan');
}

async function putAttendanceRecords(req, res) {
  const { id: sessionId } = req.params;
  const { records } = req.body;
  const result = await attendanceService.updateRecords(sessionId, records);
  return ok(res, result, 'Presensi berhasil disimpan');
}

async function deleteGrades(req, res) {
  const { classId, subjectId } = req.query;
  if (!classId || !subjectId) throw AppError.badRequest('classId dan subjectId wajib diisi');
  const { rowCount } = await pool.query(
    'DELETE FROM grades WHERE class_id = $1 AND subject_id = $2',
    [classId, subjectId]
  );
  return ok(res, { deletedCount: rowCount }, `${rowCount} nilai berhasil dihapus`);
}

async function deleteAttendanceSession(req, res) {
  const { id } = req.params;
  const { rowCount } = await pool.query('DELETE FROM attendance_sessions WHERE id = $1', [id]);
  if (!rowCount) throw AppError.notFound('Sesi presensi tidak ditemukan');
  return ok(res, null, 'Sesi presensi dan seluruh catatannya berhasil dihapus');
}

module.exports = { putGrades, putAttendanceRecords, deleteGrades, deleteAttendanceSession };
