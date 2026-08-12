import { Sparkles } from "lucide-react";
import Button from "../ui/Button";

export default function BulkGenerateButton({ disabled, onClick }) {
  return (
    <Button onClick={onClick} disabled={disabled} title={disabled ? "Tidak ada rapor yang dapat dibuat." : "Buat semua rapor yang memenuhi syarat"} className="h-10 bg-gradient-to-r from-[#7657F6] to-[#2F67ED]">
      <Sparkles aria-hidden="true" className="h-4 w-4" /> Buat Semua Rapor
    </Button>
  );
}
