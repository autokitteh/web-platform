import i18n from "i18next";

import { namespaces } from "@constants";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { Event as ProtoEvent } from "@src/autokitteh/proto/gen/ts/autokitteh/events/v1/event_pb";
import { Event } from "@src/types/models/event.type";

export const convertEventProtoToModel = async (protoEvent: ProtoEvent): Promise<Event> => {
	let destinationName;
	let sourceType;

	if (!protoEvent.destinationId) {
		const errorMessage = i18n.t("eventNoDestinationId", {
			eventId: protoEvent.eventId,
			ns: "services",
		});

		LoggerService.error(namespaces.eventsService, errorMessage);
	}

	if (protoEvent.destinationId.startsWith("trg_")) {
		const { data: trigger } = await TriggersService.get(protoEvent.destinationId);

		destinationName =
			trigger?.name ||
			i18n.t("triggerNotFoundForSessionModel", {
				ns: "services",
			});
		sourceType =
			trigger?.sourceType ||
			i18n.t("unknownSourceForSessionModel", {
				ns: "services",
			});
	}

	if (protoEvent.destinationId.startsWith("con_")) {
		const connection = await ConnectionService.get(protoEvent.destinationId);

		destinationName =
			connection.data?.name ||
			i18n.t("triggerNotFoundForSessionModel", {
				ns: "services",
			});
		sourceType = connection.data?.name
			? i18n.t("connection", {
					connectionName: connection.data?.name,
					ns: "services",
					error: connection.error,
				})
			: i18n.t("unknownSourceForSessionModel", {
					ns: "services",
				});
	}

	return {
		destinationId: protoEvent.destinationId,
		eventId: protoEvent.eventId,
		destinationName,
		sourceType,
	};
};
