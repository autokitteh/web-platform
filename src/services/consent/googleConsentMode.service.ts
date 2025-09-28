import { googleConsentModeMapping } from "@src/constants/consent.constants";
import type { ConsentStates } from "@src/types/consent.type";

declare global {
	interface Window {
		gtag?: (...args: any[]) => void;
		dataLayer: any[];
	}
}

export class GoogleConsentModeService {
	private static initialized = false;

	static initialize(): void {
		if (this.initialized) return;

		// Initialize Google Consent Mode v2 in denied state
		this.initializeDataLayer();

		window.gtag?.("consent", "default", {
			ad_storage: "denied",
			analytics_storage: "denied",
			functionality_storage: "denied",
			personalization_storage: "denied",
			security_storage: "granted",
			wait_for_update: 500, // Wait up to 500ms for consent signal
		});

		this.initialized = true;
	}

	static updateConsent(purposes: ConsentStates): void {
		if (!window.gtag) {
			// Google Tag Manager not available - silently skip in production
			if (process.env.NODE_ENV === "development") {
				// eslint-disable-next-line no-console
				console.warn("Google Tag Manager not available for consent update");
			}
			return;
		}

		const consentUpdate: Record<string, "granted" | "denied"> = {};

		// Map our purposes to Google Consent Mode parameters
		Object.entries(purposes).forEach(([purpose, state]) => {
			const gmsPurpose = googleConsentModeMapping[purpose as keyof typeof googleConsentModeMapping];
			if (gmsPurpose) {
				consentUpdate[gmsPurpose] = state;
			}
		});

		// Always grant security storage for strictly necessary cookies
		consentUpdate.security_storage = "granted";

		window.gtag("consent", "update", consentUpdate);

		// Emit additional event for custom analytics integration
		this.emitConsentModeEvent("consent_update", consentUpdate);
	}

	static getCurrentConsentState(): Record<string, "granted" | "denied"> | null {
		// This would typically require Google Consent Mode API integration
		// For now, return null as we don't have direct access to current state
		return null;
	}

	private static initializeDataLayer(): void {
		if (!window.dataLayer) {
			window.dataLayer = [];
		}

		if (!window.gtag) {
			window.gtag = function (...args: any[]) {
				window.dataLayer?.push(args);
			};
		}
	}

	private static emitConsentModeEvent(type: string, detail: any): void {
		try {
			const event = new CustomEvent("google_consent_mode_update", {
				detail: { type, ...detail },
				bubbles: true,
			});
			window.dispatchEvent(event);
		} catch (error) {
			// Silently handle error in production - could emit to analytics instead
			if (process.env.NODE_ENV === "development") {
				// eslint-disable-next-line no-console
				console.error("Failed to emit Google Consent Mode event:", error);
			}
		}
	}
}
