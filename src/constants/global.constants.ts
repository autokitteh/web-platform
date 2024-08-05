export const fetchProjectsMenuItemsInterval = 60000;
export const fetchSessionsInterval = 10000;
export const defaultSessionsVisiblePageSize = 10;
export const maxLogs = 20;
export const fileSizeUploadLimit = 50 * 1024; // 50KB
export const apiRequestTimeout = 5000;

export const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";
export const isProduction = import.meta.env.VITE_NODE_ENV === "production";
export const isAuthEnabled: boolean = import.meta.env.VITE_AUTH_ENABLED === "true";
export const descopeProjectId: string = import.meta.env.VITE_DESCOPE_PROJECT_ID;
export const authBearer: string = import.meta.env.TESTS_JWT_AUTH_TOKEN;
export const homepageURL = "/";
export const isLoggedInCookie = "ak_logged_in";
