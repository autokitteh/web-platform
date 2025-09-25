import type { Site } from "@datadog/browser-core";
import type { PropagatorType } from "@datadog/browser-rum";

import { isProduction } from "@constants/global.constants";
import { VersionService } from "@src/services/version.service";

export const applicationId: string = import.meta.env.VITE_DATADOG_APPLICATION_ID;
export const clientToken: string = import.meta.env.VITE_DATADOG_CLIENT_TOKEN;
export const site: Site = (import.meta.env.VITE_DATADOG_SITE || "localhost") as Site;
export const datadogVersion: string = VersionService.getCurrentVersion();
export const service = "autokitteh-web-platform";

export const sessionSampleRate = isProduction ? 10 : 100;
export const sessionReplaySampleRate = isProduction ? 5 : 100;

export const allowedTracingUrls = [
	{ match: /^https?:\/\/localhost:\d+\//, propagatorTypes: ["datadog" as PropagatorType] },
	{ match: /^https?:\/\/.*\.autokitteh\.com\//, propagatorTypes: ["datadog" as PropagatorType] },
];

export const defaultPrivacyLevel = "mask-user-input" as const;
