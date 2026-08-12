import { ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn";

export default function Select({ label, className, children, ...props }) {
  return (
    <label className={cn("relative block min-w-0", className)}>
      <span className="sr-only">{label}</span>
      <select
        className="h-10 w-full appearance-none rounded-full border border-transparent bg-[#F3F3FF] py-0 pl-4 pr-9 text-sm text-[#4B5060] transition hover:border-[#D9DFF0] focus:border-[#2F67ED] focus:outline-none focus:ring-2 focus:ring-blue-100 disabled:cursor-not-allowed disabled:opacity-60"
        aria-label={label}
        {...props}
      >
        {children}
      </select>
      <ChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#545968]"
      />
    </label>
  );
}
