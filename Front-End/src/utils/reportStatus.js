import { REPORT_STATUSES } from "../data/reportData";

export const reportStatusLabels = {
  [REPORT_STATUSES.NOT_CREATED]: "Belum Dibuat",
  [REPORT_STATUSES.GENERATING]: "Sedang Membuat...",
  [REPORT_STATUSES.DRAFT]: "Sudah Dibuat",
  [REPORT_STATUSES.FINALIZED_SUBJECT]: "Sudah Difinalisasi",
  [REPORT_STATUSES.DISTRIBUTED]: "Sudah Didistribusikan",
  [REPORT_STATUSES.REOPENED]: "Dibuka Kembali",
  [REPORT_STATUSES.ERROR]: "Gagal Dibuat",
};

export function getReportStatusLabel(status) {
  return reportStatusLabels[status] || reportStatusLabels.NOT_CREATED;
}

export function canGenerateReport(status) {
  return status === REPORT_STATUSES.NOT_CREATED || status === REPORT_STATUSES.ERROR;
}

export function isReportLocked(status) {
  return status === REPORT_STATUSES.FINALIZED_SUBJECT;
}
