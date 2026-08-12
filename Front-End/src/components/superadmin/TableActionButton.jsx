import { cn } from "../../utils/cn";

const tones = {
  edit: "text-[#596174] hover:bg-[#EEF3FC] hover:text-[#0756D9] focus-visible:ring-[#B8D0FF]",
  danger: "text-[#596174] hover:bg-red-50 hover:text-red-600 focus-visible:ring-red-200",
};

export default function TableActionButton({ icon: Icon, label, onClick, tone = "edit" }) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
        tones[tone],
      )}
    >
      <Icon aria-hidden="true" className="h-4 w-4" />
    </button>
  );
}
