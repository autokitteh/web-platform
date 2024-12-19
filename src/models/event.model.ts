import i18n from "i18next";

import { namespaces } from "@constants";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { Event as ProtoEvent } from "@src/autokitteh/proto/gen/ts/autokitteh/events/v1/event_pb";
import { BaseEvent, EnrichedEvent, EventDestinationTypes, Value } from "@src/types/models";
import { convertTimestampToDate, parseNestedJson } from "@src/utilities";

export const convertAndEnrichEventProtoToModel = async (protoEvent: ProtoEvent): Promise<EnrichedEvent> => {
	let destinationName;
	let sourceType;
	let destinationType: EventDestinationTypes = "unknown";

	if (!protoEvent.destinationId) {
		const errorMessage = i18n.t("eventNoDestinationId", {
			eventId: protoEvent.eventId,
			ns: "services",
		});

		LoggerService.error(namespaces.eventsService, errorMessage);
	}

	if (protoEvent.destinationId.startsWith("trg_")) {
		const trigger = await TriggersService.get(protoEvent.destinationId);
		destinationName = trigger.data?.name;
		sourceType = trigger.data?.sourceType;
		destinationType = "trigger";
	}

	if (protoEvent.destinationId.startsWith("con_")) {
		const connection = await ConnectionService.get(protoEvent.destinationId);
		destinationName = connection.data?.name;
		sourceType = i18n.t("connection", {
			connectionName: connection.data?.name,
			ns: "services",
			error: connection.error,
		});
		destinationType = "connection";
	}

	return {
		destinationId: protoEvent.destinationId,
		destinationType,
		id: protoEvent.eventId,
		type: protoEvent.eventType,
		destinationName,
		sourceType,
		createdAt: convertTimestampToDate(protoEvent.createdAt),
		data: parseNestedJson(protoEvent.data as Value),
	};
};

export const convertEventProtoToSimplifiedModel = (protoEvent: ProtoEvent): BaseEvent => ({
	destinationId: protoEvent.destinationId,
	eventId: protoEvent.eventId,
	eventType: protoEvent.eventType,
	createdAt: convertTimestampToDate(protoEvent.createdAt),
	data: parseNestedJson(protoEvent.data as Value),
});
