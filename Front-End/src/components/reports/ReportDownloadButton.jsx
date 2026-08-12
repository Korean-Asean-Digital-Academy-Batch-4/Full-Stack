import { FileDown } from "lucide-react";
import Button from "../ui/Button";

export default function ReportDownloadButton({ finalized, onClick, loading }) {
  return (
    <Button variant="secondary" onClick={onClick} loading={loading} disabled={loading} className="h-10"><FileDown aria-hidden="true" className="h-4 w-4" /> {loading ? "Membuat PDF..." : finalized ? "Download Rapor" : "Download Preview"}</Button>
  );
}
