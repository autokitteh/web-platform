import * as Sentry from "@sentry/react";

import { HubSpotConfig, HubSpotQueue, HubSpotConversations } from "@src/interfaces/external";
import { PushParams } from "@src/types/hooks";

declare global {
	interface Window {
		HubSpotConversations?: HubSpotConversations;
	}
}

/**
 * Initializes HubSpot tracking script with comprehensive error handling and monitoring.
 *
 * @param portalId - HubSpot portal ID for script loading
 *
 * @description
 * This function manages the entire HubSpot script loading lifecycle:
 *
 * **Key Components:**
 * - `hubSpotConfig`: Configuration object containing portal ID, script URL, timeout, and component tag
 * - `hubSpotTrackingScript`: The dynamically created script element that loads HubSpot tracking code
 * - `insertionAnchor`: Reference to first existing script in DOM, used for optimal script positioning
 * - `timeoutId`: Timer ID for script loading timeout detection
 *
 * **DOM Insertion Strategy (Priority Order):**
 * 1. **Optimal**: Insert before first existing script (ensures early loading priority)
 * 2. **Fallback**: Append to document head (no existing scripts found)
 * 3. **Extreme Fallback**: Append to document body or html element (malformed DOM)
 *
 * **Error Handling:**
 * - Script loading failures trigger graceful degradation with noop _hsq queue
 * - Network timeouts (10s) are detected and reported
 * - All errors are logged to console and reported to Sentry with context
 *
 * **Monitoring:**
 * - Success/failure states logged to console
 * - Comprehensive Sentry reporting with portal ID, error type, and context
 * - Timeout detection with configurable duration (10000ms default)
 */
export const initHubSpot = (portalId: string): void => {
	if (!portalId) {
		// eslint-disable-next-line no-console
		console.warn("HubSpot initialization skipped: missing portal ID");
		Sentry.captureMessage("HubSpot initialization skipped: missing portal ID", {
			level: "warning",
			tags: { component: "hubspot-external-script" },
		});
		return;
	}

	const hubSpotConfig: HubSpotConfig = {
		PORTAL_ID: portalId,
		SCRIPT_URL: `//js.hs-scripts.com/${portalId}.js`,
		TIMEOUT_MS: 10000,
		COMPONENT_TAG: "hubspot-external-script-loader",
	};

	const initializeHubSpotQueue = (): void => {
		window._hsq = window._hsq || [];
	};

	const reportToSentry = (type: "error" | "timeout", message: string, extra: Record<string, any> = {}): void => {
		const baseExtra = {
			portalId: hubSpotConfig.PORTAL_ID,
			component: hubSpotConfig.COMPONENT_TAG,
			...extra,
		};

		if (type === "error") {
			Sentry.captureException(new Error(message), {
				tags: { component: hubSpotConfig.COMPONENT_TAG },
				extra: baseExtra,
				level: "warning",
			});
		} else {
			Sentry.captureMessage(message, {
				tags: { component: hubSpotConfig.COMPONENT_TAG },
				extra: baseExtra,
				level: "warning",
			});
		}
	};

	const handleScriptError = (script: HTMLScriptElement): void => {
		// eslint-disable-next-line no-console
		console.warn("HubSpot script failed to load");
		reportToSentry("error", "HubSpot script loading failed", {
			scriptSrc: script.src,
			errorType: "script_load_error",
		});

		initializeHubSpotQueue();
		const noop = (...items: PushParams[]): number => items.length;
		if (!window._hsq.push) {
			window._hsq.push = noop;
		}
	};

	const handleScriptTimeout = (): void => {
		if (window.HubSpotConversations || (window._hsq as HubSpotQueue).loaded) return;

		// eslint-disable-next-line no-console
		console.warn(`HubSpot script loading timeout after ${hubSpotConfig.TIMEOUT_MS}ms`);
		reportToSentry("timeout", "HubSpot script loading timeout", {
			timeout: hubSpotConfig.TIMEOUT_MS,
		});
	};

	const handleScriptLoad = (timeoutId: number): void => {
		clearTimeout(timeoutId);
		// eslint-disable-next-line no-console
		console.debug("HubSpot script loaded successfully");
		Sentry.captureMessage("HubSpot script loaded successfully", {
			level: "info",
			tags: { component: hubSpotConfig.COMPONENT_TAG },
			extra: { portalId: hubSpotConfig.PORTAL_ID },
		});
	};

	const createHubSpotScript = (): HTMLScriptElement => {
		const hubSpotTrackingScript = document.createElement("script");
		hubSpotTrackingScript.type = "text/javascript";
		hubSpotTrackingScript.id = "hs-script-loader";
		hubSpotTrackingScript.async = true;
		hubSpotTrackingScript.defer = true;
		hubSpotTrackingScript.src = hubSpotConfig.SCRIPT_URL;
		return hubSpotTrackingScript;
	};

	const insertScriptToDOM = (hubSpotScript: HTMLScriptElement): void => {
		const insertionAnchor = document.getElementsByTagName("script")[0];

		if (insertionAnchor?.parentNode) {
			insertionAnchor.parentNode.insertBefore(hubSpotScript, insertionAnchor);
		} else {
			const head = document.head || document.getElementsByTagName("head")[0];
			if (head) {
				head.appendChild(hubSpotScript);
			} else {
				document.body?.appendChild(hubSpotScript) || document.documentElement.appendChild(hubSpotScript);
			}
		}
	};

	const loadHubSpotScript = (): void => {
		initializeHubSpotQueue();

		const hubSpotTrackingScript = createHubSpotScript();

		const timeoutId = window.setTimeout(() => {
			handleScriptTimeout();
		}, hubSpotConfig.TIMEOUT_MS);

		hubSpotTrackingScript.onerror = () => handleScriptError(hubSpotTrackingScript);
		hubSpotTrackingScript.onload = () => handleScriptLoad(timeoutId);

		insertScriptToDOM(hubSpotTrackingScript);
	};

	loadHubSpotScript();
};
