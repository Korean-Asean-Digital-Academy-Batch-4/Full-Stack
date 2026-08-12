export const GRADE_RANGE_ERROR = "Nilai harus berada pada rentang 0–100.";

export function validateGradeValue(value) {
  if (value === null || value === undefined || value === "") return "";
  const numericValue = Number(value);
  if (!Number.isFinite(numericValue) || numericValue < 0 || numericValue > 100) {
    return GRADE_RANGE_ERROR;
  }
  return "";
}

export function validateGradeSheet(grades, students, components) {
  const errors = {};
  students.forEach((student) => {
    components.forEach((component) => {
      const error = validateGradeValue(grades?.[student.id]?.[component.id]);
      if (error) errors[`${student.id}:${component.id}`] = error;
    });
  });
  return errors;
}

export function isValidGradePayload(grades, components) {
  if (!grades || typeof grades !== "object" || Array.isArray(grades)) return false;
  const allowedComponents = new Set(components.map((component) => component.id));
  return Object.values(grades).every(
    (scores) =>
      scores &&
      typeof scores === "object" &&
      !Array.isArray(scores) &&
      Object.entries(scores).every(
        ([componentId, value]) => allowedComponents.has(componentId) && !validateGradeValue(value),
      ),
  );
}

export function hasIncompleteGrades(grades, students, components) {
  return students.some((student) =>
    components.some((component) => {
      const value = grades?.[student.id]?.[component.id];
      return value === null || value === undefined || value === "";
    }),
  );
}

export function validateAssessmentWeights(components) {
  return components.reduce((total, component) => total + component.weight, 0) === 100;
}
