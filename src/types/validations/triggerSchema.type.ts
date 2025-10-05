export type TriggerFormData = {
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
