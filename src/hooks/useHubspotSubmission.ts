import Cookies from "js-cookie";

import { isProduction, hubSpotFormId, hubSpotPortalId, namespaces } from "@constants";
import { HubspotSubmissionArgs } from "@interfaces/hooks";
import { LoggerService } from "@services/logger.service";

export function useHubspotSubmission({ t }: HubspotSubmissionArgs) {
	return async (user: { email?: string; name?: string }) => {
		if (!isProduction || !hubSpotPortalId || !hubSpotFormId) return;

		const hsUrl = `https://api.hsforms.com/submissions/v3/integration/submit/${hubSpotPortalId}/${hubSpotFormId}`;
		const hsContext = {
			hutk: Cookies.get("hubspotutk"),
			pageUri: window.location.href,
			pageName: document.title,
		};
		const hsData = [
			{ objectTypeId: "0-1", name: "email", value: user?.email },
			{ objectTypeId: "0-1", name: "firstname", value: user?.name },
		];
		const submissionData = {
			submittedAt: Date.now(),
			fields: hsData,
			context: hsContext,
		};
		try {
			await fetch(hsUrl, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(submissionData),
			});
		} catch (error) {
			LoggerService.error(namespaces.ui.loginPage, t("errors.loginFailedExtended", { error }), true);
		}
	};
}
