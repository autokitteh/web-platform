import { useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { datadogConstants, ddConfigured, isProduction, msClarityId } from "@constants";
import { useOrganizationStore } from "@src/store";
import { ClarityUtils, DatadogUtils, getPageTitleFromPath, UserTrackingUtils } from "@src/utilities";

export const useUserTracking = () => {
	const { t } = useTranslation("utilities");
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey } = getPageTitleFromPath(location.pathname);

	useEffect(() => {
		// eslint-disable-next-line no-console
		console.log("[useUserTracking Init]", { isProduction, ddConfigured, msClarityId });

		if (!isProduction) return;

		if (ddConfigured) {
			// eslint-disable-next-line no-console
			console.log("[Datadog] Initializing RUM...");
			const initResult = DatadogUtils.init(datadogConstants);
			// eslint-disable-next-line no-console
			console.log("[Datadog] Initialization result:", initResult, "window.DD_RUM:", !!window.DD_RUM);
		} else {
			// eslint-disable-next-line no-console
			console.warn("[Datadog] NOT configured - skipping initialization");
		}

		if (msClarityId) {
			ClarityUtils.init();
		}
	}, []);

	useEffect(() => {
		if (!isProduction || !user?.id) return;

		UserTrackingUtils.setUser(user.id, user);
	}, [user]);

	useEffect(() => {
		if (!isProduction || !organization?.id) return;

		UserTrackingUtils.setOrg(organization.id, organization);
	}, [organization]);

	useEffect(() => {
		if (!isProduction || !user || !organization) return;

		const trackPageView = async () => {
			const pathWithSearch = location.pathname + location.search;

			if (msClarityId) {
				const isClarityInitialized = window.clarity;
				if (!isClarityInitialized) {
					const message = t("clarity.notInitialized");
					// eslint-disable-next-line no-console
					console.warn(message);
				} else {
					await ClarityUtils.setPageId({
						userId: user.id,
						userName: user.name,
						userEmail: user.email,
						pageTitleKey,
					});
				}
			}

			if (ddConfigured) {
				const viewName = pageTitleKey || location.pathname;
				DatadogUtils.startNamedView(viewName, datadogConstants.service);
				DatadogUtils.setPageContext({
					title: pageTitleKey,
					path: pathWithSearch,
					search: location.search,
					hash: location.hash,
					organizationId: organization.id,
				});
			}
		};

		trackPageView();
	}, [location.pathname, location.search, location.hash, user, organization, pageTitleKey, t]);

	const captureMessage = (message: string, level?: "error" | "warning" | "info" | "debug"): void => {
		if (!isProduction) return;

		if (ddConfigured) {
			DatadogUtils.trackEvent(`message:${level || "info"}`, { message, level });
		}
	};

	const captureException = (error: any, context?: { message?: string; tags?: Record<string, any> }): void => {
		if (!isProduction) return;

		if (ddConfigured) {
			const errorMessage = error?.message || String(error);
			DatadogUtils.trackEvent("exception", {
				error: errorMessage,
				...context,
			});
		}
	};

	const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
		if (!isProduction) return;

		if (ddConfigured) {
			DatadogUtils.trackEvent(eventName, properties);
		}
	};

	return {
		captureMessage,
		captureException,
		trackEvent,
	};
};
