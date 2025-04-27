// inspired by: https://github.com/kelvinmaues/react-hubspot-tracking-code-hook

import { PropsUseSetTrackEvent, UseTrackingCode } from "@types/hooks";

export const useHubspot = (): UseTrackingCode => {
	const _hsq = typeof window !== "undefined" && window._hsq ? window._hsq : [];

	const setContentType = (contentType: string): void => {
		_hsq.push(["setContentType", contentType]);
	};

	const setTrackPageView = () => {
		_hsq.push(["trackPageView"]);
	};

	const setPathPageView = (path: string): void => {
		_hsq.push(["setPath", path]);
		setTrackPageView();
	};

	const setIdentity = (email: string, customPropertities?: object) => {
		_hsq.push([
			"identify",
			{
				email,
				...customPropertities,
			},
		]);
	};

	const setTrackEvent = ({ eventId, value }: PropsUseSetTrackEvent) => {
		_hsq.push([
			"trackEvent",
			{
				id: eventId,
				value,
			},
		]);
	};

	const revokeCookieConsent = () => {
		_hsq.push(["revokeCookieConsent"]);
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
