import React from "react";

import { t } from "i18next";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import ReactDOM from "react-dom/client";

import { datadogConstants, ddConfigured, namespaces } from "@constants";
import { LoggerService } from "@services";
import { MainApp } from "@src/mainApp";
import { CorrelationIdUtils, DatadogUtils } from "@src/utilities";
import "./assets/index.css";
import "./i18n";

TimeAgo.addDefaultLocale(en);

const akCorrelationId = CorrelationIdUtils.generate();

const initializeDatadog = () => {
	const urlParams = new URLSearchParams(window.location.search);
	const hasE2eParam = urlParams.get("e2e") === "true";
	const userAgent = navigator.userAgent.toLowerCase();
	const hasHeadless = userAgent.includes("headless");
	const storedE2eFlag = localStorage.getItem("e2e") === "true";
	const isE2eTest = hasE2eParam || hasHeadless || storedE2eFlag;

	if (hasE2eParam && !storedE2eFlag) {
		localStorage.setItem("e2e", "true");
	}

	if (isE2eTest) {
		return;
	}

	if (!ddConfigured) {
		LoggerService.warn(
			namespaces.datadog,
			t("datadog.notConfiguredSkipping", {
				ns: "utilities",
			}),
			true
		);
		return;
	}

	const isAlreadyInitialized = DatadogUtils.isInitialized();
	if (isAlreadyInitialized) {
		return;
	}

	const initResult = DatadogUtils.init(datadogConstants);

	if (initResult) {
		DatadogUtils.setCorrelationId(akCorrelationId);
	}
};

// Initialize Datadog before React
initializeDatadog();

ReactDOM.createRoot(document.getElementById("root")!).render(<MainApp />);
