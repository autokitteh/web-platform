export type Event = {
	destination?: "trigger" | "connection" | "unknown";
	destinationId?: string;
	destinationName?: string;
	eventId: string;
	sourceType?: string;
};
