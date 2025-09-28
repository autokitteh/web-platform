import React from "react";

import { datadogRum } from "@datadog/browser-rum";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import ReactDOM from "react-dom/client";

import { appMode } from "@constants";
import {
	applicationId,
	clientToken,
	site,
	datadogVersion,
	service,
	sessionSampleRate,
	sessionReplaySampleRate,
	allowedTracingUrls,
	defaultPrivacyLevel,
} from "@constants/datadog.constants";
import { MainApp } from "@src/mainApp";

import "./assets/index.css";
import "./i18n";

TimeAgo.addDefaultLocale(en);

if (!applicationId || !clientToken || !datadogVersion) {
	datadogRum.init({
		applicationId,
		clientToken,
		site,
		service,
		env: appMode || "development",
		version: datadogVersion,
		sessionSampleRate,
		sessionReplaySampleRate,
		trackResources: true,
		trackLongTasks: true,
		trackUserInteractions: true,
		enablePrivacyForActionName: true,
		allowedTracingUrls,
		defaultPrivacyLevel,
	});
}

ReactDOM.createRoot(document.getElementById("root")!).render(<MainApp />);
