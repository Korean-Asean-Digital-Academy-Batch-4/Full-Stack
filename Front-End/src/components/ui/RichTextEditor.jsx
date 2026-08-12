import { Bold, Italic, List, ListOrdered, Underline } from "lucide-react";
import { forwardRef, useRef } from "react";

const actions = [
  { label: "Tebal", icon: Bold, before: "**", after: "**" },
  { label: "Miring", icon: Italic, before: "_", after: "_" },
  { label: "Garis bawah", icon: Underline, before: "__", after: "__" },
  { label: "Daftar bullet", icon: List, before: "• ", after: "" },
  { label: "Daftar bernomor", icon: ListOrdered, before: "1. ", after: "" },
];

const RichTextEditor = forwardRef(function RichTextEditor({ value, onChange, disabled, error }, forwardedRef) {
  const localRef = useRef(null);
  const setRef = (node) => {
    localRef.current = node;
    if (typeof forwardedRef === "function") forwardedRef(node);
    else if (forwardedRef) forwardedRef.current = node;
  };

  const applyFormat = ({ before, after }) => {
    const input = localRef.current;
    if (!input || disabled) return;
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const selected = value.slice(start, end);
    const next = `${value.slice(0, start)}${before}${selected}${after}${value.slice(end)}`;
    onChange(next);
    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + before.length, end + before.length);
    });
  };

  return (
    <div className={`overflow-hidden rounded-xl border bg-white ${error ? "border-red-400" : "border-[#DDE2EC]"}`}>
      <div className="flex flex-wrap gap-1 border-b border-[#E8EBF2] bg-[#FAFBFD] p-2" aria-label="Toolbar catatan rapor">
        {actions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.label}
              type="button"
              aria-label={action.label}
              title={action.label}
              disabled={disabled}
              onClick={() => applyFormat(action)}
              className="rounded-lg p-2 text-[#4B5060] hover:bg-white hover:text-[#0756D9] disabled:opacity-50"
            >
              <Icon aria-hidden="true" className="h-4 w-4" />
            </button>
          );
        })}
      </div>
      <textarea
        ref={setRef}
        aria-label="Catatan rapor siswa"
        aria-describedby="report-note-help"
        aria-invalid={Boolean(error)}
        value={value}
        maxLength={1000}
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        rows={7}
        className="block w-full resize-y border-0 px-4 py-3 text-sm leading-6 text-[#202838] focus:outline-none disabled:bg-slate-50"
      />
    </div>
  );
});

export default RichTextEditor;
