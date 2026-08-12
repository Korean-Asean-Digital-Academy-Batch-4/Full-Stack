import { cn } from "../../utils/cn";

export default function FormInput({
  id,
  label,
  labelAction,
  icon: Icon,
  endAction,
  error,
  register,
  className,
  ...props
}) {
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={className}>
      <div className="mb-2 flex min-h-5 items-center justify-between gap-4">
        <label htmlFor={id} className="text-xs font-semibold text-[#20232D]">
          {label}
        </label>
        {labelAction}
      </div>
      <div className="relative">
        {Icon && (
          <Icon
            aria-hidden="true"
            className={cn(
              "pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2",
              error ? "text-red-500" : "text-[#555B6B]",
            )}
          />
        )}
        <input
          id={id}
          aria-invalid={Boolean(error)}
          aria-describedby={errorId}
          className={cn(
            "h-12 w-full rounded-[10px] border bg-white text-sm text-[#20232D] shadow-[0_1px_3px_rgba(30,42,75,0.04)] transition placeholder:text-[#B9C0D1] focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50",
            Icon ? "pl-11" : "pl-4",
            endAction ? "pr-12" : "pr-4",
            error
              ? "border-red-400 focus:border-red-500 focus:ring-red-100"
              : "border-[#ECEEF4] focus:border-[#0756D9] focus:ring-blue-100",
          )}
          {...props}
          {...register}
        />
        {endAction && <div className="absolute right-2 top-1/2 -translate-y-1/2">{endAction}</div>}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-xs leading-4 text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}
