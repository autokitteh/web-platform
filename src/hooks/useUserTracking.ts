import { useEffect } from "react";

import ga4 from "react-ga4";
import { useTranslation } from "react-i18next";
import { createRoutesFromChildren, matchRoutes, useLocation, useNavigationType } from "react-router-dom";

import {
	datadogConstants,
	ddConfigured,
	googleAnalyticsId,
	hubSpotPortalId,
	isProduction,
	msClarityId,
	sentryDsn,
} from "@constants";
import { useOrganizationStore } from "@src/store";
import {
	ClarityUtils,
	DatadogUtils,
	getPageTitleFromPath,
	HubSpotUtils,
	SentryUtils,
	UserTrackingUtils,
} from "@src/utilities";

export const useUserTracking = () => {
	const { t } = useTranslation("utilities");
	const location = useLocation();
	const { user, currentOrganization: organization } = useOrganizationStore();
	const { pageTitle: pageTitleKey } = getPageTitleFromPath(location.pathname);

	useEffect(() => {
		if (!isProduction) return;

		if (ddConfigured) {
			DatadogUtils.init(datadogConstants);
		}

		if (sentryDsn) {
			SentryUtils.init({
				dsn: sentryDsn,
				useEffect,
				useLocation,
				useNavigationType,
				createRoutesFromChildren,
				matchRoutes,
				tracesSampleRate: 1.0,
				tracePropagationTargets: [
					"localhost",
					/^https:\/\/[\w.-]+\.autokitteh\.cloud/,
					/^https:\/\/autokitteh\.cloud/,
				],
			});
		}

		if (msClarityId) {
			ClarityUtils.init();
		}

		if (hubSpotPortalId) {
			HubSpotUtils.init(hubSpotPortalId);
		}

		if (googleAnalyticsId) {
			ga4.initialize(googleAnalyticsId, {
				testMode: !isProduction,
			});
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
					SentryUtils.captureMessage(message, "warning");
				} else {
					await ClarityUtils.setPageId({
						userId: user.id,
						userName: user.name,
						userEmail: user.email,
						pageTitleKey,
					});
				}
			}

			// Datadog page tracking
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

			// Google Analytics page tracking
			if (googleAnalyticsId) {
				ga4.send({
					hitType: "pageview",
					page: pathWithSearch,
				});
			}
			if (hubSpotPortalId) {
				HubSpotUtils.setPathPageView(pathWithSearch);
			}
		};

		trackPageView();
	}, [location.pathname, location.search, location.hash, user, organization, pageTitleKey, t]);

	const captureMessage = (message: string, level?: "error" | "warning" | "info" | "debug"): string => {
		if (!isProduction) return "";

		const eventId = SentryUtils.captureMessage(message, level);

		if (ddConfigured) {
			DatadogUtils.trackEvent(`message:${level || "info"}`, { message, level });
		}

		return eventId;
	};

	const captureException = (error: any, context?: { message?: string; tags?: Record<string, any> }): void => {
		if (!isProduction) return;

		SentryUtils.captureException(error);

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

		SentryUtils.addBreadcrumb({
			category: "user-action",
			message: eventName,
			level: "info",
			data: properties,
		});
	};

	const captureFeedback = (feedback: { email?: string; event_id: string; message: string; name?: string }): void => {
		if (!isProduction) return;

		SentryUtils.captureFeedback(feedback);
	};

	const getCurrentScope = () => {
		if (!isProduction) return null;

		return SentryUtils.getCurrentScope();
	};

	const revokeCookieConsent = (): void => {
		if (!isProduction) return;

		HubSpotUtils.revokeCookieConsent();
	};

	const trackUserLogin = async (params: { t: any; user?: { email?: string; name?: string } }): Promise<void> => {
		if (!isProduction) return;

		await HubSpotUtils.trackUserLogin({
			user: params.user,
			t: params.t,
			captureMessage: (message: string, level?: any) => SentryUtils.captureMessage(message, level),
			captureException: (error: any) => captureException(error),
			addBreadcrumb: (breadcrumb: any) => SentryUtils.addBreadcrumb(breadcrumb),
		});
	};

	return {
		captureMessage,
		captureException,
		trackEvent,
		captureFeedback,
		getCurrentScope,
		revokeCookieConsent,
		trackUserLogin,

		withSentryReactRouterV7Routing: SentryUtils.withSentryReactRouterV7Routing,
	};
};
