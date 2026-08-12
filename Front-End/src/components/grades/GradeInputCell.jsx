export default function GradeInputCell({ student, component, value, error, disabled, onChange }) {
  const errorId = `grade-error-${student.id}-${component.id}`;
  return (
    <td className="px-1.5 py-2 text-center align-top">
      <input
        data-grade-input={`${student.id}:${component.id}`}
        type="number"
        min="0"
        max="100"
        step="1"
        inputMode="numeric"
        value={value ?? ""}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Nilai ${component.fullName} ${student.name}`}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? errorId : undefined}
        className={`h-10 w-12 rounded-lg border bg-white px-1 text-center text-sm text-[#20232D] transition focus:outline-none focus:ring-2 disabled:cursor-not-allowed disabled:bg-slate-50 ${
          error
            ? "border-red-500 focus:border-red-500 focus:ring-red-100"
            : "border-[#DDE2EC] focus:border-[#0756D9] focus:ring-blue-100"
        }`}
      />
      {error && (
        <p id={errorId} className="mx-auto mt-1 max-w-[88px] text-[10px] leading-3 text-red-600">
          {error}
        </p>
      )}
    </td>
  );
}
