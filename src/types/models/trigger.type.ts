export type Trigger = {
	triggerId?: string;
	connectionId: string;
	connectionName?: string;
	filter?: string;
	eventType: string;
	path: string;
	name: string;
};

export type TriggerObj = Record<string, string[]>;
