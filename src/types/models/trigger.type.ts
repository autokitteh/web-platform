export type Trigger = {
	connectionId: string;
	connectionName?: string;
	data?: TriggerData;
	entryFunction: string;
	eventType: string;
	filter?: string;
	name: string;
	path: string;
	triggerId?: string;
};

export type TriggerData = { [key: string]: { string: { v: string } } };

export type TriggerObj = Record<string, string[]>;
