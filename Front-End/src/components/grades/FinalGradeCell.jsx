export default function FinalGradeCell({ value, kkm, showStatusLabel = true }) {
  if (value === null) {
    return (
      <td className="border-l border-[#DDE2EC] bg-[#F3F3FF] px-3 py-3 text-center text-xs font-medium text-[#7A8090]">
        —
      </td>
    );
  }

  const belowKkm = value < kkm;
  return (
    <td
      className={`border-l border-[#DDE2EC] bg-[#F3F3FF] px-3 py-3 text-center font-bold ${
        belowKkm ? "text-[#DC2626]" : "text-[#20232D]"
      }`}
      title={belowKkm ? "Di bawah KKM" : "Tuntas"}
    >
      <span className="block">{value.toFixed(1)}</span>
      {showStatusLabel && (
        <span className={`mt-0.5 block text-[9px] font-medium ${belowKkm ? "text-red-600" : "sr-only"}`}>
          {belowKkm ? "Di bawah KKM" : "Tuntas"}
        </span>
      )}
    </td>
  );
}
