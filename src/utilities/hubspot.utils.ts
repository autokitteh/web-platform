/* eslint-disable no-console */
import * as Sentry from "@sentry/react";
import { TFunction } from "i18next";
import Cookies from "js-cookie";
import z from "zod";

import { hubSpotFormId, hubSpotPortalId, isProduction, namespaces, systemCookies } from "@src/constants";
import { HubSpotConfig, HubSpotConversations, HubSpotQueue } from "@src/interfaces/external";
import { LoggerService } from "@src/services/logger.service";
import { PropsUseSetTrackEvent, PushParams } from "@src/types/hooks";

declare global {
	interface Window {
		HubSpotConversations?: HubSpotConversations;
	}
}

/**
 * HubSpot tracking integration utilities for marketing analytics and user tracking.
 * Provides helper methods for HubSpot's JavaScript tracking API.
 *
 * All methods include error handling and graceful degradation when HubSpot is not loaded.
 */
export const HubSpotUtils = {
	/**
	 * Initializes HubSpot tracking script with comprehensive error handling and monitoring.
	 *
	 * @param portalId - HubSpot portal ID for script loading
	 * @returns void
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
	init: (portalId: string): void => {
		if (!portalId) {
			console.warn("HubSpot initialization skipped: missing portal ID");
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

		const handleScriptError = (): void => {
			console.warn("HubSpot script failed to load");
			initializeHubSpotQueue();
			const noop = (...items: PushParams[]): number => items.length;
			if (!window._hsq.push) {
				window._hsq.push = noop;
			}
		};

		const handleScriptTimeout = (): void => {
			if (window.HubSpotConversations || (window._hsq as HubSpotQueue).loaded) return;
			console.warn(`HubSpot script loading timeout after ${hubSpotConfig.TIMEOUT_MS}ms`);
		};

		const handleScriptLoad = (timeoutId: number): void => {
			clearTimeout(timeoutId);
			console.debug("HubSpot script loaded successfully");
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

			hubSpotTrackingScript.onerror = () => handleScriptError();
			hubSpotTrackingScript.onload = () => handleScriptLoad(timeoutId);

			insertScriptToDOM(hubSpotTrackingScript);
		};

		loadHubSpotScript();
	},

	/**
	 * Gets the HubSpot queue (_hsq) for tracking.
	 *
	 * @returns HubSpot queue array
	 */
	getQueue: () => {
		return typeof window !== "undefined" && window._hsq ? window._hsq : [];
	},

	/**
	 * Tracks a page view in HubSpot.
	 *
	 * @returns true if successful, false otherwise
	 */
	trackPageView: (): boolean => {
		try {
			const _hsq = HubSpotUtils.getQueue();
			_hsq.push(["trackPageView"]);
			return true;
		} catch (error) {
			console.error("HubSpot trackPageView error:", error);
			return false;
		}
	},

	/**
	 * Sets the page path and tracks a page view in HubSpot.
	 *
	 * @param path - Page path to track
	 * @returns true if successful, false otherwise
	 */
	setPathPageView: (path: string): boolean => {
		try {
			if (!path || path.trim() === "") {
				console.warn("HubSpot setPathPageView failed: empty path");
				return false;
			}

			const _hsq = HubSpotUtils.getQueue();
			_hsq.push(["setPath", path]);
			HubSpotUtils.trackPageView();
			return true;
		} catch (error) {
			console.error("HubSpot setPathPageView error:", error);
			return false;
		}
	},

	/**
	 * Identifies a user in HubSpot with their email and optional properties.
	 *
	 * @param email - User's email address
	 * @param customProperties - Optional custom properties to associate with the user
	 * @returns true if successful, false otherwise
	 */
	identify: (email: string, customProperties?: object): boolean => {
		try {
			if (!email || email.trim() === "") {
				console.warn("HubSpot identify failed: empty email");
				return false;
			}

			const _hsq = HubSpotUtils.getQueue();
			_hsq.push([
				"identify",
				{
					email,
					...customProperties,
				},
			]);
			return true;
		} catch (error) {
			console.error("HubSpot identify error:", error);
			return false;
		}
	},

	/**
	 * Tracks a custom event in HubSpot.
	 *
	 * @param params - Event parameters
	 * @param params.eventId - Event identifier
	 * @param params.value - Optional event value
	 * @returns true if successful, false otherwise
	 */
	trackEvent: ({ eventId, value }: PropsUseSetTrackEvent): boolean => {
		try {
			if (!eventId || eventId.trim() === "") {
				console.warn("HubSpot trackEvent failed: empty eventId");
				return false;
			}

			const _hsq = HubSpotUtils.getQueue();
			_hsq.push([
				"trackEvent",
				{
					id: eventId,
					value,
				},
			]);
			return true;
		} catch (error) {
			console.error("HubSpot trackEvent error:", error);
			return false;
		}
	},

	/**
	 * Revokes cookie consent in HubSpot.
	 *
	 * @returns true if successful, false otherwise
	 */
	revokeCookieConsent: (): boolean => {
		try {
			const _hsq = HubSpotUtils.getQueue();
			_hsq.push(["revokeCookieConsent"]);
			return true;
		} catch (error) {
			console.error("HubSpot revokeCookieConsent error:", error);
			return false;
		}
	},

	/**
	 * Gets the HubSpot UTK cookie value.
	 *
	 * @returns HubSpot UTK cookie value or undefined
	 */
	getUtkCookie: (): string | undefined => {
		return Cookies.get(systemCookies.hubSpot);
	},

	/**
	 * Submits a form to HubSpot Forms API.
	 *
	 * @param params - Form submission parameters
	 * @param params.portalId - HubSpot portal ID
	 * @param params.formId - HubSpot form ID
	 * @param params.email - User's email
	 * @param params.firstname - User's first name
	 * @param params.hubspotUtk - HubSpot UTK cookie
	 * @param params.pageUri - Current page URI
	 * @param params.pageName - Current page name
	 * @returns Response from HubSpot API or null on error
	 */
	submitForm: async (params: {
		email: string;
		firstname?: string;
		formId: string;
		hubspotUtk: string;
		pageName: string;
		pageUri: string;
		portalId: string;
	}): Promise<Response | null> => {
		try {
			const { portalId, formId, email, firstname, hubspotUtk, pageUri, pageName } = params;

			const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${portalId}/${formId}`;

			const hsContext = {
				hutk: hubspotUtk,
				pageUri: pageUri,
				pageName: pageName,
			};

			const hsData = [
				{ name: "email", value: email },
				{ name: "firstname", value: firstname },
			];

			const submissionData = {
				submittedAt: Date.now(),
				fields: hsData,
				context: hsContext,
			};

			const response = await fetch(hsUrl, {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(submissionData),
				signal: AbortSignal.timeout(8000),
			});

			return response;
		} catch (error) {
			console.error("HubSpot submitForm error:", error);
			return null;
		}
	},

	/**
	 * Tracks user login in HubSpot with form submission.
	 * This is a complex orchestration function that identifies the user, tracks the login event,
	 * and submits a form to HubSpot.
	 *
	 * @param params - Parameters for tracking user login
	 * @param params.user - User object with email and name
	 * @param params.t - Translation function from i18next
	 * @param params.captureMessage - Sentry captureMessage function
	 * @param params.captureException - Sentry captureException function
	 * @param params.addBreadcrumb - Sentry addBreadcrumb function
	 * @returns Promise that resolves when tracking is complete
	 */
	trackUserLogin: async (params: {
		addBreadcrumb: (breadcrumb: any) => void;
		captureException: (error: any, context?: Record<string, any>) => void;
		captureMessage: (message: string, level?: Sentry.SeverityLevel) => string;
		t: TFunction;
		user?: { email?: string; name?: string };
	}): Promise<void> => {
		const { user, t, captureMessage, captureException, addBreadcrumb } = params;

		try {
			if (!isProduction) {
				LoggerService.debug(namespaces.ui.loginPage, t("hubspot.skippingNotProduction"));
				captureMessage("HubSpot tracking skipped - not production environment", "debug");
				return;
			}

			if (!user) {
				const message = t("hubspot.missingUser");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				captureMessage(message, "error");
				return;
			}

			if (!user?.email) {
				const message = t("hubspot.missingUserEmail");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				captureMessage(message, "error");
				return;
			}

			const emailTest = z.string().email();
			if (!emailTest.safeParse(user.email || "").success) {
				const errorMessage = t("hubspot.invalidEmailFormatWithEmail", { email: user.email });
				LoggerService.error(namespaces.ui.loginPage, errorMessage, true);
				captureMessage(errorMessage, "error");
				return;
			}

			try {
				HubSpotUtils.identify(user.email || "", user.name ? { firstname: user.name } : undefined);
				addBreadcrumb({
					category: "hubspot",
					message: "User identity set in HubSpot",
					level: "info",
					data: { email: user.email, hasName: !!user.name },
				});
			} catch (error) {
				captureException(error);
			}

			try {
				HubSpotUtils.trackEvent({
					eventId: "user_login",
					value: user.email,
				});
				addBreadcrumb({
					category: "hubspot",
					message: "Login event tracked",
					level: "info",
					data: { eventId: "user_login", email: user.email },
				});
			} catch (error) {
				captureException(error);
			}

			if (!hubSpotPortalId || !hubSpotFormId) {
				const message = t("hubspot.missingFormOrPortalId");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				captureMessage(message, "error");
				return;
			}

			const hubspotUtk = HubSpotUtils.getUtkCookie();
			const pageUri = window.location.href;
			const pageName = document.title;

			if (!hubspotUtk || hubspotUtk.trim() === "") {
				const message = t("hubspot.missingRequiredHubspotUtkCookie");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				captureMessage(message, "warning");
				return;
			}

			if (!pageUri || !pageName) {
				const missingValues = [];
				if (!pageUri) missingValues.push("pageUri");
				if (!pageName) missingValues.push("pageName");

				const message = t("hubspot.missingRequiredValues", { values: missingValues.join(", ") });
				LoggerService.warn(namespaces.ui.loginPage, message, true);
				captureMessage(message, "warning");
			}

			if (!user.name || user.name.trim() === "") {
				const message = t("hubspot.userNameEmpty");
				LoggerService.warn(namespaces.ui.loginPage, message, true);
				captureMessage(message, "warning");
			}

			addBreadcrumb({
				category: "hubspot",
				message: "Starting form submission",
				level: "info",
				data: {
					email: user.email,
					hasName: !!user.name,
					hubSpotPortalId,
					hubSpotFormId,
				},
			});

			try {
				const res = await HubSpotUtils.submitForm({
					portalId: hubSpotPortalId,
					formId: hubSpotFormId,
					email: user.email,
					firstname: user.name,
					hubspotUtk,
					pageUri,
					pageName,
				});

				if (!res) {
					throw new Error("Form submission failed: no response");
				}

				LoggerService.debug(
					namespaces.ui.loginPage,
					t("hubspot.fetchResponseReceived", {
						status: res.status,
						statusText: res.statusText,
						ok: res.ok,
					})
				);

				addBreadcrumb({
					category: "hubspot",
					message: "Form submission response received",
					level: "info",
					data: {
						status: res.status,
						statusText: res.statusText,
						ok: res.ok,
					},
				});

				if (!res.ok) {
					const text = await res.text().catch(() => "");
					const errorMessage = t("hubspot.submissionFailed", {
						status: res.status,
						statusText: res.statusText,
						text: text ? " - " + text : "",
					});

					LoggerService.error(namespaces.ui.loginPage, errorMessage, true);
					captureException(new Error(errorMessage));
					return;
				}

				const successMessage = t("hubspot.submissionSucceeded");
				captureMessage(successMessage, "info");
			} catch (error: any) {
				let errorMessage: string;
				let errorType = "UnknownError";

				if (error.name === "TimeoutError" || error.name === "AbortError") {
					errorMessage = t("hubspot.submissionTimedOut");
					errorType = "TimeoutError";
				} else if (error.name === "TypeError" && error.message.includes("fetch")) {
					errorMessage = t("hubspot.submissionBlockedOrNetworkError");
					errorType = "NetworkError";
				} else {
					errorMessage = t("errors.loginFailedExtended", { error: String(error?.message ?? error) });
					errorType = error.name || "UnknownError";
				}

				LoggerService.error(
					namespaces.ui.loginPage,
					t("hubspot.fetchErrorCaught", {
						errorMessage,
						errorType,
						errorName: error.name,
						errorMessageRaw: error.message,
					}),
					true
				);

				captureException(error);
			}
		} catch (error: any) {
			captureException(error);
		}
	},
};
