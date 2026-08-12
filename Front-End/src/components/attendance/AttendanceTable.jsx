import { formatShortDate } from "../../utils/dateFormatter";
import AttendanceLegend from "./AttendanceLegend";
import AttendanceStatusBadge from "./AttendanceStatusBadge";
import AttendanceStatusSelector from "./AttendanceStatusSelector";

export default function AttendanceTable({
  data,
  statuses,
  onStatusChange,
  saved,
  disabled,
}) {
  return (
    <section className="overflow-hidden rounded-[14px] bg-white shadow-soft">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-sm sm:min-w-[860px]">
          <thead className="bg-[#F3F3FF] text-[#4B5060]">
            <tr>
              <th scope="col" className="sticky left-0 z-20 min-w-[180px] bg-[#F3F3FF] px-4 py-4 text-left font-semibold sm:min-w-[300px]">
                Nama Siswa
              </th>
              {data.meetings.map((meeting) => (
                <th key={meeting.number} scope="col" className="min-w-[105px] px-3 py-3 text-center font-semibold">
                  <span className="block">P{meeting.number}</span>
                  <span className="block text-xs font-normal text-[#7A8090]">{formatShortDate(meeting.date)}</span>
                </th>
              ))}
              <th scope="col" className="min-w-[220px] px-3 py-3 text-center font-semibold text-[#0756D9]">
                <span className="block">P4</span>
                <span className="block text-xs font-normal">Hari Ini</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.students.map((student) => (
              <tr key={student.id} className="group border-t border-[#EDF0F5] hover:bg-slate-50/60">
                <th
                  scope="row"
                  className="sticky left-0 z-10 bg-white px-4 py-3 text-left font-normal group-hover:bg-[#FAFBFD]"
                >
                  <span className="block font-medium text-[#20232D]">{student.name}</span>
                  <span className="mt-0.5 block text-xs text-[#545968]">NIS: {student.nis}</span>
                </th>
                {data.meetings.map((meeting, index) => {
                  const status = student.history[index];
                  return (
                    <td key={`${student.id}-${meeting.number}`} className="px-3 py-3 text-center">
                      {status ? <AttendanceStatusBadge status={status} /> : null}
                    </td>
                  );
                })}
                <td className="px-3 py-3 text-center">
                  <AttendanceStatusSelector
                    student={student}
                    value={statuses[student.id]}
                    onChange={(status) => onStatusChange(student.id, status)}
                    disabled={disabled || saved}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <AttendanceLegend total={data.students.length} />
    </section>
  );
}
