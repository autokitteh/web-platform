import { Integrations } from "@enums/components";

export type IntegrationType = keyof typeof Integrations;
export type IntegrationGoogleType =
	| "gmail"
	| "google"
	| "googleSheets"
	| "googleCalendar"
	| "googleDrive"
	| "googleForms";
