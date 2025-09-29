// inspired by: https://github.com/kelvinmaues/react-hubspot-tracking-code-hook

import * as Sentry from "@sentry/react";

import { PropsUseSetTrackEvent, UseTrackingCode } from "@src/types/hooks";

export const useHubspot = (): UseTrackingCode => {
	const _hsq = typeof window !== "undefined" && window._hsq ? window._hsq : [];

	const setContentType = (contentType: string): void => {
		try {
			if (!contentType || contentType.trim() === "") {
				Sentry.captureMessage("HubSpot setContentType failed: empty contentType", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: { contentType, hasHsq: !!_hsq },
				});
				return;
			}
			_hsq.push(["setContentType", contentType]);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: { contentType, hasHsq: !!_hsq },
				level: "error",
			});
		}
	};

	const setTrackPageView = () => {
		try {
			_hsq.push(["trackPageView"]);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: { hasHsq: !!_hsq },
				level: "error",
			});
		}
	};

	const setPathPageView = (path: string): void => {
		try {
			if (!path || path.trim() === "") {
				Sentry.captureMessage("HubSpot setPathPageView failed: empty path", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: { path, hasHsq: !!_hsq },
				});
				return;
			}
			_hsq.push(["setPath", path]);
			setTrackPageView();
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: { path, hasHsq: !!_hsq },
				level: "error",
			});
		}
	};

	const setIdentity = (email: string, customPropertities?: object) => {
		try {
			if (!email || email.trim() === "") {
				Sentry.captureMessage("HubSpot setIdentity failed: empty email", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: {
						email,
						hasCustomProperties: !!customPropertities,
						hasHsq: !!_hsq,
					},
				});
				return;
			}

			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (!emailRegex.test(email)) {
				Sentry.captureMessage("HubSpot setIdentity failed: invalid email format", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: {
						email,
						hasCustomProperties: !!customPropertities,
						hasHsq: !!_hsq,
					},
				});
				return;
			}

			_hsq.push([
				"identify",
				{
					email,
					...customPropertities,
				},
			]);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: {
					email,
					hasCustomProperties: !!customPropertities,
					customPropertities,
					hasHsq: !!_hsq,
				},
				level: "error",
			});
		}
	};

	const setTrackEvent = ({ eventId, value }: PropsUseSetTrackEvent) => {
		try {
			if (!eventId || eventId.trim() === "") {
				Sentry.captureMessage("HubSpot setTrackEvent failed: empty eventId", {
					level: "warning",
					tags: { component: "hubspot-tracking" },
					extra: {
						eventId,
						value,
						hasHsq: !!_hsq,
					},
				});
				return;
			}

			_hsq.push([
				"trackEvent",
				{
					id: eventId,
					value,
				},
			]);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: {
					eventId,
					value,
					hasHsq: !!_hsq,
				},
				level: "error",
			});
		}
	};

	const revokeCookieConsent = () => {
		try {
			_hsq.push(["revokeCookieConsent"]);
		} catch (error) {
			Sentry.captureException(error, {
				tags: { component: "hubspot-tracking" },
				extra: { hasHsq: !!_hsq },
				level: "error",
			});
		}
	};

	return {
		setContentType,
		setPathPageView,
		setTrackPageView,
		setIdentity,
		setTrackEvent,
		revokeCookieConsent,
	};
};
