import React from "react";

import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en";
import ReactDOM from "react-dom/client";

import { datadogConstants, ddConfigured } from "@constants";
import { MainApp } from "@src/mainApp";
import { DatadogUtils } from "@src/utilities";

import "./assets/index.css";
import "./i18n";

TimeAgo.addDefaultLocale(en);

// Initialize Datadog RUM before React renders
const initializeDatadog = () => {
	// eslint-disable-next-line no-console
	console.log("[Datadog] 🚀 Initializing Datadog RUM from main.tsx");

	// Check for E2E test environment
	const urlParams = new URLSearchParams(window.location.search);
	const hasE2eParam = urlParams.get("e2e") === "true";
	const userAgent = navigator.userAgent.toLowerCase();
	const hasHeadless = userAgent.includes("headless");
	const storedE2eFlag = localStorage.getItem("e2e") === "true";
	const isE2eTest = hasE2eParam || hasHeadless || storedE2eFlag;

	if (hasE2eParam && !storedE2eFlag) {
		localStorage.setItem("e2e", "true");
		// eslint-disable-next-line no-console
		console.log("[Datadog] 💾 E2E flag stored in localStorage");
	}

	if (isE2eTest) {
		// eslint-disable-next-line no-console
		console.warn("[Datadog] ⛔ E2E test detected - skipping initialization");
		return;
	}

	if (!ddConfigured) {
		// eslint-disable-next-line no-console
		console.warn("[Datadog] NOT configured - skipping initialization", {
			hasApplicationId: !!datadogConstants.applicationId,
			hasClientToken: !!datadogConstants.clientToken,
			hasVersion: !!datadogConstants.version,
			site: datadogConstants.site,
			service: datadogConstants.service,
			env: datadogConstants.env,
		});
		return;
	}

	// Check if already properly initialized using our utility method
	const isAlreadyInitialized = DatadogUtils.isInitialized();
	if (isAlreadyInitialized) {
		// eslint-disable-next-line no-console
		console.log("[Datadog] ✅ Already properly initialized");
		return;
	}

	// Initialize from React
	// eslint-disable-next-line no-console
	console.log("[Datadog] Config:", datadogConstants);
	const initResult = DatadogUtils.init(datadogConstants);
	// eslint-disable-next-line no-console
	console.log("[Datadog] Initialization result:", initResult);
};

// Initialize Datadog before React
initializeDatadog();

ReactDOM.createRoot(document.getElementById("root")!).render(<MainApp />);
