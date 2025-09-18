export type EventDestinationTypes = "connection" | "trigger" | "unknown";

export type EnrichedEvent = {
	createdAt: Date;
	data?: Record<string, unknown> | undefined | null;
	destinationId?: string;
	destinationName?: string;
	destinationType?: EventDestinationTypes;
	id: string;
	projectId?: string;
	sequence?: number;
	sourceType?: string;
	type: string;
};

export type BaseEvent = {
	createdAt: Date;
	data?: Record<string, unknown> | undefined | null;
	destination?: EventDestinationTypes;
	destinationId?: string;
	destinationName?: string;
	eventId: string;
	eventType: string;
	sourceType?: string;
};
