import { ArrowDown, ArrowUp } from "lucide-react";

export default function GradeTableHeader({ components, sortDirection, onSort, sortable = true }) {
  const SortIcon = sortDirection === "asc" ? ArrowDown : ArrowUp;
  return (
    <thead className="bg-white text-[#4B5060]">
      <tr>
        <th
          scope="col"
          aria-sort={sortDirection === "asc" ? "ascending" : "descending"}
          className="sticky left-0 z-20 min-w-[180px] bg-white px-4 py-4 text-left sm:min-w-[190px]"
        >
          {sortable ? (
            <button
              type="button"
              onClick={onSort}
              className="inline-flex items-center gap-2 rounded text-sm font-semibold hover:text-[#0756D9]"
              aria-label={`Urutkan nama siswa ${sortDirection === "asc" ? "Z ke A" : "A ke Z"}`}
            >
              Nama Siswa <SortIcon aria-hidden="true" className="h-4 w-4" />
            </button>
          ) : (
            <span className="text-sm font-semibold">Nama Siswa</span>
          )}
        </th>
        {components.map((component) => (
          <th key={component.id} scope="col" className="min-w-[56px] px-1 py-4 text-center">
            <span className="block text-sm font-semibold">{component.label}</span>
            <span className="mt-1 block text-xs font-normal text-[#7A8090]">{component.weight}%</span>
          </th>
        ))}
        <th scope="col" className="min-w-[80px] border-l border-[#DDE2EC] bg-[#F3F3FF] px-2 py-4 text-center text-sm font-semibold">
          Akhir
        </th>
      </tr>
    </thead>
  );
}
