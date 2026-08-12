export const appConfig = {
  apiBaseUrl: String(import.meta.env.VITE_API_BASE_URL || "/api").replace(/\/$/, ""),
  appName: import.meta.env.VITE_APP_NAME || "EduTrack",
  appEnvironment: import.meta.env.VITE_APP_ENV || import.meta.env.MODE,
};
