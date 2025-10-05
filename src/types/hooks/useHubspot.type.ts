export type MethodParam =
	| "setPath"
	| "trackPageView"
	| "identify"
	| "trackEvent"
	| "revokeCookieConsent"
	| "addPrivacyConsentListener"
	| "doNotTrack"
	| "addIdentityListener"
	| "setContentType"
	| "refreshPageHandlers";

export type PropsUseTrackingCode = {
	initialPath: string;
};

export type PropsUseSetTrackEvent = {
	eventId: string;
	value?: number | string;
};

export type UseTrackingCode = {
	revokeCookieConsent: () => void;
	setContentType: (contentType: string) => void;
	setIdentity: (email: string, customPropertities?: object) => void;
	setPathPageView: (path: string) => void;
	setTrackEvent: ({ eventId, value }: PropsUseSetTrackEvent) => void;
	setTrackPageView: () => void;
	trackUserLogin: (user?: { email?: string; name?: string }) => Promise<void>;
};

export type PushParams = [string, (string | object)?];
