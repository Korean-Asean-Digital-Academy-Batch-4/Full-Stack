export default function SuperAdminPlaceholderPage({ title }) {
  return (
    <div className="px-4 py-7 sm:px-6 lg:px-8">
      <section className="mx-auto max-w-[1000px] rounded-xl border border-[#D7DCE7] bg-white p-7 shadow-[0_2px_8px_rgba(30,42,75,0.04)]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#697184]">Superadmin</p>
        <h1 className="mt-2 text-2xl font-bold text-[#20232D]">{title}</h1>
        <p className="mt-2 text-sm text-[#5D6576]">Halaman ini siap menggunakan layout Superadmin yang konsisten.</p>
      </section>
    </div>
  );
}
