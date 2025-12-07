// This file exists to avoid importing frontend code (like svg icons) into the playwright tests.

import { BaseSelectOption } from "@src/interfaces/components/forms/selectBase.interface";

export const baseTriggerTypes: BaseSelectOption[] = [
	{
		label: "Scheduler",
		ariaLabel: "Scheduler Trigger",
		value: "schedule",
	},
	{
		label: "Webhook",
		ariaLabel: "Webhook Trigger",
		value: "webhook",
	},
];
