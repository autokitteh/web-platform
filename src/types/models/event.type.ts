export type EventDestinationTypes = "connection" | "trigger" | "unknown";

export type EnrichedEvent = {
	createdAt: Date;
	destinationId?: string;
	destinationName?: string;
	destinationType?: EventDestinationTypes;
	eventId: string;
	sourceType?: string;
};
export type SimpleEvent = {
	createdAt: Date;
	destinationId?: string;
	destinationName?: string;
	eventId: string;
	sourceType?: string;
};
