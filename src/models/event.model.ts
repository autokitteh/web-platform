import i18n from "i18next";

import { namespaces } from "@constants";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { Event as ProtoEvent } from "@src/autokitteh/proto/gen/ts/autokitteh/events/v1/event_pb";
import { Event } from "@src/types/models/event.type";

export const convertEventProtoToModel = async (protoEvent: ProtoEvent): Promise<Event> => {
	let destinationName;
	let sourceType;

	try {
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
				const errorMessage = i18n.t("eventNoDestinationIdExtended", {
					eventId: protoEvent.eventId,
					ns: "services",
					error: trigger.error,
				});
				throw errorMessage;
			}
			destinationName = trigger.data?.name;
			sourceType = trigger.data?.sourceType;
		}

		if (protoEvent.destinationId.startsWith("con_")) {
			const connection = await ConnectionService.get(protoEvent.destinationId);
			if (connection.error) {
				const errorMessage = i18n.t("eventNoDestinationIdExtended", {
					eventId: protoEvent.eventId,
					ns: "services",
					error: connection.error,
				});

				throw errorMessage;
			}
			destinationName = connection.data?.name;
			sourceType = i18n.t("connection", {
				connectionName: connection.data?.name,
				ns: "services",
				error: connection.error,
			});
		}
	} catch (error) {
		const errorMessage = i18n.t("eventNoDestinationIdExtended", {
			eventId: protoEvent.eventId,
			ns: "services",
			error,
		});

		LoggerService.error(namespaces.eventsService, errorMessage);
	}

	return {
		destinationId: protoEvent.destinationId,
		eventId: protoEvent.eventId,
		destinationName,
		sourceType,
	};
};
