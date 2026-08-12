export default function InsightBadge({ children, tone = "rose" }) {
  const styles = tone === "amber" ? "bg-[#FFF0CE] text-[#D67A00]" : "bg-[#FFE0DD] text-[#C9252D]";
  return <span className={`mx-1 inline-flex rounded-md px-2 py-0.5 text-sm font-semibold ${styles}`}>{children}</span>;
}
