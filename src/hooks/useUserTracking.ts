import { useEffect, useRef } from "react";

import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";

import { datadogConstants, ddConfigured, msClarityId } from "@constants";
import { useOrganizationStore } from "@src/store";
import { ClarityUtils, DatadogUtils, getPageTitleFromPath, UserTrackingUtils } from "@src/utilities";

export const useUserTracking = (isProduction: boolean, isE2eTest: boolean) => {
	const { t } = useTranslation("utilities");
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey } = getPageTitleFromPath(location.pathname);
	const isE2eSession = sessionStorage.getItem("e2e") === "true";
	const shouldTrack = isProduction && !isE2eTest && !isE2eSession;
	const initializedRef = useRef(false);

	useEffect(() => {
		if (!shouldTrack || initializedRef.current) return;

		if (ddConfigured) {
			const initResult = DatadogUtils.init(datadogConstants);
			if (initResult && user?.id) {
				UserTrackingUtils.setUser(user.id, user);
			}

			if (initResult && organization?.id) {
				UserTrackingUtils.setOrg(organization.id, organization);
			}
		} else {
			// eslint-disable-next-line no-console
			console.warn("[Datadog] NOT configured - skipping initialization");
		}

		if (msClarityId) {
			ClarityUtils.init();

			if (user?.id) {
				ClarityUtils.setUserOnLogin(user.id, user.name, user.email);
			}
		}

		initializedRef.current = true;
	}, [shouldTrack, user, organization]);

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
	}, [shouldTrack, location.pathname, location.search, location.hash, user, organization, pageTitleKey, t]);

	const captureMessage = (message: string, level?: "error" | "warning" | "info" | "debug"): void => {
		if (!shouldTrack) return;

		if (ddConfigured) {
			DatadogUtils.trackEvent(`message:${level || "info"}`, { message, level });
		}
	};

	const captureException = (error: any, context?: { message?: string; tags?: Record<string, any> }): void => {
		if (!shouldTrack) return;

		if (ddConfigured) {
			const errorMessage = error?.message || String(error);
			DatadogUtils.trackEvent("exception", {
				error: errorMessage,
				...context,
			});
		}
	};

	const trackEvent = (eventName: string, properties?: Record<string, any>): void => {
		if (!shouldTrack) return;

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
