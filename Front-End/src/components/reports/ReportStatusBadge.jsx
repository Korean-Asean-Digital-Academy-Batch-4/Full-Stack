import { CircleAlert, CircleCheck, LoaderCircle, RotateCcw, Timer } from "lucide-react";
import { REPORT_STATUSES } from "../../data/reportData";
import { getReportStatusLabel } from "../../utils/reportStatus";
import Badge from "../ui/Badge";

const styles = {
  [REPORT_STATUSES.NOT_CREATED]: "bg-slate-100 text-slate-600",
  [REPORT_STATUSES.GENERATING]: "bg-blue-50 text-blue-700",
  [REPORT_STATUSES.DRAFT]: "bg-amber-50 text-amber-700",
  [REPORT_STATUSES.FINALIZED_SUBJECT]: "bg-emerald-100 text-emerald-700",
  [REPORT_STATUSES.REOPENED]: "bg-violet-100 text-violet-700",
  [REPORT_STATUSES.ERROR]: "bg-red-100 text-red-700",
};

const icons = {
  [REPORT_STATUSES.NOT_CREATED]: Timer,
  [REPORT_STATUSES.GENERATING]: LoaderCircle,
  [REPORT_STATUSES.DRAFT]: CircleCheck,
  [REPORT_STATUSES.FINALIZED_SUBJECT]: CircleCheck,
  [REPORT_STATUSES.REOPENED]: RotateCcw,
  [REPORT_STATUSES.ERROR]: CircleAlert,
};

export default function ReportStatusBadge({ status }) {
  const Icon = icons[status] || Timer;
  return (
    <Badge className={styles[status] || styles.NOT_CREATED}>
      <Icon aria-hidden="true" className={`h-3.5 w-3.5 ${status === REPORT_STATUSES.GENERATING ? "animate-spin" : ""}`} />
      {getReportStatusLabel(status)}
    </Badge>
  );
}
