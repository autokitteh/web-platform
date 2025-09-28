import type { ConsentConfig, ConsentPurposeDefinition, ConsentStates, RegionalProfile } from "@src/types/consent.type";

export const consentVersion = "1.0.0";
export const consentBannerVersion = "1.0.0";
export const consentDurationMonths = 12;

export const consentStorageKey = "ak-consent";
export const consentCookieName = "ak-consent";

export const defaultConsentStates: ConsentStates = {
	"strictly-necessary": "granted",
	functional: "denied",
	analytics: "denied",
	marketing: "denied",
};

export const consentPurposeDefinitions: ConsentPurposeDefinition[] = [
	{
		id: "strictly-necessary",
		title: "Strictly Necessary",
		description:
			"These cookies are essential for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services.",
		required: true,
		retention: "Session and persistent cookies up to 13 months",
		examples: [
			"User authentication and session management",
			"Security and fraud prevention",
			"Load balancing and performance optimization",
		],
		cookies: [
			{
				name: "ak-session",
				purpose: "User session management",
				provider: "AutoKitteh",
				duration: "13 months",
				type: "first-party",
			},
			{
				name: "ak-csrf",
				purpose: "Security token for form submissions",
				provider: "AutoKitteh",
				duration: "Session",
				type: "first-party",
			},
		],
	},
	{
		id: "functional",
		title: "Functional",
		description:
			"These cookies allow the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages.",
		required: false,
		retention: "Up to 13 months",
		examples: ["User preferences and settings", "Language and region selection", "Chat and support features"],
		cookies: [
			{
				name: "ak-preferences",
				purpose: "Store user interface preferences",
				provider: "AutoKitteh",
				duration: "13 months",
				type: "first-party",
			},
			{
				name: "ak-lang",
				purpose: "Remember language selection",
				provider: "AutoKitteh",
				duration: "13 months",
				type: "first-party",
			},
		],
	},
	{
		id: "analytics",
		title: "Analytics",
		description:
			"These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. This helps us improve our website performance and user experience.",
		required: false,
		retention: "Up to 26 months",
		examples: [
			"Website usage statistics and performance metrics",
			"User journey and behavior analysis",
			"Error tracking and debugging information",
		],
		cookies: [
			{
				name: "_ga, _ga_*",
				purpose: "Google Analytics tracking",
				provider: "Google",
				duration: "2 years",
				type: "third-party",
			},
			{
				name: "dd_*",
				purpose: "Datadog RUM and performance monitoring",
				provider: "Datadog",
				duration: "13 months",
				type: "third-party",
			},
		],
	},
	{
		id: "marketing",
		title: "Marketing",
		description:
			"These cookies track your online activity to help advertisers deliver more relevant advertising or limit how many times you see an ad. They may also be used to build a profile of your interests.",
		required: false,
		retention: "Up to 13 months",
		examples: [
			"Targeted advertising and retargeting",
			"Social media integration and sharing",
			"Conversion tracking and attribution",
		],
		cookies: [
			{
				name: "hubspot_*",
				purpose: "HubSpot marketing automation",
				provider: "HubSpot",
				duration: "13 months",
				type: "third-party",
			},
			{
				name: "_fbp, _fbc",
				purpose: "Facebook Pixel tracking",
				provider: "Meta",
				duration: "90 days",
				type: "third-party",
			},
		],
	},
];

export const eeaUkChProfile: RegionalProfile = {
	countries: [
		// EEA countries
		"AT",
		"BE",
		"BG",
		"CY",
		"CZ",
		"DE",
		"DK",
		"EE",
		"ES",
		"FI",
		"FR",
		"GR",
		"HR",
		"HU",
		"IE",
		"IS",
		"IT",
		"LI",
		"LT",
		"LU",
		"LV",
		"MT",
		"NL",
		"NO",
		"PL",
		"PT",
		"RO",
		"SE",
		"SI",
		"SK",
		// UK and Switzerland
		"GB",
		"CH",
	],
	requiresExplicitConsent: true,
	defaultConsentStates: {
		"strictly-necessary": "granted",
		functional: "denied",
		analytics: "denied",
		marketing: "denied",
	},
};

export const restOfWorldProfile: RegionalProfile = {
	countries: [],
	requiresExplicitConsent: false,
	defaultConsentStates: {
		"strictly-necessary": "granted",
		functional: "granted",
		analytics: "granted",
		marketing: "denied",
	},
};

export const consentConfig: ConsentConfig = {
	version: consentVersion,
	bannerVersion: consentBannerVersion,
	defaultLanguage: "en",
	forceConsent: false,
	consentDuration: consentDurationMonths,
	purposes: consentPurposeDefinitions,
	geoLocation: {
		requiresConsent: eeaUkChProfile.countries,
		optOut: [],
	},
};

export const googleConsentModeMapping = {
	analytics: "analytics_storage",
	marketing: "ad_storage",
	functional: "functionality_storage",
	"strictly-necessary": "security_storage",
} as const;
