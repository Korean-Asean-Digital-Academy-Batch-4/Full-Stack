import { CheckCircle2, Sigma } from "lucide-react";
import { useEffect, useState } from "react";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import Toast from "../../components/ui/Toast";
import { getAssessmentComponents, updateAssessmentComponents } from "../../services/adminService";

const CATEGORY_ORDER = ["UAS", "UTS", "Ulangan Harian", "Tugas"];
const FORMULA_METADATA = {
  name: "Rumus Penilaian Sekolah",
  status: "active",
  appliedTo: ["Kelas X", "Kelas XI", "Kelas XII"],
  components: [],
};
const CATEGORY_COLORS = {
  UAS: "#0756D9",
  UTS: "#3B82F6",
  "Ulangan Harian": "#9BBEFF",
  Tugas: "#DCE8FF",
};

export default function MainFormulaPage() {
  const [formula, setFormula] = useState(FORMULA_METADATA);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    let active = true;
    getAssessmentComponents()
      .then((components) => {
        if (!active) return;
        setFormula({
          ...FORMULA_METADATA,
          components: components.map((component) => ({
            code: component.kode,
            name: component.nama,
            weight: component.bobot,
            category: component.kode === "UAS"
              ? "UAS"
              : component.kode === "UTS"
                ? "UTS"
                : component.kode.startsWith("U")
                  ? "Ulangan Harian"
                  : "Tugas",
          })),
        });
      })
      .catch((error) => { if (active) setLoadError(error.message); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  if (loading) return <main className="mx-auto w-full max-w-[1160px] px-4 py-8"><p role="status" className="rounded-lg border border-[#D7DCE7] bg-white p-4 text-sm text-[#697184]">Memuat komponen penilaian...</p></main>;
  if (loadError) return <main className="mx-auto w-full max-w-[1160px] px-4 py-8"><p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</p></main>;

  const totalWeight = formula.components.reduce((total, component) => total + Number(component.weight || 0), 0);
  const isValid = totalWeight === 100;
  const categoryWeights = formula.components.reduce((totals, component) => ({
    ...totals,
    [component.category]: (totals[component.category] || 0) + Number(component.weight || 0),
  }), {});

  let currentOffset = 0;
  const donutGradient = `conic-gradient(${CATEGORY_ORDER.map((category) => {
    const start = currentOffset;
    currentOffset += categoryWeights[category] || 0;
    return `${CATEGORY_COLORS[category]} ${start}% ${currentOffset}%`;
  }).join(", ")})`;

  const updateWeight = (code, value) => {
    if (value !== "" && (!/^\d{0,3}(\.\d{0,2})?$/.test(value) || Number(value) > 100)) return;
    setFormula((current) => ({ ...current, components: current.components.map((item) => item.code === code ? { ...item, weight: value } : item) }));
  };

  const saveFormula = async () => {
    if (!isValid) { setToast({ type: "error", message: "Total bobot harus tepat 100%." }); return; }
    setSaving(true);
    try {
      await updateAssessmentComponents(formula.components.map((item) => ({ kode: item.code, bobot: Number(item.weight) })));
      setFormula((current) => ({ ...current, components: current.components.map((item) => ({ ...item, weight: Number(item.weight) })) }));
      setEditing(false);
      setToast({ type: "success", message: "Bobot penilaian tersimpan ke database." });
    } catch (error) { setToast({ type: "error", message: error.message || "Bobot gagal disimpan." }); }
    finally { setSaving(false); }
  };

  return (
    <main className="mx-auto w-full max-w-[1160px] px-4 py-8 sm:px-6 lg:px-8">
      <header>
        <h1 className="text-3xl font-bold tracking-[-0.035em] text-[#20232D]">Manajemen Rumus</h1>
        <p className="mt-2 text-base text-[#555D6E]">Konfigurasi bobot penilaian dan komponen evaluasi.</p>
      </header>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1.85fr)_minmax(280px,0.9fr)] lg:items-start">
        <section className="overflow-hidden rounded-lg border border-[#C8D0DF] bg-white shadow-[0_1px_3px_rgba(30,42,75,0.04)]" aria-labelledby="formula-name">
          <div className="flex flex-col gap-4 border-b border-[#D7DCE7] px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#E8EFFF] text-[#173A75]">
                <Sigma aria-hidden="true" className="h-6 w-6" />
              </span>
              <div>
                <h2 id="formula-name" className="text-base font-medium text-[#20232D]">{formula.name}</h2>
                <p className="mt-1 text-sm text-[#555D6E]">Diterapkan ke: {formula.appliedTo.join(", ")}</p>
              </div>
            </div>
            <div className="flex items-center gap-2"><Badge className="self-start bg-emerald-50 font-medium uppercase text-emerald-600 sm:self-auto"><span aria-hidden="true">●</span> {formula.status === "active" ? "Aktif" : "Tidak Aktif"}</Badge>{editing ? <><Button variant="secondary" onClick={() => setEditing(false)}>Batal</Button><Button onClick={saveFormula} loading={saving}>Simpan Bobot</Button></> : <Button variant="secondary" onClick={() => setEditing(true)}>Ubah Bobot</Button>}</div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[480px] border-collapse text-left">
              <thead className="bg-[#F4F5F7] text-sm font-semibold uppercase tracking-wide text-[#4D5362]">
                <tr>
                  <th scope="col" className="px-5 py-4">Komponen</th>
                  <th scope="col" className="w-48 px-5 py-4">Bobot</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#D7DCE7] text-base text-[#20232D]">
                {formula.components.map((component) => (
                  <tr key={component.code}>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="inline-flex h-8 min-w-8 items-center justify-center rounded-sm bg-[#ECEEF1] px-1.5 text-sm text-[#555D6E]">{component.code}</span>
                        <span>{component.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      {editing ? <div className="flex items-center gap-2"><input value={component.weight} onChange={(event) => updateWeight(component.code, event.target.value)} inputMode="decimal" className="h-9 w-20 rounded-md border px-2 text-center text-sm outline-none focus:border-[#0756D9]" /><span>%</span></div> : <span className="inline-flex rounded-md bg-[#ECEEF1] px-3 py-1.5 text-sm font-medium">{component.weight}%</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-[#C8D0DF] text-base">
                <tr>
                  <td className="px-5 py-5 font-medium">Total Bobot</td>
                  <td className="px-5 py-5">
                    <span className={isValid ? "inline-flex items-center gap-2 font-medium text-[#0756D9]" : "font-medium text-red-600"}>
                      {totalWeight}%
                      {isValid && <CheckCircle2 aria-label="Bobot valid" className="h-4 w-4 text-emerald-500" />}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        <aside className="rounded-lg border border-[#C8D0DF] bg-white p-6 shadow-[0_1px_3px_rgba(30,42,75,0.04)]" aria-labelledby="weight-distribution-title">
          <h2 id="weight-distribution-title" className="text-lg font-medium text-[#20232D]">Distribusi Bobot</h2>
          <div className="mt-5 flex flex-col items-center">
            <div
              role="img"
              aria-label={`Distribusi bobot total ${totalWeight} persen`}
              className="relative flex h-44 w-44 items-center justify-center rounded-full"
              style={{ background: donutGradient }}
            >
              <div className="flex h-[116px] w-[116px] flex-col items-center justify-center rounded-full bg-white text-center">
                <span className="text-3xl font-medium text-[#20232D]">{totalWeight}%</span>
                <span className="mt-1 text-[10px] uppercase tracking-[0.12em] text-[#7A8293]">Total Bobot</span>
              </div>
            </div>
            <p className={`mt-3 text-base font-medium uppercase ${isValid ? "text-[#343946]" : "text-red-600"}`}>{isValid ? "Valid" : "Tidak Valid"}</p>
          </div>

          <ul className="mt-5 space-y-4">
            {CATEGORY_ORDER.map((category) => (
              <li key={category} className="flex items-center gap-3 text-sm text-[#4D5362]">
                <span aria-hidden="true" className="h-3 w-3 rounded-sm" style={{ backgroundColor: CATEGORY_COLORS[category] }} />
                <span>{category}</span>
                <strong className="ml-auto font-semibold text-[#20232D]">{categoryWeights[category] || 0}%</strong>
              </li>
            ))}
          </ul>
        </aside>
      </div>
      <Toast toast={toast} onClose={() => setToast(null)} />
    </main>
  );
}
