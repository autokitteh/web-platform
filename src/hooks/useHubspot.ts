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
				DatadogUtils.captureWarning("HubSpot setContentType failed: empty contentType", {
					component: "hubspot-tracking",
				});
				return;
			}
			_hsq.push(["setContentType", contentType]);
		} catch (error) {
			DatadogUtils.captureException(error, {
				component: "hubspot-tracking",
			});
		}
	};

	const setTrackPageView = () => {
		try {
			_hsq.push(["trackPageView"]);
		} catch (error) {
			DatadogUtils.captureException(error, {
				component: "hubspot-tracking",
			});
		}
	};

	const setPathPageView = (path: string): void => {
		try {
			if (!path || path.trim() === "") {
				DatadogUtils.captureWarning("HubSpot setPathPageView failed: empty path", {
					component: "hubspot-tracking",
				});
				return;
			}
			_hsq.push(["setPath", path]);
			setTrackPageView();
		} catch (error) {
			DatadogUtils.captureException(error, {
				component: "hubspot-tracking",
			});
		}
	};

	const setIdentity = (email: string, customPropertities?: object) => {
		try {
			if (!email || email.trim() === "") {
				DatadogUtils.captureWarning("HubSpot setIdentity failed: empty email", {
					component: "hubspot-tracking",
				});
				return;
			}

			const emailTest = z.string().email();
			if (!emailTest.safeParse(email).success) {
				DatadogUtils.captureWarning("HubSpot setIdentity failed: invalid email format", {
					component: "hubspot-tracking",
				});
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
			DatadogUtils.captureException(error, {
				component: "hubspot-tracking",
			});
		}
	};

	const setTrackEvent = ({ eventId, value }: PropsUseSetTrackEvent) => {
		try {
			if (!eventId || eventId.trim() === "") {
				DatadogUtils.captureWarning("HubSpot setTrackEvent failed: empty eventId", {
					component: "hubspot-tracking",
				});
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
			DatadogUtils.captureException(error, {
				component: "hubspot-tracking",
			});
		}
	};

	const revokeCookieConsent = () => {
		try {
			_hsq.push(["revokeCookieConsent"]);
		} catch (error) {
			DatadogUtils.captureException(error, {
				component: "hubspot-tracking",
			});
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
				DatadogUtils.captureException(new Error(message), {
					error_type: "missing_user",
				});
				return;
			}

			if (!user?.email) {
				const message = t("hubspot.missingUserEmail");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				DatadogUtils.captureException(new Error(message), {
					error_type: "missing_email",
				});
				return;
			}

			const emailTest = z.string().email();
			if (!emailTest.safeParse(user.email || "").success) {
				const errorMessage = t("hubspot.invalidEmailFormatWithEmail", { email: user.email });
				LoggerService.error(namespaces.ui.loginPage, errorMessage, true);
				DatadogUtils.captureException(new Error(errorMessage), {
					error_type: "invalid_email",
				});
				return;
			}

			try {
				setIdentity(user.email || "", user.name ? { firstname: user.name } : undefined);
				DatadogUtils.trackEvent("hubspot-identity-set", {
					email: user.email,
					hasName: !!user.name,
				});
			} catch (error) {
				DatadogUtils.captureException(error, {
					operation: "setIdentity",
				});
			}

			try {
				setTrackEvent({
					eventId: "user_login",
					value: user.email,
				});
				DatadogUtils.trackEvent("hubspot-login-tracked", {
					eventId: "user_login",
					email: user.email,
				});
			} catch (error) {
				DatadogUtils.captureException(error, {
					operation: "trackEvent",
				});
			}

			if (!hubSpotPortalId || !hubSpotFormId) {
				const message = t("hubspot.missingFormOrPortalId");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				DatadogUtils.captureException(new Error(message), {
					error_type: "missing_config",
				});
				return;
			}

			const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubSpotPortalId}/${hubSpotFormId}`;
			const hubspotUtk = Cookies.get(systemCookies.hubSpot);
			const pageUri = window.location.href;
			const pageName = document.title;

			if (!hubspotUtk || hubspotUtk.trim() === "") {
				const message = t("hubspot.missingRequiredHubspotUtkCookie");
				LoggerService.error(namespaces.ui.loginPage, message, true);
				DatadogUtils.captureWarning(message, {
					error_type: "missing_cookie",
				});
				return;
			}

			if (!pageUri || !pageName) {
				const missingValues = [];
				if (!pageUri) missingValues.push("pageUri");
				if (!pageName) missingValues.push("pageName");

				const message = t("hubspot.missingRequiredValues", { values: missingValues.join(", ") });
				LoggerService.warn(namespaces.ui.loginPage, message, true);
				DatadogUtils.captureWarning(message, {
					error_type: "missing_page_data",
					missingValues,
				});
			}

			if (!user.name || user.name.trim() === "") {
				const message = t("hubspot.userNameEmpty");
				LoggerService.warn(namespaces.ui.loginPage, message, true);
				DatadogUtils.captureWarning(message, {
					error_type: "missing_name",
				});
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

			DatadogUtils.trackEvent("hubspot-form-submission-start", {
				email: user.email,
				hasName: !!user.name,
			});

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

				DatadogUtils.trackEvent("hubspot-form-response", {
					status: res.status,
					statusText: res.statusText,
					ok: res.ok,
				});

				if (!res.ok) {
					const text = await res.text().catch(() => "");
					const errorMessage = t("hubspot.submissionFailed", {
						status: res.status,
						statusText: res.statusText,
						text: text ? " - " + text : "",
					});

					LoggerService.error(namespaces.ui.loginPage, errorMessage, true);

					DatadogUtils.captureException(new Error(errorMessage), {
						error_type: "http_error",
						http_status: res.status,
						http_status_text: res.statusText,
					});
					return;
				}

				DatadogUtils.trackEvent("hubspot-form-submission-success", {
					responseStatus: res.status,
				});
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

				DatadogUtils.captureException(error, {
					error_type: errorType,
					error_name: error.name,
				});
			}
		} catch (error: any) {
			DatadogUtils.captureException(error, {
				error_type: "unexpected_error",
			});
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
