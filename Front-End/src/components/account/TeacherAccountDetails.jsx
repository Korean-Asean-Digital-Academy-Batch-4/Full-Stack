const fields = [
  ["Nama Pengguna", "username"],
  ["Alamat Email", "email"],
  ["Peran Sistem", "systemRole"],
  ["ID Internal", "internalId"],
  ["NUPTK atau NIP", "identityNumber"],
];

export default function TeacherAccountDetails({ profile }) {
  return (
    <article className="rounded-2xl border border-[#E7EAF1] bg-white p-6 shadow-sm"><h2 className="text-lg font-bold text-[#202838]">Detail Akun</h2><div className="mt-5 grid gap-4 sm:grid-cols-2">{fields.map(([label, key]) => <label key={key} className="block text-xs font-semibold text-[#626879]">{label}<input value={profile[key]} readOnly className="mt-2 h-10 w-full rounded-lg border border-[#E6E9F0] bg-[#F8F9FC] px-3 text-sm font-medium text-[#343946]" /></label>)}<label className="block text-xs font-semibold text-[#626879]">Status Wali Kelas<input value={profile.homeroomAssignment?.className || "Tidak menjadi wali kelas"} readOnly className="mt-2 h-10 w-full rounded-lg border border-[#E6E9F0] bg-[#F8F9FC] px-3 text-sm font-medium text-[#343946]" /></label></div></article>
  );
}
