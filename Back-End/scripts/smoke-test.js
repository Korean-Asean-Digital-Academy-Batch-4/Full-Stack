require('dotenv').config();

const app = require('../src/app');
const { pool } = require('../src/db/pool');
const { signToken } = require('../src/utils/jwt');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function main() {
  let server;
  let transactionClient;

  try {
    const admin = await pool.query('SELECT id FROM administrators ORDER BY created_at LIMIT 1');
    assert(admin.rowCount > 0, 'Minimal satu administrator diperlukan untuk smoke test');

    server = await new Promise((resolve, reject) => {
      const instance = app.listen(0, '127.0.0.1', () => resolve(instance));
      instance.once('error', reject);
    });

    const address = server.address();
    const baseUrl = `http://127.0.0.1:${address.port}`;
    const origin = process.env.CORS_ORIGIN || 'http://localhost:5173';

    const healthResponse = await fetch(`${baseUrl}/health`, {
      headers: { Origin: origin },
    });
    const health = await healthResponse.json();
    assert(healthResponse.ok && health.status === 'ok', 'Endpoint /health gagal');
    assert(
      healthResponse.headers.get('access-control-allow-origin') === origin,
      'CORS frontend tidak sesuai',
    );

    const unauthorized = await fetch(`${baseUrl}/api/admin/academic-years`);
    assert(unauthorized.status === 401, 'Endpoint admin harus menolak request tanpa token');

    const invalidLogin = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ identifier: '__invalid_smoke_identifier__', password: 'invalid' }),
    });
    assert(invalidLogin.status === 401, 'Login tidak dikenal harus menghasilkan 401');

    const token = signToken({ sub: admin.rows[0].id, role: 'admin', isHomeroomOf: [] });
    const yearsResponse = await fetch(`${baseUrl}/api/admin/academic-years`, {
      headers: { Authorization: `Bearer ${token}`, Origin: origin },
    });
    const years = await yearsResponse.json();
    assert(yearsResponse.ok && years.success && Array.isArray(years.data), 'API academic-years gagal');

    const adminPaths = [
      '/api/admin/dashboard',
      '/api/admin/teachers',
      '/api/admin/students',
      '/api/admin/classes',
      '/api/admin/subjects',
      '/api/admin/assessment-components',
      '/api/admin/database/attendance',
      '/api/admin/database/reports',
      '/api/admin/system-status',
    ];
    for (const path of adminPaths) {
      const response = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${token}`, Origin: origin } });
      const payload = await response.json();
      assert(response.ok && payload.success, `API admin gagal: ${path}`);
    }

    const teacher = await pool.query(
      `SELECT DISTINCT t.id, c.id AS class_id
         FROM teachers t
         JOIN subjects s ON s.teacher_id = t.id
         JOIN class_subjects cs ON cs.subject_id = s.id
         JOIN classes c ON c.id = cs.class_id
        ORDER BY t.id LIMIT 1`
    );
    if (teacher.rowCount) {
      const teacherToken = signToken({ sub: teacher.rows[0].id, role: 'teacher', isHomeroomOf: [] });
      for (const path of [
        '/api/teacher/classes',
        `/api/teacher/classes/${teacher.rows[0].class_id}/grades`,
        `/api/teacher/classes/${teacher.rows[0].class_id}/assessment-topics`,
        `/api/teacher/classes/${teacher.rows[0].class_id}/attendance-sessions`,
      ]) {
        const response = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${teacherToken}` } });
        const payload = await response.json();
        assert(response.ok && payload.success, `API guru gagal: ${path}`);
      }
    }

    const homeroom = await pool.query('SELECT id, homeroom_teacher_id FROM classes WHERE homeroom_teacher_id IS NOT NULL LIMIT 1');
    if (homeroom.rowCount) {
      const homeroomToken = signToken({ sub: homeroom.rows[0].homeroom_teacher_id, role: 'teacher', isHomeroomOf: [homeroom.rows[0].id] });
      const response = await fetch(`${baseUrl}/api/homeroom/classes/${homeroom.rows[0].id}/overview`, { headers: { Authorization: `Bearer ${homeroomToken}` } });
      const payload = await response.json();
      assert(response.ok && payload.success, 'API wali kelas gagal');
    }

    const student = await pool.query('SELECT id FROM students ORDER BY created_at LIMIT 1');
    if (student.rowCount) {
      const studentToken = signToken({ sub: student.rows[0].id, role: 'student', isHomeroomOf: [] });
      for (const path of ['/api/student/grades', '/api/student/attendance', '/api/student/assessment-topics']) {
        const response = await fetch(`${baseUrl}${path}`, { headers: { Authorization: `Bearer ${studentToken}` } });
        const payload = await response.json();
        assert(response.ok && payload.success, `API siswa gagal: ${path}`);
      }
    }

    transactionClient = await pool.connect();
    await transactionClient.query('BEGIN');
    const suffix = `${Date.now()}${Math.floor(Math.random() * 1000)}`;
    const inserted = await transactionClient.query(
      `INSERT INTO teachers (nip, name, password_hash)
       VALUES ($1, 'Schema Smoke Test', 'not-a-real-password')
       RETURNING id, created_at`,
      [suffix],
    );
    assert(inserted.rows[0].id && inserted.rows[0].created_at, 'Default UUID/timestamp gagal');
    await transactionClient.query('ROLLBACK');
    transactionClient.release();
    transactionClient = null;

    console.log(JSON.stringify({
      health: 'ok',
      cors: 'ok',
      unauthorizedGuard: 'ok',
      invalidLogin: 'ok',
      authenticatedDatabaseRead: 'ok',
      adminOperationalEndpoints: 'ok',
      teacherOperationalEndpoints: teacher.rowCount ? 'ok' : 'skipped-no-assignment',
      homeroomOperationalEndpoints: homeroom.rowCount ? 'ok' : 'skipped-no-homeroom',
      studentOperationalEndpoints: student.rowCount ? 'ok' : 'skipped-no-student',
      schemaDefaultsRollback: 'ok',
      academicYearCount: years.data.length,
    }, null, 2));
  } finally {
    if (transactionClient) {
      await transactionClient.query('ROLLBACK').catch(() => {});
      transactionClient.release();
    }
    if (server) await new Promise((resolve) => server.close(resolve));
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Smoke test gagal: ${error.message}`);
  process.exitCode = 1;
});
