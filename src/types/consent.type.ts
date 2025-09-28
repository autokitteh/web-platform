export type ConsentPurpose = "strictly-necessary" | "functional" | "analytics" | "marketing";

export type ConsentState = "granted" | "denied";

export type ConsentStates = Record<ConsentPurpose, ConsentState>;

export interface ConsentRecord {
	version: string;
	timestamp: number;
	language: string;
	region?: string;
	purposes: ConsentStates;
	bannerVersion: string;
}

export interface ConsentContext {
	isLoaded: boolean;
	hasConsent: boolean;
	consentRecord: ConsentRecord | null;
	purposes: ConsentStates;
	showBanner: boolean;
	showPreferences: boolean;
	acceptAll: () => void;
	rejectAll: () => void;
	updatePurposes: (purposes: Partial<ConsentStates>) => void;
	openPreferences: () => void;
	closePreferences: () => void;
	closeBanner: () => void;
	resetConsent: () => void;
}

export interface CookieDefinition {
	name: string;
	purpose: string;
	provider: string;
	duration: string;
	type: "first-party" | "third-party";
}

export interface ConsentPurposeDefinition {
	id: ConsentPurpose;
	title: string;
	description: string;
	required: boolean;
	cookies: CookieDefinition[];
	examples: string[];
	retention: string;
}

export interface ConsentConfig {
	version: string;
	bannerVersion: string;
	defaultLanguage: string;
	forceConsent: boolean;
	consentDuration: number; // months
	purposes: ConsentPurposeDefinition[];
	geoLocation?: {
		optOut: string[];
		requiresConsent: string[]; // country codes
	};
}

export interface RegionalProfile {
	countries: string[];
	requiresExplicitConsent: boolean;
	defaultConsentStates: ConsentStates;
}
