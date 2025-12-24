/* eslint-disable @typescript-eslint/no-unused-vars */
// inspired by: https://github.com/kelvinmaues/react-hubspot-tracking-code-hook

import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import z from "zod";

import { isProduction, hubSpotFormId, hubSpotPortalId, namespaces, systemCookies } from "@constants";
import { LoggerService } from "@services/logger.service";
import { PropsUseSetTrackEvent, UseTrackingCode } from "@src/types/hooks";
import { DatadogUtils } from "@utilities/datadog.utils";

export const useHubspot = (): UseTrackingCode => {
	const _hsq = typeof window !== "undefined" && window._hsq ? window._hsq : [];
	const { t } = useTranslation("login");

	const setContentType = (contentType: string): void => {
		try {
			if (!contentType || contentType.trim() === "") {
				return;
			}
			_hsq.push(["setContentType", contentType]);
		} catch (error) {
			//ignore
		}
	};

	const setTrackPageView = () => {
		try {
			_hsq.push(["trackPageView"]);
		} catch (error) {
			// ignore
		}
	};

	const setPathPageView = (path: string): void => {
		try {
			if (!path || path.trim() === "") {
				return;
			}
			_hsq.push(["setPath", path]);
			setTrackPageView();
		} catch (error) {
			//ignore
		}
	};

	const setIdentity = (email: string, customPropertities?: object) => {
		try {
			if (!email || email.trim() === "") {
				return;
			}

			const emailTest = z.string().email();
			if (!emailTest.safeParse(email).success) {
				LoggerService.warn(
					namespaces.ui.loginPage,
					`HubSpot setIdentity failed: invalid email format. Email: ${email}`
				);
				return;
			}

			_hsq.push([
				"identify",
				{
					email,
					...customPropertities,
				},
			]);
		} catch (error) {
			LoggerService.error(
				namespaces.ui.loginPage,
				`HubSpot setIdentity error: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	};

	const setTrackEvent = ({ eventId, value }: PropsUseSetTrackEvent) => {
		try {
			if (!eventId || eventId.trim() === "") {
				LoggerService.warn(namespaces.ui.loginPage, "HubSpot setTrackEvent failed: empty eventId");
				return;
			}

			_hsq.push([
				"trackEvent",
				{
					id: eventId,
					value,
				},
			]);
		} catch (error) {
			LoggerService.error(
				namespaces.ui.loginPage,
				`HubSpot setTrackEvent error: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	};

	const revokeCookieConsent = () => {
		try {
			_hsq.push(["revokeCookieConsent"]);
		} catch (error) {
			LoggerService.error(
				namespaces.ui.loginPage,
				`HubSpot revokeCookieConsent error: ${error instanceof Error ? error.message : String(error)}`
			);
		}
	};

	const trackUserLogin = async (user?: { email?: string; name?: string }): Promise<void> => {
		try {
			if (!isProduction) {
				LoggerService.debug(namespaces.ui.loginPage, t("hubspot.skippingNotProduction"));
				return;
			}

			if (!user) {
				const message = t("hubspot.missingUser");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				return;
			}

			if (!user?.email) {
				const message = t("hubspot.missingUserEmail");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				return;
			}

			const emailTest = z.string().email();
			if (!emailTest.safeParse(user.email || "").success) {
				const errorMessage = t("hubspot.invalidEmailFormatWithEmail", { email: user.email });
				LoggerService.error(namespaces.ui.loginPage, errorMessage, true);
				return;
			}

			try {
				setIdentity(user.email || "", user.name ? { firstname: user.name } : undefined);
				LoggerService.info(namespaces.ui.loginPage, `User identity set in HubSpot: ${user.email}`);
			} catch (error) {
				LoggerService.warn(
					namespaces.ui.loginPage,
					`HubSpot setIdentity failed (trackUserLogin): ${error instanceof Error ? error.message : String(error)}`
				);
			}

			try {
				setTrackEvent({
					eventId: "user_login",
					value: user.email,
				});
				LoggerService.info(namespaces.ui.loginPage, `Login event tracked for: ${user.email}`);
			} catch (error) {
				LoggerService.warn(
					namespaces.ui.loginPage,
					`HubSpot setTrackEvent failed (trackUserLogin): ${error instanceof Error ? error.message : String(error)}`
				);
			}

			if (!hubSpotPortalId || !hubSpotFormId) {
				const message = t("hubspot.missingFormOrPortalId");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				return;
			}

			const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubSpotPortalId}/${hubSpotFormId}`;
			const hubspotUtk = Cookies.get(systemCookies.hubSpot);
			const pageUri = window.location.href;
			const pageName = document.title;

			if (!hubspotUtk || hubspotUtk.trim() === "") {
				const message = t("hubspot.missingRequiredHubspotUtkCookie");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				return;
			}

			if (!pageUri || !pageName) {
				const missingValues = [];
				if (!pageUri) missingValues.push("pageUri");
				if (!pageName) missingValues.push("pageName");

				const message = t("hubspot.missingRequiredValues", { values: missingValues.join(", ") });
				LoggerService.warn(namespaces.ui.loginPage, message, true);
			}

			if (!user.name || user.name.trim() === "") {
				const message = t("hubspot.userNameEmpty");
				LoggerService.warn(namespaces.ui.loginPage, message, true);
			}

			const hsContext = {
				hutk: hubspotUtk,
				pageUri: pageUri,
				pageName: pageName,
			};

			const hsData = [
				{ name: "email", value: user.email },
				{ name: "firstname", value: user.name },
			];

			const submissionData = {
				submittedAt: Date.now(),
				fields: hsData,
				context: hsContext,
			};

			LoggerService.info(namespaces.ui.loginPage, `Starting HubSpot form submission for ${user.email}`);

			try {
				const res = await fetch(hsUrl, {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify(submissionData),
					signal: AbortSignal.timeout(8000),
				});

				LoggerService.debug(
					namespaces.ui.loginPage,
					t("hubspot.fetchResponseReceived", {
						status: res.status,
						statusText: res.statusText,
						ok: res.ok,
					})
				);

				if (!res.ok) {
					const text = await res.text().catch(() => "");
					const errorMessage = t("hubspot.submissionFailed", {
						status: res.status,
						statusText: res.statusText,
						text: text ? " - " + text : "",
					});

					LoggerService.error(namespaces.ui.loginPage, errorMessage, true);
					return;
				}

				const successMessage = t("hubspot.submissionSucceeded");
				LoggerService.info(namespaces.ui.loginPage, successMessage);
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
			}
		} catch (error: any) {
			LoggerService.error(namespaces.ui.loginPage, error, true);
		}
	};

	return {
		setContentType,
		setPathPageView,
		setTrackPageView,
		setIdentity,
		setTrackEvent,
		revokeCookieConsent,
		trackUserLogin,
	};
};
