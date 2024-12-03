import packageJson from "../../package.json";

export const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";
export const isProduction = import.meta.env.VITE_NODE_ENV === "production";
export const isAuthEnabled: boolean = import.meta.env.VITE_AUTH_ENABLED === "true";
export const descopeProjectId: string = import.meta.env.VITE_DESCOPE_PROJECT_ID;
export const googleAnalytics4Id: string = import.meta.env.GOOGLE_ANALYTICS_ID;
export const authBearer: string = import.meta.env.TESTS_JWT_AUTH_TOKEN;
export const homepageURL = "/";
export const isLoggedInCookie = "ak_logged_in";
export const version = packageJson.version;

export const fetchProjectsMenuItemsInterval = 60000;
export const fetchSessionsInterval = 10000;
export const defaultSessionsVisiblePageSize = 10;
export const maxLogs = 20;
export const fileSizeUploadLimit = 50 * 1024; // 50KB
export const apiRequestTimeout = isDevelopment ? 1000 * 60 : 5000;

export const templatesUpdateCheckInterval = 24 * 60 * 60 * 1000; // 24 hours

export const dateTimeFormat = "YYYY-DD-MM HH:mm:ss";
export const timeFormat = "HH:mm:ss";

export const supportedProgrammingLanguages = [".py", ".star"];
export const allowedManualRunExtensions = ["python", "starlark"];
