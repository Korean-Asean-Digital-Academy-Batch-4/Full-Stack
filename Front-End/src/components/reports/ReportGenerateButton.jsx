import { FilePlus2, RotateCcw } from "lucide-react";
import { REPORT_STATUSES } from "../../data/reportData";
import { canGenerateReport } from "../../utils/reportStatus";
import Button from "../ui/Button";

export default function ReportGenerateButton({ student, onGenerate, generating }) {
  const incomplete = student.finalGrade == null;
  const canGenerate = canGenerateReport(student.reportStatus) && !incomplete;
  const label = student.reportStatus === REPORT_STATUSES.ERROR ? "Coba Lagi" : "Buat Rapor";
  const Icon = student.reportStatus === REPORT_STATUSES.ERROR ? RotateCcw : FilePlus2;
  let disabledReason = "";
  if (incomplete) disabledReason = "Lengkapi seluruh nilai wajib sebelum membuat rapor.";
  else if (!canGenerateReport(student.reportStatus)) disabledReason = "Rapor sudah dibuat atau sedang diproses.";

  return (
    <Button
      variant="secondary"
      loading={generating || student.reportStatus === REPORT_STATUSES.GENERATING}
      disabled={!canGenerate || generating}
      onClick={() => onGenerate(student)}
      title={disabledReason || label}
      aria-label={`${label} ${student.name}${disabledReason ? `. ${disabledReason}` : ""}`}
      className="h-9 whitespace-nowrap border-[#8B5CF6] px-3 text-xs text-[#6D3FE4]"
    >
      {!generating && student.reportStatus !== REPORT_STATUSES.GENERATING && <Icon aria-hidden="true" className="h-3.5 w-3.5" />}
      {generating || student.reportStatus === REPORT_STATUSES.GENERATING ? "Sedang Membuat..." : label}
    </Button>
  );
}
