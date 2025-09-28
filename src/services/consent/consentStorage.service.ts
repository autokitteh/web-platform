import { consentCookieName, consentStorageKey } from "@src/constants/consent.constants";
import type { ConsentRecord } from "@src/types/consent.type";

export class ConsentStorageService {
	private static cookieName = consentCookieName;
	private static storageKey = consentStorageKey;

	static save(record: ConsentRecord): void {
		const serialized = JSON.stringify(record);

		try {
			// Save to cookie for first-party access
			this.setCookie(this.cookieName, serialized, this.calculateExpiryDate());

			// Save to localStorage as backup
			localStorage.setItem(this.storageKey, serialized);
		} catch (error) {
			// Silently handle error in production - could emit to analytics instead
			if (process.env.NODE_ENV === "development") {
				// eslint-disable-next-line no-console
				console.error("Failed to save consent record:", error);
			}
		}
	}

	static load(): ConsentRecord | null {
		try {
			// Try cookie first (more reliable across sessions)
			let serialized = this.getCookie(this.cookieName);

			// Fallback to localStorage
			if (!serialized) {
				serialized = localStorage.getItem(this.storageKey);
			}

			if (!serialized) {
				return null;
			}

			const record = JSON.parse(serialized) as ConsentRecord;

			// Validate record structure
			if (this.isValidConsentRecord(record)) {
				return record;
			}

			return null;
		} catch (error) {
			// Silently handle error in production - could emit to analytics instead
			if (process.env.NODE_ENV === "development") {
				// eslint-disable-next-line no-console
				console.error("Failed to load consent record:", error);
			}
			return null;
		}
	}

	static clear(): void {
		try {
			// Clear cookie by setting expired date
			this.setCookie(this.cookieName, "", new Date(0));

			// Clear localStorage
			localStorage.removeItem(this.storageKey);
		} catch (error) {
			// Silently handle error in production - could emit to analytics instead
			if (process.env.NODE_ENV === "development") {
				// eslint-disable-next-line no-console
				console.error("Failed to clear consent record:", error);
			}
		}
	}

	static hasConsent(): boolean {
		return this.load() !== null;
	}

	static isConsentExpired(record: ConsentRecord, durationMonths: number): boolean {
		const expiryDate = new Date(record.timestamp);
		expiryDate.setMonth(expiryDate.getMonth() + durationMonths);
		return Date.now() > expiryDate.getTime();
	}

	private static setCookie(name: string, value: string, expires: Date): void {
		const cookie = [
			`${name}=${encodeURIComponent(value)}`,
			`expires=${expires.toUTCString()}`,
			"path=/",
			"SameSite=Lax",
			// Add Secure flag in production
			...(location.protocol === "https:" ? ["Secure"] : []),
		].join("; ");

		document.cookie = cookie;
	}

	private static getCookie(name: string): string | null {
		// eslint-disable-next-line security/detect-non-literal-regexp
		const match = document.cookie.match(new RegExp(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`));
		return match ? decodeURIComponent(match[2]) : null;
	}

	private static calculateExpiryDate(): Date {
		const date = new Date();
		// Set expiry to 13 months (slightly longer than consent duration for flexibility)
		date.setMonth(date.getMonth() + 13);
		return date;
	}

	private static isValidConsentRecord(record: any): record is ConsentRecord {
		return (
			record &&
			typeof record === "object" &&
			typeof record.version === "string" &&
			typeof record.timestamp === "number" &&
			typeof record.language === "string" &&
			typeof record.bannerVersion === "string" &&
			record.purposes &&
			typeof record.purposes === "object" &&
			Object.keys(record.purposes).length > 0
		);
	}

	// Emit custom events for integration with analytics and tag management
	static emitConsentEvent(type: "consent_loaded" | "consent_updated", detail: ConsentRecord): void {
		try {
			const event = new CustomEvent(type, {
				detail,
				bubbles: true,
			});
			window.dispatchEvent(event);
		} catch (error) {
			// Silently handle error in production - could emit to analytics instead
			if (process.env.NODE_ENV === "development") {
				// eslint-disable-next-line no-console
				console.error(`Failed to emit ${type} event:`, error);
			}
		}
	}
}
