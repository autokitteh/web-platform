/* eslint-disable no-console */
import { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { ddConfigured } from "@constants";
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
		console.log("[Datadog] 🚀 Setting up user tracking");
		console.log(
			`[User Tracking] shouldTrack: ${shouldTrack}, isProduction: ${isProduction}, isE2eTest: ${isE2eTest}, storedE2eFlag: ${storedE2eFlag}`
		);
		if (!shouldTrack || initializedRef.current) return;
		if (DatadogUtils.isInitialized()) {
			console.log("[Datadog] ✅ Ready - setting up user context");

			if (user?.id) {
				UserTrackingUtils.setUser(user.id, user);
				console.log("[Datadog] User set:", user.id);
			}

			if (organization?.id) {
				UserTrackingUtils.setOrg(organization.id, organization);
				console.log("[Datadog] Organization set:", organization.id);
			}
		} else {
			console.warn("[Datadog] ⚠️ Datadog not initialized - user tracking may not work");
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
				console.log("[Datadog] 🚀 Tracking page view:", pathWithSearch);
				const viewName = pageTitleKey || location.pathname;
				DatadogUtils.startNamedView(viewName, "web-platform");
				DatadogUtils.setPageContext({
					title: pageTitleKey,
					path: pathWithSearch,
					search: location.search,
					hash: location.hash,
					organizationId: organization.id,
				});
				console.log("[Datadog] 🚀 Page view tracked");
			} else if (ddConfigured) {
				console.warn("[Datadog] ⚠️ Datadog configured but not initialized");
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
