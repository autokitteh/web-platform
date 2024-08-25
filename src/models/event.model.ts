import { Event as ProtoEvent } from "@src/autokitteh/proto/gen/ts/autokitteh/events/v1/event_pb";
import { Event } from "@src/types/models/event.type";

export function convertEventProtoToModel(protoEvent: ProtoEvent): Event {
	return {
		connectionId: protoEvent.connectionId,
		eventId: protoEvent.eventId,
	};
}
