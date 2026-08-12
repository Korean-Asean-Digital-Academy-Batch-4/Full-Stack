import assert from "node:assert/strict";
import test from "node:test";
import { createAttendanceCsv } from "../src/utils/attendanceExport.js";

test("rekap presensi memakai tanggal tiap pertemuan tanpa label P", () => {
  const csv = createAttendanceCsv(
    [{
      name: "Mikguk Soo",
      nis: "20202989476283",
      statuses: ["PRESENT", "SICK", "ABSENT"],
    }],
    [
      { date: "2026-08-11" },
      { date: "2026-08-10" },
      { date: "2026-08-12" },
    ],
  );

  const [header, row] = csv.replace(/^\uFEFF/, "").split("\r\n");
  assert.equal(header, "Nama Siswa,NIS,11/08/2026,10/08/2026,12/08/2026");
  assert.equal(row, "Mikguk Soo,20202989476283,Hadir,Sakit,Alpa");
  assert.doesNotMatch(header, /(?:^|,)P\d+(?:,|$)/);
});
