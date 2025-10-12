import React from "react";

import { datadogRum, MatchOption, TracingOption } from "@datadog/browser-rum";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import ReactDOM from "react-dom/client";

import {
	appMode,
	ddVersion,
	ddClientToken,
	ddApplicationId,
	ddService,
	ddSessionReplaySampleRate,
	ddSessionSampleRate,
	ddSite,
	ddAllowedTracingUrls,
	ddDefaultPrivacyLevel,
} from "@constants";
import { MainApp } from "@src/mainApp";

import "./assets/index.css";
import "./i18n";

TimeAgo.addDefaultLocale(en);

if (ddApplicationId && ddClientToken && ddVersion) {
	datadogRum.init({
		applicationId: ddApplicationId,
		clientToken: ddClientToken,
		site: ddSite,
		service: ddService,
		env: appMode || "development",
		version: ddVersion,
		sessionSampleRate: ddSessionSampleRate,
		sessionReplaySampleRate: ddSessionReplaySampleRate,
		trackResources: true,
		trackLongTasks: true,
		trackUserInteractions: true,
		enablePrivacyForActionName: true,
		allowedTracingUrls: ddAllowedTracingUrls as Array<MatchOption | TracingOption> | undefined,
		defaultPrivacyLevel: ddDefaultPrivacyLevel,
	});
}

ReactDOM.createRoot(document.getElementById("root")!).render(<MainApp />);
