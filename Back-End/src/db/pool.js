const { Pool, types } = require('pg');
const env = require('../config/env');

// PostgreSQL DATE adalah tanggal kalender tanpa zona waktu. Parser bawaan `pg`
// dapat mengubahnya menjadi Date lokal, lalu JSON.stringify menggesernya ke UTC
// (contoh WIB: 2026-08-11 menjadi 2026-08-10T17:00:00.000Z). Pertahankan DATE
// sebagai YYYY-MM-DD supaya nilainya konsisten dari database sampai browser.
types.setTypeParser(1082, (value) => value);

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: env.databasePoolMax,
});

// Helper: jalankan beberapa query dalam satu transaksi.
async function withTransaction(fn) {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const result = await fn(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

module.exports = { pool, withTransaction };
