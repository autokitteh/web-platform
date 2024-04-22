export type Trigger = {
	triggerId?: string;
	connectionId: string;
	connectionName?: string;
	filter?: string;
	eventType: string;
	path: string;
	name: string;
	data?: { [key: string]: { string: { v: string } } };
};

export type TriggerObj = Record<string, string[]>;
