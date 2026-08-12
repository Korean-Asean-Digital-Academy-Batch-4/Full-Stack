const COMPONENT_NAMES = {
  T1: "Tugas 1",
  T2: "Tugas 2",
  T3: "Tugas 3",
  U1: "Ulangan Harian 1",
  U2: "Ulangan Harian 2",
  U3: "Ulangan Harian 3",
  UTS: "Ujian Tengah Semester",
  UAS: "Ujian Akhir Semester",
};

export function groupStudentGradeRows(rows) {
  const subjects = new Map();
  rows.forEach((row) => {
    if (!subjects.has(row.subject_id)) {
      subjects.set(row.subject_id, {
        id: row.subject_id,
        subject: `${row.subject_name} ${row.grade_level}`,
        name: `${row.subject_name} ${row.grade_level}`,
        kkm: Number(row.kkm),
        badgeTone: "blue",
        components: [],
      });
    }
    subjects.get(row.subject_id).components.push({
      id: row.component_code,
      name: COMPONENT_NAMES[row.component_code] || row.component_code,
      topic: row.topic || null,
      score: row.score == null ? null : Number(row.score),
      weight: Number(row.weight_percent),
    });
  });

  return [...subjects.values()].map((subject) => {
    const complete = subject.components.length > 0
      && subject.components.every((component) => component.score != null);
    const average = complete
      ? subject.components.reduce((sum, component) => sum + component.score * component.weight, 0) / 100
      : null;
    return {
      ...subject,
      complete,
      average,
      score: average == null ? null : Number(average.toFixed(2)),
    };
  });
}
