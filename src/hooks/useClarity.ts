import { useEffect } from "react";

import * as Sentry from "@sentry/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { isProduction, msClarityId } from "@constants";
import { useOrganizationStore } from "@src/store";
import { getPageTitleFromPath } from "@src/utilities";
import { setClarityPageId } from "@utilities/clarity.utils";

export const useClarity = () => {
	const { t } = useTranslation("utilities");
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey } = getPageTitleFromPath(location.pathname);

	useEffect(() => {
		const setPage = async () => {
			const shouldInitializeClarity = isProduction && msClarityId;
			const isClarityInitialized = window.clarity && isProduction && msClarityId;
			if (!shouldInitializeClarity) return;

			if (!isClarityInitialized) {
				const message = t("clarity.notInitialized");
				// eslint-disable-next-line no-console
				console.warn(message);
				Sentry.captureMessage(message, "warning");
				return;
			}

			if (user && organization) {
				await setClarityPageId({
					userId: user.id,
					userName: user.name,
					userEmail: user.email,
					pageTitleKey,
				});
				return;
			}

			const message = t("clarity.noAuthenticatedUser");
			// eslint-disable-next-line no-console
			console.warn(message);
			Sentry.captureMessage(message, "warning");
		};
		setPage();
	}, [location, user, organization, pageTitleKey, t]);
};
