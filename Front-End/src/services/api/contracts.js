export class ApiError extends Error {
  constructor(message, { status = 0, code = "", details = [], data = null } = {}) {
    super(message || "Permintaan tidak dapat diproses.");
    this.name = "ApiError";
    this.status = status;
    this.code = code;
    this.details = details;
    this.errors = details;
    this.data = data;
  }
}

export function buildLoginPayload({ username, password }) {
  return {
    identifier: username.trim(),
    password,
  };
}

export function adaptLoginSession(data = {}) {
  const profile = data.profile || {};
  const homeroomAssignment = profile.isHomeroom && profile.homeroomClassId
    ? {
        classId: profile.homeroomClassId,
        className: profile.homeroomClassName || "Kelas Wali",
        status: "active",
      }
    : null;

  return {
    token: data.token,
    user: {
      ...profile,
      role: data.role,
      teachingAssignments: profile.teachingAssignments || [],
      assignedClasses: profile.teachingAssignments || [],
      homeroomAssignment,
      homeroomClass: homeroomAssignment
        ? { id: homeroomAssignment.classId, name: homeroomAssignment.className }
        : null,
      isHomeroomTeacher: Boolean(homeroomAssignment),
    },
  };
}

export function unwrapApiPayload(payload, status = 200) {
  if (payload?.success === false) {
    throw new ApiError(payload.message, {
      status,
      details: payload.errors || [],
      data: payload,
    });
  }
  return payload?.data ?? payload;
}
