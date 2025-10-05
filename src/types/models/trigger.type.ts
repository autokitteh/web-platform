import { TriggerTypes } from "@src/enums";

export type Trigger = {
	connectionId?: string;
	connectionName?: string;
	entryFunction?: string;
	entrypoint?: string;
	eventType: string;
	filter?: string;
	isDurable?: boolean;
	isSync?: boolean;
	name?: string;
	path?: string;
	projectId?: string;
	schedule?: string;
	sourceType?: TriggerTypes;
	triggerId?: string;
	webhookSlug?: string;
};

export type TriggerObj = Record<string, string[]>;

export type TriggerTypeKeyType = keyof typeof TriggerTypes;

export type TriggerForm = {
	connection: { label: string; value: string };
	cron?: string;
	entryFunction?: string;
	eventType?: string;
	eventTypeSelect?: { label?: string; value?: string };
	filePath?: { label?: string; value?: string };
	filter?: string;
	isDurable?: boolean;
	isSync?: boolean;
	name: string;
};
