import { ChevronDown } from "lucide-react";

export default function SuperAdminFilterSelect({ label, value, onChange, options }) {
  return (
    <label className="block min-w-0">
      <span className="mb-1.5 block text-[11px] font-medium text-[#343946]">{label}</span>
      <span className="relative block">
        <select
          aria-label={label}
          value={value}
          onChange={onChange}
          className="h-10 w-full appearance-none rounded-md border border-[#D7DCE7] bg-white pl-3 pr-8 text-sm text-[#343946] outline-none focus:border-[#0756D9] focus:ring-2 focus:ring-[#DCE8FF]"
        >
          {options.map((option) => (
            <option key={option.id} value={option.id}>{option.name}</option>
          ))}
        </select>
        <ChevronDown aria-hidden="true" className="pointer-events-none absolute right-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[#697184]" />
      </span>
    </label>
  );
}
