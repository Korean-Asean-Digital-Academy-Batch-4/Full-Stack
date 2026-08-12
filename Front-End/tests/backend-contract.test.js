import test from "node:test";
import assert from "node:assert/strict";
import {
  ApiError,
  adaptLoginSession,
  buildLoginPayload,
  unwrapApiPayload,
} from "../src/services/api/contracts.js";

test("payload login mengikuti nama field backend", () => {
  assert.deepEqual(buildLoginPayload({ username: " 123456 ", password: "rahasia" }), {
    identifier: "123456",
    password: "rahasia",
  });
});

test("respons login guru dipetakan ke sesi frontend", () => {
  const session = adaptLoginSession({
    token: "jwt-token",
    role: "teacher",
    profile: {
      id: "11111111-1111-4111-8111-111111111111",
      name: "Budi",
      nip: "123456",
      isHomeroom: true,
      homeroomClassId: "33333333-3333-4333-8333-333333333333",
    },
  });

  assert.equal(session.token, "jwt-token");
  assert.equal(session.user.role, "teacher");
  assert.equal(session.user.name, "Budi");
  assert.equal(session.user.homeroomAssignment.classId, "33333333-3333-4333-8333-333333333333");
  assert.equal(session.user.isHomeroomTeacher, true);
});

test("role admin backend dipertahankan frontend", () => {
  assert.equal(adaptLoginSession({ token: "x", role: "admin", profile: { id: "1", name: "Admin" } }).user.role, "admin");
});

test("amplop data backend dibuka dan pesan kesalahan dipertahankan", () => {
  assert.deepEqual(unwrapApiPayload({ success: true, data: { id: "1" } }, 200), { id: "1" });

  assert.throws(
    () => unwrapApiPayload({ success: false, message: "NIP/NIS/email atau kata sandi salah", errors: [] }, 401),
    (error) => {
      assert.equal(error instanceof ApiError, true);
      assert.equal(error.status, 401);
      assert.equal(error.message, "NIP/NIS/email atau kata sandi salah");
      return true;
    },
  );
});
