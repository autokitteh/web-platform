export const fetchMenuInterval = 60000;
export const fetchSessionsInterval = 10000;
export const fetchDeploymentsInterval = 30000;

export const isDevelopment = process.env.NODE_ENV === "development";
export const isAuthEnabled: boolean = import.meta.env.VITE_AUTH_ENABLED === "true" || false;
export const descopeProjectId: string = import.meta.env.VITE_DESCOPE_PROJECT_ID || "";
