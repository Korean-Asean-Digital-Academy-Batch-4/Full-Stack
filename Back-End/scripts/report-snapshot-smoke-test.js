require('dotenv').config();

const { pool } = require('../src/db/pool');
const reportSnapshotService = require('../src/services/reportSnapshot.service');

function stableReportView(report) {
  return {
    student_name: report.student_name,
    nis: report.nis,
    class_name: report.class_name,
    semester: report.semester,
    academic_year: report.academic_year,
    subjects: report.subjects,
    average_score: report.average_score,
    attendance: report.attendance,
    attendance_percentage: report.attendance_percentage,
  };
}

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi');
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const candidateResult = await client.query(`
      SELECT cs.class_id, cs.student_id, c.semester_id
        FROM class_students cs
        JOIN classes c ON c.id = cs.class_id
       WHERE EXISTS (SELECT 1 FROM class_subjects x WHERE x.class_id = cs.class_id)
         AND NOT EXISTS (
           SELECT 1
             FROM class_subjects csub
             CROSS JOIN assessment_components ac
             LEFT JOIN grades g
               ON g.class_id = csub.class_id
              AND g.subject_id = csub.subject_id
              AND g.student_id = cs.student_id
              AND g.component_id = ac.id
            WHERE csub.class_id = cs.class_id
              AND (g.id IS NULL OR g.score IS NULL)
         )
       ORDER BY cs.class_id, cs.student_id
       LIMIT 1
    `);
    if (!candidateResult.rows.length) {
      throw new Error('Tidak ada siswa dengan nilai lengkap untuk menguji snapshot rapor');
    }
    const candidate = candidateResult.rows[0];
    const reportResult = await client.query(
      `INSERT INTO report_cards
         (class_id, student_id, semester_id, status, general_note, snapshot_data,
          finalized_by, finalized_at, distributed_by, distributed_at)
       VALUES ($1, $2, $3, 'Draft', 'Uji snapshot', NULL, NULL, NULL, NULL, NULL)
       ON CONFLICT (student_id, semester_id) DO UPDATE
         SET class_id = EXCLUDED.class_id,
             status = 'Draft', general_note = EXCLUDED.general_note,
             snapshot_data = NULL, finalized_by = NULL, finalized_at = NULL,
             distributed_by = NULL, distributed_at = NULL
       RETURNING id`,
      [candidate.class_id, candidate.student_id, candidate.semester_id]
    );
    const reportId = reportResult.rows[0].id;
    const snapshot = await reportSnapshotService.createReportSnapshot({ reportId, queryable: client });
    await client.query(
      `UPDATE report_cards
          SET status = 'Finalized', snapshot_data = $2::jsonb, finalized_at = now()
        WHERE id = $1`,
      [reportId, JSON.stringify(snapshot)]
    );

    const before = stableReportView(
      await reportSnapshotService.getReportData({ reportId, queryable: client })
    );
    await client.query(
      `UPDATE grades
          SET score = CASE WHEN score >= 99 THEN 1 ELSE score + 1 END
        WHERE id = (
          SELECT id FROM grades
           WHERE class_id = $1 AND student_id = $2
           ORDER BY id LIMIT 1
        )`,
      [candidate.class_id, candidate.student_id]
    );
    await client.query(
      `DELETE FROM attendance_records
        WHERE id = (
          SELECT ar.id
            FROM attendance_records ar
            JOIN attendance_sessions ats ON ats.id = ar.session_id
           WHERE ats.class_id = $1 AND ar.student_id = $2
           ORDER BY ar.id LIMIT 1
        )`,
      [candidate.class_id, candidate.student_id]
    );
    const after = stableReportView(
      await reportSnapshotService.getReportData({ reportId, queryable: client })
    );
    if (JSON.stringify(before) !== JSON.stringify(after)) {
      throw new Error('Snapshot berubah setelah data nilai/presensi sumber dimodifikasi');
    }
    if (snapshot.snapshot_version !== 1 || !snapshot.subjects.length) {
      throw new Error('Isi snapshot tidak valid');
    }
    console.log('Smoke test snapshot rapor lulus: nilai dan presensi final tetap immutable.');
  } finally {
    await client.query('ROLLBACK').catch(() => {});
    client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Smoke test snapshot rapor gagal: ${error.message}`);
  process.exitCode = 1;
});
