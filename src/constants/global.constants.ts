import packageJson from "../../package.json";

export const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";
export const isProduction = import.meta.env.VITE_NODE_ENV === "production";
export const appMode = import.meta.env.VITE_NODE_ENV;
export const descopeProjectId: string = import.meta.env.VITE_DESCOPE_PROJECT_ID;
export const hubSpotPortalId: string = import.meta.env.VITE_HUBSPOT_PORTAL_ID;
export const hubSpotFormId: string = import.meta.env.VITE_HUBSPOT_FORM_ID;
export const googleAnalyticsId: string = import.meta.env.GOOGLE_ANALYTICS_ID;
export const msClarityId: string = import.meta.env.VITE_MS_CLARITY_ID;
export const playwrightTestsAuthBearer: string = import.meta.env.TESTS_JWT_AUTH_TOKEN;
export const supportEmail: string = import.meta.env.VITE_SUPPORT_EMAIL;
export const salesEmail: string = import.meta.env.VITE_SALES_EMAIL;
export const aiChatbotUrl: string = import.meta.env.VITE_AKBOT_URL;
export const aiChatbotOrigin: string = import.meta.env.VITE_AKBOT_ORIGIN;
export const homepageURL = "/";
export const version = packageJson.version;

export const fetchProjectsMenuItemsInterval = 60000;
export const fetchSessionsInterval = 10000;
export const maxLogs = 20;
export const fileSizeUploadLimit = 50 * 1024; // 50KB
export const apiRequestTimeout = isDevelopment ? 1000 * 60 : 1000 * 10; // 1 minute in development, 10 seconds in production
export const sessionTerminationDelay = 20n; // 20 seconds in nanoseconds

export const templatesUpdateCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
export const cookieRefreshInterval = 24 * 60 * 60 * 1000; // 24 hours

export const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";
export const dateTimeFormatWithMS = "YYYY-MM-DD HH:mm:ss:SSS";
export const timeFormat = "HH:mm:ss";
export const supportedProgrammingLanguages = [".py", ".star"];
export const allowedManualRunExtensions = ["python", "starlark"];
export const sentryDsn = import.meta.env.SENTRY_DSN;
export const maxLogsPageSize = 100;
export const connectionStatusCheckInterval = 1500; // Interval (ms) between connection status checks
export const maxConnectionsCheckRetries = 600; // Maximum retries for connection status checks (with 1500ms interval = 900 seconds total timeout)

export const chatbotIframeConnectionTimeout = 8000;

export const systemCookies = {
	isLoggedIn: "ak_logged_in",
	templatesLandingName: "ak-landing-template-name",
	chatStartMessage: "chat-start-message",
	hubSpot: "hubspotutk",
};
export const defaultManifestFileName = "autokitteh.yaml";
export const optionalManifestFileName = "autokitteh.yaml.user";
export const defaultTimezoneValue = "Etc/GMT";
