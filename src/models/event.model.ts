import i18n from "i18next";

import { namespaces } from "@constants";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { Event as ProtoEvent } from "@src/autokitteh/proto/gen/ts/autokitteh/events/v1/event_pb";
import { Event } from "@src/types/models/event.type";

export const convertEventProtoToModel = async (protoEvent: ProtoEvent): Promise<Event> => {
	let destinationName;
	let sourceType;
	let destination = "unknown" as Event["destination"];

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
		destination = "trigger";
	}

	if (protoEvent.destinationId.startsWith("con_")) {
		const { data: connection } = await ConnectionService.get(protoEvent.destinationId);

		destinationName =
			connection?.name ||
			i18n.t("connectionNotFoundForSessionModel", {
				ns: "services",
			});
		sourceType = connection?.name
			? i18n.t("connection", {
					ns: "services",
				})
			: i18n.t("unknownSourceForSessionModel", {
					ns: "services",
				});
		destination = "connection";
	}

	return {
		eventId: protoEvent.eventId,
		destination,
		destinationId: protoEvent.destinationId,
		destinationName,
		sourceType,
	};
};
