// inspired by: https://github.com/kelvinmaues/react-hubspot-tracking-code-hook

import * as Sentry from "@sentry/react";
import Cookies from "js-cookie";
import { useTranslation } from "react-i18next";
import z from "zod";

import { isProduction, hubSpotFormId, hubSpotPortalId, namespaces, systemCookies } from "@constants";
import { LoggerService } from "@services/logger.service";
import { PropsUseSetTrackEvent, UseTrackingCode } from "@src/types/hooks";

export const useHubspot = (): UseTrackingCode => {
	const _hsq = typeof window !== "undefined" && window._hsq ? window._hsq : [];
	const { t } = useTranslation("login");

	const setContentType = (contentType: string): void => {
		try {
			if (!contentType || contentType.trim() === "") {
				Sentry.captureMessage("HubSpot setContentType failed: empty contentType", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: { contentType, hasHsq: !!_hsq },
				});
				return;
			}
			_hsq.push(["setContentType", contentType]);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: { contentType, hasHsq: !!_hsq },
				level: "error",
			});
		}
	};

	const setTrackPageView = () => {
		try {
			_hsq.push(["trackPageView"]);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: { hasHsq: !!_hsq },
				level: "error",
			});
		}
	};

	const setPathPageView = (path: string): void => {
		try {
			if (!path || path.trim() === "") {
				Sentry.captureMessage("HubSpot setPathPageView failed: empty path", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: { path, hasHsq: !!_hsq },
				});
				return;
			}
			_hsq.push(["setPath", path]);
			setTrackPageView();
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: { path, hasHsq: !!_hsq },
				level: "error",
			});
		}
	};

	const setIdentity = (email: string, customPropertities?: object) => {
		try {
			if (!email || email.trim() === "") {
				Sentry.captureMessage("HubSpot setIdentity failed: empty email", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: {
						email,
						hasCustomProperties: !!customPropertities,
						hasHsq: !!_hsq,
					},
				});
				return;
			}

			const emailTest = z.string().email();
			if (!emailTest.safeParse(email).success) {
				Sentry.captureMessage("HubSpot setIdentity failed: invalid email format", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: {
						email,
						hasCustomProperties: !!customPropertities,
						hasHsq: !!_hsq,
					},
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
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: {
					email,
					hasCustomProperties: !!customPropertities,
					customPropertities,
					hasHsq: !!_hsq,
				},
				level: "error",
			});
		}
	};

	const setTrackEvent = ({ eventId, value }: PropsUseSetTrackEvent) => {
		try {
			if (!eventId || eventId.trim() === "") {
				Sentry.captureMessage("HubSpot setTrackEvent failed: empty eventId", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: {
						eventId,
						value,
						hasHsq: !!_hsq,
					},
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
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: {
					eventId,
					value,
					hasHsq: !!_hsq,
				},
				level: "error",
			});
		}
	};

	const revokeCookieConsent = () => {
		try {
			_hsq.push(["revokeCookieConsent"]);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: { hasHsq: !!_hsq },
				level: "error",
			});
		}
	};

	const trackUserLogin = async (user?: { email?: string; name?: string }): Promise<void> => {
		if (!isProduction) {
			LoggerService.debug(namespaces.ui.loginPage, t("hubspot.skippingNotProduction"));
			return;
		}
		if (!user) {
			const message = t("hubspot.missingUser");
			LoggerService.error(namespaces.ui.loginPage, message, true);
			Sentry.captureMessage(message, {
				level: "error",
				tags: { component: "hubspot-submission-on-login" },
			});
			return;
		}

		if (!hubSpotPortalId || !hubSpotFormId) {
			const message = t("hubspot.missingFormOrPortalId");
			LoggerService.error(namespaces.ui.loginPage, message, true);
			Sentry.captureMessage(message, {
				level: "error",
				tags: { component: "hubspot-submission-on-login" },
				extra: {
					isProduction,
					hasHubSpotPortalId: !!hubSpotPortalId,
					hasHubSpotFormId: !!hubSpotFormId,
				},
			});
			return;
		}

		if (!user?.email) {
			const message = t("hubspot.missingUserEmail");
			LoggerService.error(namespaces.ui.loginPage, message, true);
			Sentry.captureMessage(message, {
				level: "error",
				tags: { component: "hubspot-submission-on-login" },
				extra: {
					hasUser: !!user,
					hasUserName: !!user?.name,
				},
			});
		}

		const emailTest = z.string().email();
		if (!emailTest.safeParse(user.email || "").success) {
			const errorMessage = t("hubspot.invalidEmailFormatWithEmail", { email: user.email });
			LoggerService.error(namespaces.ui.loginPage, errorMessage, true);
			Sentry.captureMessage(errorMessage, {
				level: "error",
				tags: { component: "hubspot-submission-on-login" },
				extra: { userEmail: user.email },
			});
			return;
		}

		setIdentity(user.email || "");

		const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubSpotPortalId}/${hubSpotFormId}`;
		const hubspotUtk = Cookies.get(systemCookies.hubSpot);
		const pageUri = window.location.href;
		const pageName = document.title;

		if (!hubspotUtk || hubspotUtk.trim() === "") {
			const message = t("hubspot.missingRequiredHubspotUtkCookie");
			LoggerService.error(namespaces.ui.loginPage, message, true);
			Sentry.captureMessage(message, {
				level: "warning",
				tags: { component: "hubspot-submission-on-login" },
				extra: {
					hasHubspotUtk: !!hubspotUtk,
					hasPageUri: !!pageUri,
					hasPageName: !!pageName,
					userEmail: user.email,
					userName: user.name,
				},
			});
			return;
		}

		if (!pageUri || !pageName) {
			const missingValues = [];
			if (!pageUri) missingValues.push("pageUri");
			if (!pageName) missingValues.push("pageName");

			const message = t("hubspot.missingRequiredValues", { values: missingValues.join(", ") });
			LoggerService.warn(namespaces.ui.loginPage, message, true);
			Sentry.captureMessage(message, {
				level: "warning",
				tags: { component: "hubspot-submission-on-login" },
				extra: {
					missingValues,
					hasHubspotUtk: !!hubspotUtk,
					hasPageUri: !!pageUri,
					hasPageName: !!pageName,
					userEmail: user.email,
					userName: user.name,
				},
			});
		}

		if (!user.name || user.name.trim() === "") {
			const message = t("hubspot.userNameEmpty");
			LoggerService.warn(namespaces.ui.loginPage, message, true);
			Sentry.captureMessage(message, {
				level: "warning",
				tags: { component: "hubspot-submission-on-login" },
				extra: {
					userEmail: user.email,
					userName: user.name,
				},
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

				Sentry.captureException(new Error(errorMessage), {
					tags: {
						component: "hubspot-submission-on-login",
						http_status: res.status,
						http_status_text: res.statusText,
					},
					extra: {
						userEmail: user.email,
						userName: user.name,
						hubSpotUrl: hsUrl,
						responseText: text,
						submissionData: submissionData,
					},
					level: "warning",
				});
				return;
			}

			const successMessage = t("hubspot.submissionSucceeded");
			Sentry.captureMessage(successMessage, {
				level: "info",
				tags: { component: "hubspot-submission-on-login" },
				extra: {
					userEmail: user.email,
					userName: user.name,
					responseStatus: res.status,
				},
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

			Sentry.captureException(error, {
				tags: {
					component: "hubspot-submission-on-login",
					error_type: errorType,
				},
				extra: {
					userEmail: user.email,
					userName: user.name,
					hubSpotUrl: hsUrl,
					submissionData: submissionData,
					errorMessage: error.message,
					errorStack: error.stack,
					timeout: errorType === "TimeoutError",
				},
				level: "warning",
			});
		}

		LoggerService.debug(namespaces.ui.loginPage, t("hubspot.functionCompleted"));
		Sentry.captureMessage(t("hubspot.functionCompleted"), {
			level: "info",
			tags: { component: "hubspot-submission-on-login" },
			extra: {
				userEmail: user.email,
				userName: user.name,
			},
		});
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
