export type Trigger = {
	triggerId?: string;
	connectionId: string;
	name: string;
	filter?: string;
	eventType: string;
	path: string;
	entryFunction: string;
	connectionName?: string;
	data?: TriggerData;
};

export type TriggerData = { [key: string]: { string: { v: string } } };

export type TriggerObj = Record<string, string[]>;
