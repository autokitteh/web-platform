import { eeaUkChProfile, restOfWorldProfile } from "@src/constants/consent.constants";
import type { RegionalProfile } from "@src/types/consent.type";

export class RegionDetectionService {
	private static detectedRegion: string | null = null;
	private static detectedProfile: RegionalProfile | null = null;

	static async detectRegion(): Promise<RegionalProfile> {
		// Return cached result if available
		if (this.detectedProfile) {
			return this.detectedProfile;
		}

		try {
			// Method 1: Try to get region from browser timezone
			const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const countryFromTZ = this.extractCountryFromTimezone(timezone);

			if (countryFromTZ) {
				this.detectedRegion = countryFromTZ;
				this.detectedProfile = this.getProfileForCountry(countryFromTZ);
				return this.detectedProfile;
			}

			// Method 2: Try to get region from browser language
			const language = navigator.language || navigator.languages?.[0];
			const countryFromLang = this.extractCountryFromLanguage(language);

			if (countryFromLang) {
				this.detectedRegion = countryFromLang;
				this.detectedProfile = this.getProfileForCountry(countryFromLang);
				return this.detectedProfile;
			}

			// Method 3: Fallback - assume rest of world (opt-out model)
			this.detectedProfile = restOfWorldProfile;
			return this.detectedProfile;
		} catch (error) {
			// Conservative fallback - assume EEA requirements (opt-in model)
			if (process.env.NODE_ENV === "development") {
				// eslint-disable-next-line no-console
				console.warn("Failed to detect region for consent requirements:", error);
			}
			this.detectedProfile = eeaUkChProfile;
			return this.detectedProfile;
		}
	}

	static getDetectedRegion(): string | null {
		return this.detectedRegion;
	}

	static requiresExplicitConsent(profile?: RegionalProfile): boolean {
		const currentProfile = profile || this.detectedProfile;

		// Default to requiring consent if uncertain
		return currentProfile?.requiresExplicitConsent ?? true;
	}

	static clearCache(): void {
		this.detectedRegion = null;
		this.detectedProfile = null;
	}

	private static extractCountryFromTimezone(timezone: string): string | null {
		// Map some common European timezones to country codes
		const timezoneMap: Record<string, string> = {
			"Europe/London": "GB",
			"Europe/Dublin": "IE",
			"Europe/Paris": "FR",
			"Europe/Berlin": "DE",
			"Europe/Rome": "IT",
			"Europe/Madrid": "ES",
			"Europe/Amsterdam": "NL",
			"Europe/Brussels": "BE",
			"Europe/Vienna": "AT",
			"Europe/Warsaw": "PL",
			"Europe/Prague": "CZ",
			"Europe/Budapest": "HU",
			"Europe/Stockholm": "SE",
			"Europe/Copenhagen": "DK",
			"Europe/Oslo": "NO",
			"Europe/Helsinki": "FI",
			"Europe/Zurich": "CH",
			"Europe/Lisbon": "PT",
			"Europe/Athens": "GR",
			"Europe/Sofia": "BG",
			"Europe/Bucharest": "RO",
			"Europe/Zagreb": "HR",
			"Europe/Ljubljana": "SI",
			"Europe/Bratislava": "SK",
			"Europe/Tallinn": "EE",
			"Europe/Riga": "LV",
			"Europe/Vilnius": "LT",
			"Europe/Luxembourg": "LU",
			"Europe/Malta": "MT",
			"Europe/Nicosia": "CY",
			"Atlantic/Reykjavik": "IS",
			"Europe/Vaduz": "LI",
		};

		return timezoneMap[timezone] || null;
	}

	private static extractCountryFromLanguage(language: string): string | null {
		if (!language) return null;

		// Extract country code from language-country format (e.g., en-GB, fr-FR)
		const parts = language.split("-");
		if (parts.length >= 2) {
			const countryCode = parts[1].toUpperCase();

			// Validate it's a known EEA/UK/CH country
			if (eeaUkChProfile.countries.includes(countryCode)) {
				return countryCode;
			}
		}

		// Map some language codes to likely countries for EEA region
		const languageMap: Record<string, string> = {
			de: "DE",
			fr: "FR",
			it: "IT",
			es: "ES",
			pt: "PT",
			nl: "NL",
			pl: "PL",
			cs: "CZ",
			sk: "SK",
			hu: "HU",
			ro: "RO",
			bg: "BG",
			hr: "HR",
			sl: "SI",
			et: "EE",
			lv: "LV",
			lt: "LT",
			el: "GR",
			fi: "FI",
			sv: "SE",
			da: "DK",
			no: "NO",
			is: "IS",
		};

		const languageCode = parts[0].toLowerCase();
		return languageMap[languageCode] || null;
	}

	private static getProfileForCountry(countryCode: string): RegionalProfile {
		if (eeaUkChProfile.countries.includes(countryCode)) {
			return eeaUkChProfile;
		}

		return restOfWorldProfile;
	}
}
