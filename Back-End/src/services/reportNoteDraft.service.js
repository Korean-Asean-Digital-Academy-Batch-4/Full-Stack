const { pool } = require('../db/pool');
const geminiService = require('./gemini.service');

async function collectDraftContext({ classId, studentId, studentName }) {
  const [subjectsResult, attendanceResult] = await Promise.all([
    pool.query(
      `SELECT sub.name, sub.kkm,
              ROUND(SUM(g.score * ac.weight_percent) / 100.0, 2) AS final_score,
              COUNT(g.id)::int AS recorded_components,
              COUNT(*) FILTER (WHERE g.score IS NULL)::int AS missing_components
         FROM class_subjects csub
         JOIN subjects sub ON sub.id = csub.subject_id
         CROSS JOIN assessment_components ac
         LEFT JOIN grades g
           ON g.class_id = csub.class_id
          AND g.subject_id = csub.subject_id
          AND g.student_id = $2
          AND g.component_id = ac.id
        WHERE csub.class_id = $1
        GROUP BY sub.id, sub.name, sub.kkm
        ORDER BY sub.name`,
      [classId, studentId]
    ),
    pool.query(
      `SELECT COUNT(ar.id)::int AS total,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Hadir')::int AS hadir,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Izin')::int AS izin,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Sakit')::int AS sakit,
              COUNT(ar.id) FILTER (WHERE ar.status = 'Alpa')::int AS alpa
         FROM attendance_sessions ats
         LEFT JOIN attendance_records ar
           ON ar.session_id = ats.id AND ar.student_id = $2
        WHERE ats.class_id = $1`,
      [classId, studentId]
    ),
  ]);

  const subjects = subjectsResult.rows.map((subject) => ({
    name: subject.name,
    kkm: Number(subject.kkm),
    finalScore: subject.final_score === null ? null : Number(subject.final_score),
    complete: Number(subject.missing_components) === 0 && Number(subject.recorded_components) > 0,
  }));
  const completeScores = subjects.filter((subject) => subject.complete && subject.finalScore !== null);
  const averageScore = completeScores.length
    ? Number((completeScores.reduce((total, subject) => total + subject.finalScore, 0) / completeScores.length).toFixed(2))
    : null;
  const attendance = attendanceResult.rows[0] || { total: 0, hadir: 0, izin: 0, sakit: 0, alpa: 0 };
  const total = Number(attendance.total);

  return {
    studentName,
    averageScore,
    subjects,
    attendance: {
      total,
      hadir: Number(attendance.hadir),
      izin: Number(attendance.izin),
      sakit: Number(attendance.sakit),
      alpa: Number(attendance.alpa),
      percentage: total ? Math.round((Number(attendance.hadir) / total) * 100) : 0,
    },
  };
}

function buildPrompt(context) {
  return `Anda adalah wali kelas SMA di Indonesia yang menyusun catatan rapor.
Gunakan HANYA data akademik berikut:
${JSON.stringify(context, null, 2)}

Tulis satu paragraf catatan rapor dalam bahasa Indonesia yang hangat, profesional, objektif, dan memotivasi.
- Panjang 350-700 karakter dan maksimal 2.000 karakter.
- Dasarkan penilaian pada rata-rata, nilai setiap mata pelajaran dibandingkan KKM, serta kehadiran.
- Sebutkan kekuatan utama dan satu area yang perlu ditingkatkan secara halus.
- Jika nilai atau presensi belum lengkap, nyatakan secara netral dan jangan mengarang data.
- Jangan membuat diagnosis, prediksi kelulusan, atau informasi di luar data.
- Jangan gunakan judul, bullet, markdown, tanda kutip, atau awalan seperti "Catatan:".
Kembalikan hanya paragraf catatan rapor.`;
}

async function generateReportNoteDraft(input) {
  const context = await collectDraftContext(input);
  const note = await geminiService.generateText(buildPrompt(context), {
    temperature: 0.35,
    maxOutputTokens: 1000,
  });
  return { note: note.slice(0, 2000), basedOn: context };
}

module.exports = { collectDraftContext, buildPrompt, generateReportNoteDraft };
