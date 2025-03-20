import { EventTypes } from "@src/enums";
import { Value } from "@type/models";

export type EnrichedEvent = {
	createdAt: Date;
	data?: Value;
	destinationId?: string;
	destinationName?: string;
	destinationType?: EventTypes;
	id: string;
	projectId?: string;
	sequence?: number;
	sourceType?: string;
	type: string;
};
export type BaseEvent = {
	createdAt: Date;
	data?: Value;
	destination?: EventTypes;
	destinationId?: string;
	destinationName?: string;
	eventId: string;
	eventType: string;
	sourceType?: string;
};
