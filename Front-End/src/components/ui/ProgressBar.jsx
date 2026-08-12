export default function ProgressBar({ value, label = "Progress" }) {
  const normalized = Math.max(0, Math.min(100, Math.round(value || 0)));
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin="0"
      aria-valuemax="100"
      aria-valuenow={normalized}
      className="h-2.5 overflow-hidden rounded-full bg-[#E9EAF8]"
    >
      <div
        className="h-full rounded-full bg-gradient-to-r from-[#7C3AED] to-[#2F67ED] transition-[width] duration-300"
        style={{ width: `${normalized}%` }}
      />
    </div>
  );
}
