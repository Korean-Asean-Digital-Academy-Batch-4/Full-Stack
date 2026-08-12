import { forwardRef } from "react";
import { cn } from "../../utils/cn";
import Spinner from "./Spinner";

const variants = {
  primary:
    "bg-[#0756D9] text-white shadow-[0_4px_10px_rgba(7,86,217,0.22)] hover:bg-[#0648B8]",
  secondary: "border border-[#D9DEE9] bg-white text-[#343946] hover:bg-[#F7F9FC]",
  danger: "bg-[#DC2626] text-white hover:bg-[#B91C1C]",
  success: "bg-[#10B981] text-white shadow-sm hover:bg-[#059669]",
  ghost: "bg-transparent text-[#0756D9] hover:bg-blue-50",
};

const Button = forwardRef(function Button({
  children,
  className,
  variant = "primary",
  loading = false,
  disabled,
  type = "button",
  ...props
}, ref) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      className={cn(
        "inline-flex h-12 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition duration-150 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60",
        variants[variant],
        className,
      )}
      {...props}
    >
      {loading && <Spinner />}
      {children}
    </button>
  );
});

export default Button;
