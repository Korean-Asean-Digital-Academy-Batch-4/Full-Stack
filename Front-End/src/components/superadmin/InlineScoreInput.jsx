export default function InlineScoreInput({
  value,
  onChange,
  error,
  ariaLabel,
  compact = false,
  autoFocus = false,
}) {
  return (
    <input
      type="number"
      min="0"
      max="100"
      step="1"
      inputMode="numeric"
      value={value ?? ""}
      onChange={(event) => onChange(event.target.value)}
      aria-label={ariaLabel}
      aria-invalid={Boolean(error)}
      autoFocus={autoFocus}
      className={`${compact ? "h-8 w-11 px-1 text-xs" : "h-9 w-16 px-2 text-sm"} rounded border bg-white text-center text-[#20232D] outline-none transition focus:ring-2 ${
        error
          ? "border-red-500 focus:border-red-500 focus:ring-red-100"
          : "border-[#B9C9E8] focus:border-[#0756D9] focus:ring-[#DCE8FF]"
      }`}
    />
  );
}
