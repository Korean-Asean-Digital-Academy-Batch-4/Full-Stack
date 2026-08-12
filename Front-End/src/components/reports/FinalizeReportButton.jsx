import { CircleCheck } from "lucide-react";
import Button from "../ui/Button";

export default function FinalizeReportButton({ onClick, disabled, reason, loading }) {
  return (
    <Button onClick={onClick} loading={loading} disabled={disabled || loading} title={reason || "Finalisasi rapor"} className="h-10 bg-[#F59E0B] px-4 hover:bg-[#D97706]">
      {!loading && <CircleCheck aria-hidden="true" className="h-4 w-4" />} {loading ? "Memfinalisasi..." : "Finalisasi Rapor"}
    </Button>
  );
}
