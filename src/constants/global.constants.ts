export const fetchProjectsMenuItemsInterval = 60000;
export const fetchSessionsInterval = 10000;
export const fetchDeploymentsInterval = 30000;
export const DEFAULT_SESSIONS_VISIBLE_PAGE_SIZE = 10;

export const isDevelopment = import.meta.env.NODE_ENV === "development";
export const isAuthEnabled: boolean = import.meta.env.VITE_AUTH_ENABLED === "true";
export const descopeProjectId: string = import.meta.env.VITE_DESCOPE_PROJECT_ID;
