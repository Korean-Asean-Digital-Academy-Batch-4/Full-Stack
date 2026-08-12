import { appConfig } from "../../config/env";
import { clearAuthSession, getAuthToken } from "../../stores/authStore";
import { ApiError, unwrapApiPayload } from "./contracts";

function buildUrl(path, query) {
  const normalizedBase = appConfig.apiBaseUrl.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  const absoluteBase = /^https?:\/\//i.test(normalizedBase)
    ? normalizedBase
    : `${window.location.origin}${normalizedBase.startsWith("/") ? "" : "/"}${normalizedBase}`;
  const url = new URL(`${absoluteBase}${normalizedPath}`);
  Object.entries(query || {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });
  return url.toString();
}

export async function apiRequest(path, options = {}) {
  const { method = "GET", body, query, responseType = "json", signal, auth = true } = options;
  const headers = new Headers(options.headers || {});
  const token = getAuthToken();
  if (auth && token) headers.set("Authorization", `Bearer ${token}`);
  let requestBody = body;

  if (body != null && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    requestBody = JSON.stringify(body);
  }

  let response;
  try {
    response = await fetch(buildUrl(path, query), {
      method,
      headers,
      body: requestBody,
      signal,
    });
  } catch (error) {
    if (error.name === "AbortError") throw error;
    throw new ApiError("Tidak dapat terhubung ke server EduTrack.", { data: error });
  }

  if (response.status === 401 && auth) clearAuthSession();
  if (response.status === 204) return null;
  if (responseType === "blob" && response.ok) return response.blob();

  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (payload?.success === false) return unwrapApiPayload(payload, response.status);
    throw new ApiError(`Permintaan gagal (${response.status}).`, {
      status: response.status,
      data: payload,
    });
  }
  return unwrapApiPayload(payload, response.status);
}

export const api = {
  get: (path, options) => apiRequest(path, options),
  post: (path, body, options) => apiRequest(path, { ...options, method: "POST", body }),
  put: (path, body, options) => apiRequest(path, { ...options, method: "PUT", body }),
  patch: (path, body, options) => apiRequest(path, { ...options, method: "PATCH", body }),
  delete: (path, options) => apiRequest(path, { ...options, method: "DELETE" }),
  download: (path, options) => apiRequest(path, { ...options, responseType: "blob" }),
};

export function downloadBlob(blob, fileName) {
  const objectUrl = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = objectUrl;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(objectUrl);
}

export { ApiError } from "./contracts";
