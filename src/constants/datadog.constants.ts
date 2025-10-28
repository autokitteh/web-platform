import type { Site } from "@datadog/browser-core";
import type { MatchOption, TracingOption } from "@datadog/browser-rum";

import { isProduction } from "@constants/global.constants";
import { VersionService } from "@src/services/version.service";

const applicationId: string = import.meta.env.VITE_DATADOG_APPLICATION_ID;
const clientToken: string = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;
const site: Site = (import.meta.env.VITE_DATADOG_SITE || "localhost") as Site;
const datadogVersion: string = VersionService.getCurrentVersion();
const service = import.meta.env.VITE_DATADOG_SERVICE;
const env = import.meta.env.VITE_DATADOG_ENV;

const sessionSampleRate = isProduction ? 100 : 100;
const sessionReplaySampleRate = isProduction ? 100 : 100;

const allowedTracingUrls = [
	{ match: "https://staging.autokitteh.cloud", propagatorTypes: ["tracecontext", "datadog"] },
	{ match: "https://staging-api.autokitteh.cloud", propagatorTypes: ["tracecontext", "datadog"] },
	{ match: "https://app.autokitteh.cloud", propagatorTypes: ["tracecontext", "datadog"] },
	{ match: "https://api.autokitteh.cloud", propagatorTypes: ["tracecontext", "datadog"] },
	{ match: "http://localhost:9980", propagatorTypes: ["tracecontext", "datadog"] },
	{ match: "http://localhost:3000", propagatorTypes: ["tracecontext", "datadog"] },
	{ match: "http://localhost:8000", propagatorTypes: ["tracecontext", "datadog"] },
] as Array<MatchOption | TracingOption>;

const defaultPrivacyLevel = "allow" as const;

export const datadogConstants = {
	applicationId,
	clientToken,
	site,
	version: datadogVersion,
	service,
	sessionSampleRate,
	sessionReplaySampleRate,
	allowedTracingUrls,
	defaultPrivacyLevel,
	env,
} as const;

export const ddConfigured = !!(applicationId && clientToken && datadogVersion);
