export function isActiveHomeroomTeacher(user) {
  return Boolean(
    user?.role === "teacher" &&
    user?.homeroomAssignment?.status === "active",
  );
}

export function canManageGrades(user) {
  return user?.role === "teacher";
}

export function getActiveTeachingAssignments(user) {
  if (!canManageGrades(user) || !Array.isArray(user?.teachingAssignments)) return [];
  return user.teachingAssignments.filter(
    (assignment) =>
      assignment?.status === "active" &&
      Boolean(assignment.classId || assignment.id) &&
      Boolean(assignment.subjectId),
  );
}

export function canManageTeachingAssignment(user, filters) {
  if (!filters) return false;
  const normalizeSemester = (value) => String(value || "").toUpperCase();
  return getActiveTeachingAssignments(user).some(
    (assignment) =>
      (assignment.classId || assignment.id) === filters.classId &&
      assignment.subjectId === filters.subjectId &&
      assignment.academicYear === filters.academicYear &&
      normalizeSemester(assignment.semester) === normalizeSemester(filters.semester),
  );
}

export function canViewClassSubjectGrades(user) {
  return isActiveHomeroomTeacher(user);
}

export function canCreateReport(user) {
  return isActiveHomeroomTeacher(user);
}

export function getActiveHomeroomClassId(user) {
  return isActiveHomeroomTeacher(user)
    ? user.homeroomAssignment.classId || null
    : null;
}
