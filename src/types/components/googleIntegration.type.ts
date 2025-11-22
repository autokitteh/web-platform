import { Integrations } from "@src/enums/components/integrations.enum";

export type GoogleIntegrationType = Extract<
	Integrations,
	| Integrations.gmail
	| Integrations.sheets
	| Integrations.calendar
	| Integrations.drive
	| Integrations.forms
	| Integrations.youtube
>;
