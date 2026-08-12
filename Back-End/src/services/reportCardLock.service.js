const { pool } = require('../db/pool');
const AppError = require('../utils/AppError');

// Nilai dan presensi baru dikunci setelah rapor benar-benar didistribusikan kepada
// siswa. Status Finalized masih merupakan tahap pemeriksaan wali kelas.
async function assertClassNotLocked(classId, actorRole) {
  if (actorRole === 'admin') return; // admin selalu boleh menembus
  const { rows } = await pool.query(
    `SELECT status FROM report_cards WHERE class_id = $1 AND status = 'Distributed' LIMIT 1`,
    [classId]
  );
  if (rows.length) {
    throw AppError.forbidden(
      'Rapor kelas ini sudah didistribusikan. Hanya Administrator yang dapat mengubah data.'
    );
  }
}

module.exports = { assertClassNotLocked };
