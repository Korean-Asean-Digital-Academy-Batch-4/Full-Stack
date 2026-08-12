import Badge from "../ui/Badge";

const averageStyles = {
  blue: "bg-[#E8F0FF] text-[#0756D9]",
  neutral: "bg-[#ECEEF1] text-[#555D6E]",
  red: "bg-red-50 text-red-600",
};

const statusConfig = {
  promoted: {
    label: "Naik Kelas",
    className: "border border-emerald-200 bg-emerald-50 text-emerald-600",
  },
  not_promoted: {
    label: "Tinggal Kelas",
    className: "border border-red-200 bg-red-50 text-red-600",
  },
};

export function ReportAverageBadge({ value, tone = "neutral" }) {
  return (
    <Badge className={`rounded-md px-2 py-1 font-medium ${averageStyles[tone] || averageStyles.neutral}`}>
      {Number(value).toFixed(1)}
    </Badge>
  );
}

export function PromotionStatusBadge({ status }) {
  const config = statusConfig[status] || statusConfig.not_promoted;
  return (
    <Badge className={`px-2 py-1 font-medium ${config.className}`}>
      <span aria-hidden="true">●</span> {config.label}
    </Badge>
  );
}
