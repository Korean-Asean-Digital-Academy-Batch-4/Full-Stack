import { CircleCheck } from "lucide-react";
import Badge from "../ui/Badge";

export default function VerificationBadge() {
  return <Badge className="bg-emerald-100 text-emerald-700"><CircleCheck aria-hidden="true" className="h-3.5 w-3.5" /> Akun Terverifikasi</Badge>;
}
