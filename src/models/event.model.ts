import { Event as ProtoEvent } from "@autokitteh/proto/gen/ts/autokitteh/events/v1/event_pb";
import { BaseEvent, EnrichedEvent, EventDestinationTypes, Value } from "@types/models";
import { t } from "i18next";

import { namespaces } from "@constants";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { convertTimestampToDate, parseNestedJson } from "@utilities";

export const convertAndEnrichEventProtoToModel = async (protoEvent: ProtoEvent): Promise<EnrichedEvent> => {
	let destinationName;
	let sourceType;
	const sequence = Number(protoEvent?.seq);
	let destinationType: EventDestinationTypes = "unknown";
	let projectId: string | undefined;

	if (!protoEvent.destinationId) {
		const errorMessage = t("eventNoDestinationId", {
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
		projectId = trigger.data?.projectId;
	}

	if (protoEvent.destinationId.startsWith("con_")) {
		const connection = await ConnectionService.get(protoEvent.destinationId);
		destinationName = connection.data?.name;
		sourceType = t("connection", {
			connectionName: connection.data?.name,
			ns: "services",
			error: connection.error,
		});
		destinationType = "connection";
		projectId = connection.data?.projectId;
	}

	return {
		destinationId: protoEvent.destinationId,
		projectId,
		destinationType,
		id: protoEvent.eventId,
		type: protoEvent.eventType,
		destinationName,
		sourceType,
		createdAt: convertTimestampToDate(protoEvent.createdAt),
		data: parseNestedJson(protoEvent.data as Value),
		sequence,
	};
};

export const convertEventProtoToSimplifiedModel = (protoEvent: ProtoEvent): BaseEvent => ({
	destinationId: protoEvent.destinationId,
	eventId: protoEvent.eventId,
	eventType: protoEvent.eventType,
	createdAt: convertTimestampToDate(protoEvent.createdAt),
	data: parseNestedJson(protoEvent.data as Value),
});
