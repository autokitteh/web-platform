export const fetchProjectsMenuItemsInterval = 60000;
export const fetchSessionsInterval = 10000;
export const fetchDeploymentsInterval = 30000;
export const defaultSessionsVisiblePageSize = 10;
export const maxLogs = 20;

export const isDevelopment = import.meta.env.NODE_ENV === "development";
export const isAuthEnabled: boolean = import.meta.env.VITE_AUTH_ENABLED === "true";
export const descopeProjectId: string = import.meta.env.VITE_DESCOPE_PROJECT_ID;
export const homepageURL = "/";
