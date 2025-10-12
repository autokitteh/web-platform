import type { MatchOption, Site } from "@datadog/browser-core";
import type { PropagatorType, TracingOption } from "@datadog/browser-rum";

import { isProduction } from "@constants/global.constants";
import { VersionService } from "@src/services/version.service";

const applicationId: string = import.meta.env.VITE_DATADOG_APPLICATION_ID;
const clientToken: string = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;
const site: Site = (import.meta.env.VITE_DATADOG_SITE || "localhost") as Site;
const datadogVersion: string = VersionService.getCurrentVersion();
const service = "autokitteh-web-platform";

const sessionSampleRate = isProduction ? 10 : 100;
const sessionReplaySampleRate = isProduction ? 5 : 100;

const allowedTracingUrls = [
	{ match: /^https?:\/\/localhost:\d+\//, propagatorTypes: ["datadog" as PropagatorType] },
	{ match: /^https?:\/\/[^/]*\.autokitteh\.com\//, propagatorTypes: ["datadog" as PropagatorType] },
] as Array<MatchOption | TracingOption> | undefined;

const defaultPrivacyLevel = "mask-user-input" as const;

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
} as const;

export const ddConfigured = applicationId && clientToken && datadogVersion && isProduction;
