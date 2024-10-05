import i18n from "i18next";

import { namespaces } from "@constants";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { Event as ProtoEvent } from "@src/autokitteh/proto/gen/ts/autokitteh/events/v1/event_pb";
import { EnrichedEvent, EventDestinationTypes, SimpleEvent } from "@src/types/models";
import { convertTimestampToDate } from "@src/utilities";

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
		if (trigger.error) {
			const errorMessage = i18n.t("eventNoTriggerExtended", {
				eventId: protoEvent.eventId,
				ns: "services",
				error: trigger.error,
			});
			throw new Error(errorMessage);
		}
		destinationName = trigger.data?.name;
		sourceType = trigger.data?.sourceType;
		destinationType = "trigger";
	}

	if (protoEvent.destinationId.startsWith("con_")) {
		const connection = await ConnectionService.get(protoEvent.destinationId);
		if (connection.error) {
			const errorMessage = i18n.t("eventNoConnectionExtended", {
				eventId: protoEvent.eventId,
				ns: "services",
				error: connection.error,
			});

			throw new Error(errorMessage);
		}
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
		eventId: protoEvent.eventId,
		destinationName,
		sourceType,
		createdAt: convertTimestampToDate(protoEvent.createdAt),
	};
};

export const convertEventProtoToSimplifiedModel = (protoEvent: ProtoEvent): SimpleEvent => ({
	destinationId: protoEvent.destinationId,
	eventId: protoEvent.eventId,
	createdAt: convertTimestampToDate(protoEvent.createdAt),
});
