import { api } from "./apiClient";
import { adaptLoginSession, buildLoginPayload } from "./api/contracts";
import { clearAuthSession, getStoredUser, hasAuthSession } from "../stores/authStore";

export async function login({ username, password }) {
  const data = await api.post("/auth/login", buildLoginPayload({ username, password }), { auth: false });
  return adaptLoginSession(data);
}

export async function getCurrentUser() {
  return hasAuthSession() ? getStoredUser() : null;
}

export async function logout() {
  clearAuthSession();
}

export async function changePassword({ currentPassword, newPassword }) {
  return api.post("/auth/change-password", { currentPassword, newPassword });
}
