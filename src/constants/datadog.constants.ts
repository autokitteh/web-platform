import type { MatchOption, Site } from "@datadog/browser-core";
import type { PropagatorType, TracingOption } from "@datadog/browser-rum";

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
	{ match: /^https?:\/\/localhost:\d+\//, propagatorTypes: ["datadog" as PropagatorType] },
	{ match: /^https?:\/\/[^/]*\.autokitteh\.cloud\//, propagatorTypes: ["datadog" as PropagatorType] },
] as Array<MatchOption | TracingOption> | undefined;

const defaultPrivacyLevel = "mask-user-input" as const;

// Debug logging to diagnose Datadog configuration issues
// eslint-disable-next-line no-console
console.log("[Datadog Config Debug]", {
	applicationId: applicationId ? `${applicationId.slice(0, 8)}...` : "MISSING",
	clientToken: clientToken ? `${clientToken.slice(0, 8)}...` : "MISSING",
	datadogVersion,
	service,
	env,
	site,
	isProduction,
	ddConfigured: !!(applicationId && clientToken && datadogVersion),
});

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
