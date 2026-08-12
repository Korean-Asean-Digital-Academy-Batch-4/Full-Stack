import {
  createGradeSheetKey,
  GRADE_DRAFTS_KEY,
  GRADE_RECORDS_KEY,
  LEARNING_TOPICS_KEY,
  readGradeStorage,
  removeGradeStorageRecord,
  upsertGradeStorageRecord,
} from "../utils/gradeStorage";

export function getGradeDraft(filters) {
  const key = createGradeSheetKey(filters);
  return readGradeStorage(GRADE_DRAFTS_KEY).find((item) => item.key === key) || null;
}

export function saveGradeDraftRecord(payload) {
  const record = { ...payload, key: createGradeSheetKey(payload) };
  return upsertGradeStorageRecord(GRADE_DRAFTS_KEY, record);
}

export function clearGradeDraft(filters) {
  removeGradeStorageRecord(GRADE_DRAFTS_KEY, createGradeSheetKey(filters));
}

export function getOfficialGradeRecord(filters) {
  const key = createGradeSheetKey(filters);
  return readGradeStorage(GRADE_RECORDS_KEY).find((item) => item.key === key) || null;
}

export function saveOfficialGradeRecord(payload) {
  const record = { ...payload, key: createGradeSheetKey(payload) };
  return upsertGradeStorageRecord(GRADE_RECORDS_KEY, record);
}

export function getTopicRecord(assignmentId) {
  return readGradeStorage(LEARNING_TOPICS_KEY).find(
    (item) => item.assignmentId === assignmentId,
  ) || null;
}

export function saveTopicRecord(payload) {
  const records = readGradeStorage(LEARNING_TOPICS_KEY);
  const index = records.findIndex((item) => item.assignmentId === payload.assignmentId);
  if (index >= 0) records[index] = payload;
  else records.push(payload);
  localStorage.setItem(LEARNING_TOPICS_KEY, JSON.stringify(records));
  return payload;
}
