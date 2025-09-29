import * as Sentry from "@sentry/react";
import Cookies from "js-cookie";

import { isProduction, hubSpotFormId, hubSpotPortalId, namespaces } from "@constants";
import { HubspotSubmissionArgs } from "@interfaces/hooks";
import { LoggerService } from "@services/logger.service";

export function useHubspotSubmission({ t }: HubspotSubmissionArgs) {
	return async (user: { email?: string; name?: string }) => {
		if (!isProduction) return;
		if (!hubSpotPortalId || !hubSpotFormId) {
			const message = "HubSpot submission skipped: missing formId or portalId";
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
			const message = "HubSpot submission skipped: missing user.email";
			LoggerService.error(namespaces.ui.loginPage, message, true);
			Sentry.captureMessage(message, {
				level: "error",
				tags: { component: "hubspot-submission-on-login" },
				extra: {
					hasUser: !!user,
					hasUserName: !!user?.name,
				},
			});
			return;
		}

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(user.email)) {
			const errorMessage = "HubSpot submission skipped: invalid email format";
			LoggerService.error(namespaces.ui.loginPage, errorMessage, true);
			Sentry.captureMessage(errorMessage, {
				level: "error",
				tags: { component: "hubspot-submission-on-login" },
				extra: { userEmail: user.email },
			});
			return;
		}

		const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubSpotPortalId}/${hubSpotFormId}`;

		const hubspotUtk = Cookies.get("hubspotutk");
		const pageUri = window.location.href;
		const pageName = document.title;

		if (!hubspotUtk || hubspotUtk.trim() === "" || !pageUri || !pageName) {
			const missingValues = [];
			if (!hubspotUtk || hubspotUtk.trim() === "") missingValues.push("hubspotutk");
			if (!pageUri) missingValues.push("pageUri");
			if (!pageName) missingValues.push("pageName");

			const message = `HubSpot submission skipped: missing required values: ${missingValues.join(", ")}`;
			LoggerService.error(namespaces.ui.loginPage, message, true);
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
			return;
		}

		if (!user.name || user.name.trim() === "") {
			const message = "HubSpot submission: user name is empty";
			LoggerService.error(namespaces.ui.loginPage, message, true);
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
			const controller = new AbortController();
			const timeoutId = window.setTimeout(() => {
				controller.abort();
			}, 8000);

			const res = await fetch(hsUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(submissionData),
				signal: controller.signal,
			});

			window.clearTimeout(timeoutId);

			if (!res.ok) {
				const text = await res.text().catch(() => "");
				const errorMessage = `HubSpot submission failed: ${res.status} ${res.statusText}${text ? " - " + text : ""}`;

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
					level: "error",
				});
				return;
			}

			const successMessage = "HubSpot submission succeeded";
			LoggerService.debug(namespaces.ui.loginPage, successMessage);
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

			if (error.name === "AbortError") {
				errorMessage = "HubSpot submission timed out after 8 seconds";
				errorType = "TimeoutError";
			} else if (error.name === "TypeError" && error.message.includes("fetch")) {
				errorMessage = "HubSpot submission failed: network error";
				errorType = "NetworkError";
			} else {
				errorMessage = t("errors.loginFailedExtended", { error: String(error?.message ?? error) });
				errorType = error.name || "UnknownError";
			}

			LoggerService.error(namespaces.ui.loginPage, errorMessage, true);

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
				level: "error",
			});
		}
	};
}
