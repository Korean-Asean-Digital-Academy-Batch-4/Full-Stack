import { cn } from "../../utils/cn";

export default function Badge({ children, className, ...props }) {
  return (
    <span
      className={cn("inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold", className)}
      {...props}
    >
      {children}
    </span>
  );
}
