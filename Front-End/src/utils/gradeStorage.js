export const GRADE_DRAFTS_KEY = "edutrack_grade_drafts";
export const GRADE_RECORDS_KEY = "edutrack_grade_records";
export const LEARNING_TOPICS_KEY = "edutrack_learning_topics";

export function readGradeStorage(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

export function writeGradeStorage(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function createGradeSheetKey({ classId, subjectId, academicYear, semester }) {
  return `${classId}:${subjectId}:${academicYear}:${String(semester).toUpperCase()}`;
}

export function upsertGradeStorageRecord(storageKey, record) {
  const records = readGradeStorage(storageKey);
  const index = records.findIndex((item) => item.key === record.key);
  if (index >= 0) records[index] = record;
  else records.push(record);
  writeGradeStorage(storageKey, records);
  return record;
}

export function removeGradeStorageRecord(storageKey, key) {
  const nextRecords = readGradeStorage(storageKey).filter((item) => item.key !== key);
  writeGradeStorage(storageKey, nextRecords);
}
