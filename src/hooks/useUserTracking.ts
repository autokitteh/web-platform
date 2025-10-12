import { useEffect } from "react";

import { datadogRum } from "@datadog/browser-rum";
import * as Sentry from "@sentry/react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { datadogConstants, isProduction, msClarityId } from "@constants";
import { useOrganizationStore } from "@src/store";
import { getPageTitleFromPath, ClarityUtils, UserTrackingUtils } from "@src/utilities";

export const useUserTracking = () => {
	const { t } = useTranslation("utilities");
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey } = getPageTitleFromPath(location.pathname);

	useEffect(() => {
		if (user?.id) {
			UserTrackingUtils.setUser(user.id, user);
		}
	}, [user]);

	useEffect(() => {
		if (organization?.id) {
			UserTrackingUtils.setOrg(organization.id, organization);
		}
	}, [organization]);

	useEffect(() => {
		const trackPageView = async () => {
			const shouldInitializeClarity = isProduction && msClarityId;
			const isClarityInitialized = window.clarity && isProduction && msClarityId;

			if (shouldInitializeClarity) {
				if (!isClarityInitialized) {
					const message = t("clarity.notInitialized");
					// eslint-disable-next-line no-console
					console.warn(message);
					Sentry.captureMessage(message, "warning");
				} else if (user && organization) {
					await ClarityUtils.setPageId({
						userId: user.id,
						userName: user.name,
						userEmail: user.email,
						pageTitleKey,
					});
				} else {
					const message = t("clarity.noAuthenticatedUser");
					// eslint-disable-next-line no-console
					console.warn(message);
					Sentry.captureMessage(message, "warning");
				}
			}

			if (window.DD_RUM) {
				const viewName = pageTitleKey || location.pathname;

				datadogRum.startView({
					name: viewName,
					service: datadogConstants.service,
				});

				if (user) {
					datadogRum.setGlobalContextProperty("page.title", pageTitleKey);
					datadogRum.setGlobalContextProperty("page.path", location.pathname);
				}

				if (organization) {
					datadogRum.setGlobalContextProperty("page.organizationId", organization.id);
				}
			}
		};

		trackPageView();
	}, [location, user, organization, pageTitleKey, t]);
};
