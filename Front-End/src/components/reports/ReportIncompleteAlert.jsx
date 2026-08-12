import { CircleAlert } from "lucide-react";

export default function ReportIncompleteAlert({ problems }) {
  if (!problems.length) return null;
  return (
    <section role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
      <div className="flex items-start gap-3"><CircleAlert aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0" /><div><h3 className="font-bold">Rapor Belum Siap Difinalisasi</h3><ul className="mt-2 list-disc space-y-1 pl-5 text-sm">{problems.map((problem) => <li key={problem}>{problem}</li>)}</ul></div></div>
    </section>
  );
}
