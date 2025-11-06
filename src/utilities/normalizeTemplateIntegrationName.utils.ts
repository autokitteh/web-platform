import { Integrations } from "@src/enums/components";

/**
 * Normalizes template integration names to match Integrations enum values.
 * Templates store integration names like "googlecalendar", but Integrations enum has "calendar"
 * This function handles the transformation for Google integrations and other special cases.
 * @param integrationName Integration name from template (e.g., "googlecalendar", "google_forms")
 * @returns The normalized Integrations enum key (e.g., "calendar", "forms")
 */
export const normalizeTemplateIntegrationName = (integrationName: string): string => {
	if (!integrationName) return integrationName;

	// Handle Google integrations: remove "google" prefix
	// googlecalendar -> calendar
	// googlegmail -> gmail
	// googlesheets -> sheets
	// googledrive -> drive
	// googleforms -> forms
	// googleyoutube -> youtube
	if (integrationName.toLowerCase().startsWith("google")) {
		const withoutGoogle = integrationName.slice(6);
		const normalizedName = withoutGoogle.toLowerCase();

		// Check if this is a valid Google integration
		if (
			normalizedName === Integrations.calendar ||
			normalizedName === Integrations.gmail ||
			normalizedName === Integrations.sheets ||
			normalizedName === Integrations.drive ||
			normalizedName === Integrations.forms ||
			normalizedName === Integrations.youtube
		) {
			return normalizedName;
		}
	}

	// Return as-is if no normalization needed
	return integrationName;
};
