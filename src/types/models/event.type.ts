export type EventDestinationTypes = "connection" | "trigger" | "unknown";

export type EnrichedEvent = {
	createdAt: Date;
	destinationId?: string;
	destinationName?: string;
	destinationType?: EventDestinationTypes;
	eventId: string;
	sourceType?: string;
};
export type BaseEvent = {
	createdAt: Date;
	data?: object;
	destination?: "trigger" | "connection" | "unknown";
	destinationId?: string;
	destinationName?: string;
	eventId: string;
	eventType: string;
	sourceType?: string;
};
