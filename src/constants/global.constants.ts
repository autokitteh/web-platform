import * as Sentry from "@sentry/react";
import { Routes } from "react-router-dom";

import packageJson from "../../package.json";

export const isDevelopment = import.meta.env.VITE_NODE_ENV === "development";
export const isProduction = import.meta.env.VITE_NODE_ENV === "production";
export const descopeProjectId: string = import.meta.env.VITE_DESCOPE_PROJECT_ID;
export const hubSpotPortalId: string = import.meta.env.VITE_HUBSPOT_PORTAL_ID;
export const hubSpotFormId: string = import.meta.env.VITE_HUBSPOT_FORM_ID;
export const googleAnalyticsId: string = import.meta.env.GOOGLE_ANALYTICS_ID;
export const playwrightTestsAuthBearer: string = import.meta.env.TESTS_JWT_AUTH_TOKEN;
export const supportEmail: string = import.meta.env.VITE_SUPPORT_EMAIL;
export const aiChatbotUrl: string = import.meta.env.VITE_AKBOT_URL;
export const aiChatbotOrigin: string = import.meta.env.VITE_AKBOT_ORIGIN;
export const homepageURL = "/";
export const version = packageJson.version;

export const fetchProjectsMenuItemsInterval = 60000;
export const fetchSessionsInterval = 10000;
export const maxLogs = 20;
export const fileSizeUploadLimit = 50 * 1024; // 50KB
export const apiRequestTimeout = isDevelopment ? 1000 * 60 : 1000 * 10; // 1 minute in development, 10 seconds in production

export const templatesUpdateCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
export const cookieRefreshInterval = 24 * 60 * 60 * 1000; // 24 hours

export const dateTimeFormat = "YYYY-MM-DD HH:mm:ss";
export const dateTimeFormatWithMS = "YYYY-MM-DD HH:mm:ss:SSS";
export const timeFormat = "HH:mm:ss";
export const supportedProgrammingLanguages = [".py", ".star"];
export const allowedManualRunExtensions = ["python", "starlark"];
export const AKRoutes = isProduction ? Sentry.withSentryReactRouterV7Routing(Routes) : Routes;
export const sentryDsn = import.meta.env.SENTRY_DSN;
export const maxLogsPageSize = 100;
export const connectionStatusCheckInterval = 1000;
export const maxConnectionsCheckRetries = 60;

export const chatbotIframeConnectionTimeout = 10000;

export const systemCookies = {
	isLoggedIn: "ak_logged_in",
	templatesLandingName: "landing-template-name",
};
export const defaultManifestFileName = "autokitteh.yaml";
export const optionalManifestFileName = "autokitteh.yaml.user";
