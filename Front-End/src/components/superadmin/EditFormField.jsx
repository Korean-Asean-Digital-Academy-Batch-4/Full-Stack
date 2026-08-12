export default function EditFormField({ label, error, readOnly = false, ...inputProps }) {
  const errorId = `${inputProps.id}-error`;
  return (
    <label className="block text-sm font-semibold text-[#343946]">
      {label}
      <input
        {...inputProps}
        readOnly={readOnly}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`mt-2 h-11 w-full rounded-lg border px-3 text-sm outline-none transition ${readOnly ? "cursor-default border-[#E1E5ED] bg-[#F5F7FA] text-[#697184]" : error ? "border-red-500 bg-white focus:ring-2 focus:ring-red-100" : "border-[#D7DCE7] bg-white focus:border-[#0756D9] focus:ring-2 focus:ring-[#DCE8FF]"}`}
      />
      {error && <span id={errorId} className="mt-1.5 block text-xs font-normal text-red-600">{error}</span>}
    </label>
  );
}
