require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Pool } = require('pg');

async function main() {
  if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL wajib diisi');
  const pool = new Pool({ connectionString: process.env.DATABASE_URL, max: 1 });
  const sql = fs.readFileSync(path.join(__dirname, 'add-report-snapshot.sql'), 'utf8');
  let client;

  try {
    client = await pool.connect();
    await client.query('BEGIN');
    await client.query(sql);
    const verification = await client.query(`
      SELECT c.udt_name,
             EXISTS (
               SELECT 1 FROM pg_constraint
                WHERE conname = 'report_cards_snapshot_data_check'
                  AND conrelid = 'public.report_cards'::regclass
             ) AS constraint_exists
        FROM information_schema.columns c
       WHERE c.table_schema = 'public'
         AND c.table_name = 'report_cards'
         AND c.column_name = 'snapshot_data'
    `);
    const result = verification.rows[0];
    if (!result || result.udt_name !== 'jsonb' || !result.constraint_exists) {
      throw new Error(`Verifikasi gagal: type=${result?.udt_name}, constraint=${result?.constraint_exists}`);
    }
    await client.query('COMMIT');
    console.log('Migrasi snapshot rapor selesai: kolom JSONB dan constraint tersedia.');
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (client) client.release();
    await pool.end();
  }
}

main().catch((error) => {
  console.error(`Migrasi snapshot rapor gagal: ${error.message}`);
  process.exitCode = 1;
});
