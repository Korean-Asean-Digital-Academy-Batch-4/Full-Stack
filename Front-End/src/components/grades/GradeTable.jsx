import { calculateFinalGrade } from "../../utils/calculateFinalGrade";
import FinalGradeCell from "./FinalGradeCell";
import GradeActionBar from "./GradeActionBar";
import GradeInputCell from "./GradeInputCell";
import GradeStudentCell from "./GradeStudentCell";
import GradeTableHeader from "./GradeTableHeader";

export default function GradeTable({
  students,
  components,
  grades,
  errors,
  kkm,
  isEditing,
  isSaving,
  isDirty,
  autosaveStatus,
  locked,
  sortDirection,
  onSort,
  onGradeChange,
  onEdit,
  onCancel,
  onSave,
  onOpenTopics,
  topicButtonRef,
  readOnly = false,
  finalGrades = null,
  lockedStudentIds = [],
}) {
  const lockedStudents = new Set(lockedStudentIds);
  return (
    <section id="grade-table-section" className="mt-8 overflow-hidden rounded-2xl bg-white shadow-soft">
      <div className="max-w-full overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse">
          <GradeTableHeader
            components={components}
            sortDirection={sortDirection}
            onSort={onSort}
            sortable={!readOnly}
          />
          <tbody>
            {students.map((student) => {
              const studentLocked = lockedStudents.has(student.id);
              return (
              <tr key={student.id} className={`group border-t border-[#E9ECF2] ${studentLocked ? "bg-slate-50/80" : "hover:bg-[#FBFCFE]"}`}>
                <GradeStudentCell student={student} locked={studentLocked} />
                {components.map((component) => {
                  const value = grades?.[student.id]?.[component.id];
                  const error = errors?.[`${student.id}:${component.id}`];
                  return isEditing && !studentLocked ? (
                    <GradeInputCell
                      key={component.id}
                      student={student}
                      component={component}
                      value={value}
                      error={error}
                      disabled={isSaving || locked}
                      onChange={(nextValue) => onGradeChange(student.id, component.id, nextValue)}
                    />
                  ) : (
                    <td key={component.id} title={studentLocked ? "Nilai tidak dapat diedit karena rapor telah difinalisasi." : undefined} className={`px-2 py-4 text-center text-sm ${studentLocked ? "cursor-not-allowed bg-slate-50 text-[#64748B]" : "text-[#20232D]"}`}>
                      {value === null || value === undefined || value === "" ? "—" : value}
                    </td>
                  );
                })}
                <FinalGradeCell
                  value={finalGrades && Object.prototype.hasOwnProperty.call(finalGrades, student.id)
                    ? finalGrades[student.id]
                    : calculateFinalGrade(grades?.[student.id], components)}
                  kkm={kkm}
                  showStatusLabel={!readOnly}
                />
              </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {!readOnly && <GradeActionBar
        isEditing={isEditing}
        isSaving={isSaving}
        isDirty={isDirty}
        autosaveStatus={autosaveStatus}
        locked={locked}
        onEdit={onEdit}
        onCancel={onCancel}
        onSave={onSave}
        onOpenTopics={onOpenTopics}
        topicButtonRef={topicButtonRef}
      />}
    </section>
  );
}
