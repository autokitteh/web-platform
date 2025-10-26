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
	const isE2eTest = hasE2eParam || hasHeadless;

	if (isE2eTest) {
		// eslint-disable-next-line no-console
		console.warn("[Datadog] ⛔ E2E test detected - skipping initialization");
		return;
	}

	if (!ddConfigured) {
		// eslint-disable-next-line no-console
		console.warn("[Datadog] NOT configured - skipping initialization");
		return;
	}

	// Check if already initialized
	if (window.DD_RUM) {
		// eslint-disable-next-line no-console
		console.log("[Datadog] ✅ Already initialized");
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
