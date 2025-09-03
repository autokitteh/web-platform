import Cookies from "js-cookie";

import { isProduction, hubSpotFormId, hubSpotPortalId, namespaces } from "@constants";
import { HubspotSubmissionArgs } from "@interfaces/hooks";
import { LoggerService } from "@services/logger.service";

export function useHubspotSubmission({ t }: HubspotSubmissionArgs) {
	return async (user: { email?: string; name?: string }) => {
		// Guard: require production + IDs + email
		if (!isProduction || !hubSpotPortalId || !hubSpotFormId) {
			LoggerService.debug(namespaces.ui.loginPage, "HubSpot submission skipped: non-production or missing IDs");
			return;
		}
		if (!user?.email) {
			LoggerService.debug(namespaces.ui.loginPage, "HubSpot submission skipped: missing user.email");
			return;
		}

		const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubSpotPortalId}/${hubSpotFormId}`;
		const hsContext = {
			hutk: Cookies.get("hubspotutk") ?? "",
			pageUri: String(window.location.href || ""),
			pageName: String(document.title || ""),
		};
		const hsData = [
			{ name: "email", value: user.email },
			{ name: "firstname", value: user.name ?? "" },
		];
		const submissionData = {
			submittedAt: Date.now(),
			fields: hsData,
			context: hsContext,
		};
		try {
			const controller = new AbortController();
			const timeoutId = window.setTimeout(() => controller.abort(), 8000);

			const res = await fetch(hsUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(submissionData),
				signal: controller.signal,
			});
			window.clearTimeout(timeoutId);

			if (!res.ok) {
				const text = await res.text().catch(() => "");
				LoggerService.error(
					namespaces.ui.loginPage,
					`HubSpot submission failed: ${res.status} ${res.statusText} ${text ? "- " + text : ""}`,
					true
				);
				return;
			}

			LoggerService.debug(namespaces.ui.loginPage, "HubSpot submission succeeded");
		} catch (error: any) {
			LoggerService.error(
				namespaces.ui.loginPage,
				t("errors.loginFailedExtended", { error: String(error?.message ?? error) }),
				true
			);
		}
	};
}
