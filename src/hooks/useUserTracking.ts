import { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { ddConfigured, namespaces } from "@constants";
import { LoggerService } from "@services/logger.service";
import { useOrganizationStore } from "@src/store";
import { DatadogUtils, getPageTitleFromPath, UserTrackingUtils } from "@src/utilities";

export const useUserTracking = (isProduction: boolean, isE2eTest: boolean) => {
	const { t } = useTranslation("utilities");
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey } = getPageTitleFromPath(location.pathname);
	const storedE2eFlag = localStorage.getItem("e2e") === "true";
	const shouldTrack = isProduction && !isE2eTest && !storedE2eFlag;
	const initializedRef = useRef(false);

	useEffect(() => {
		if (!shouldTrack || initializedRef.current) return;
		if (DatadogUtils.isInitialized()) {
			if (user?.id) {
				UserTrackingUtils.setUser(user.id, user);
			}

			if (organization?.id) {
				UserTrackingUtils.setOrg(organization.id, organization);
			}
		} else {
			LoggerService.warn(namespaces.datadog, "Datadog not initialized - user tracking may not work", true);
		}
		initializedRef.current = true;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!shouldTrack || !user?.id) return;
		UserTrackingUtils.setUser(user.id, user);
	}, [shouldTrack, user]);

	useEffect(() => {
		if (!shouldTrack || !organization?.id) return;
		UserTrackingUtils.setOrg(organization.id, organization);
	}, [shouldTrack, organization]);

	useEffect(() => {
		if (!shouldTrack || !user || !organization) return;

		const trackPageView = async () => {
			const pathWithSearch = location.pathname + location.search;

			if (ddConfigured && DatadogUtils.isInitialized()) {
				const viewName = pageTitleKey || location.pathname;
				DatadogUtils.startNamedView(viewName, "web-platform");
				DatadogUtils.setPageContext({
					title: pageTitleKey,
					path: pathWithSearch,
					search: location.search,
					hash: location.hash,
					organizationId: organization.id,
				});
			} else if (ddConfigured) {
				LoggerService.warn(namespaces.datadog, "[Datadog] ⚠️ Datadog configured but not initialized", true);
			}
		};

		trackPageView();
	}, [shouldTrack, location.pathname, location.search, location.hash, user, organization, pageTitleKey, t]);

	const captureMessage = (message: string, level?: "error" | "warning" | "info" | "debug"): void => {
		if (!shouldTrack) return;

		if (ddConfigured && DatadogUtils.isInitialized()) {
			DatadogUtils.trackEvent(`message:${level || "info"}`, { message, level });
		}
	};

	const captureException = (error: any, context?: { message?: string; tags?: Record<string, any> }): void => {
		if (!shouldTrack) return;

		if (ddConfigured && DatadogUtils.isInitialized()) {
			const errorMessage = error?.message || String(error);
			DatadogUtils.trackEvent("exception", {
				error: errorMessage,
				...context,
			});
		}
	};

	const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
		if (!shouldTrack) return;

		if (ddConfigured && DatadogUtils.isInitialized()) {
			DatadogUtils.trackEvent(eventName, properties);
		}
	};

	return {
		captureMessage,
		captureException,
		trackEvent,
	};
};
