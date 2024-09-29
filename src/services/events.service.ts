import i18n from "i18next";

import { eventsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { ConnectionService, LoggerService, TriggersService } from "@services";
import { convertEventProtoToModel } from "@src/models/event.model";
import { Event } from "@src/types/models/event.type";
import { ServiceResponse } from "@type";

export class EventsService {
	static async get(eventId: string): Promise<ServiceResponse<Event | undefined>> {
		try {
			const { event } = await eventsClient.get({ eventId });
			if (!event) {
				return { data: undefined, error: undefined };
			}
			const eventConverted = convertEventProtoToModel(event);

			return { data: eventConverted, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.eventsService,
				i18n.t("fetchFailedForEvent", {
					eventId,
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}

	static async getDestinationName(eventId: string): Promise<ServiceResponse<string>> {
		try {
			const { event } = await eventsClient.get({ eventId });
			if (!event) {
				return { data: undefined, error: undefined };
			}
			const eventConverted = convertEventProtoToModel(event);

			if (!eventConverted.destinationId) {
				const errorMessage = i18n.t("eventNoDestinationId", {
					eventId,
					ns: "services",
				});

				LoggerService.error(namespaces.eventsService, errorMessage);

				return { data: "", error: undefined };
			}

			if (eventConverted.destinationId.startsWith("trg_")) {
				const trigger = await TriggersService.get(eventConverted.destinationId);
				if (trigger.error) {
					const errorMessage = i18n.t("eventNoDestinationIdExtended", {
						eventId,
						ns: "services",
						error: trigger.error,
					});

					return { data: "", error: errorMessage };
				} else return { data: trigger.data?.name, error: undefined };
			}

			if (eventConverted.destinationId.startsWith("con_")) {
				const connection = await ConnectionService.get(eventConverted.destinationId);
				if (connection.error) {
					const errorMessage = i18n.t("eventNoDestinationIdExtended", {
						eventId,
						ns: "services",
						error: connection.error,
					});

					LoggerService.error(namespaces.eventsService, errorMessage);

					return { data: "", error: connection.error };
				} else return { data: connection.data?.name, error: undefined };
			}
			const errorMessage = i18n.t("eventUnknownDestinationId", {
				eventId,
				ns: "services",
			});

			LoggerService.error(namespaces.eventsService, errorMessage);

			return { data: "", error: errorMessage };
		} catch (error) {
			LoggerService.error(
				namespaces.eventsService,
				i18n.t("fetchFailedForEvent", {
					eventId,
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}

	static async getSourceName(eventId: string): Promise<ServiceResponse<string>> {
		try {
			const { event } = await eventsClient.get({ eventId });
			if (!event) {
				return { data: undefined, error: undefined };
			}
			const eventConverted = convertEventProtoToModel(event);

			if (!eventConverted.destinationId) {
				const errorMessage = i18n.t("eventNoDestinationId", {
					eventId,
					ns: "services",
				});

				LoggerService.error(namespaces.eventsService, errorMessage);

				return { data: "", error: undefined };
			}

			if (eventConverted.destinationId.startsWith("trg_")) {
				const trigger = await TriggersService.get(eventConverted.destinationId);
				if (trigger.error) {
					const errorMessage = i18n.t("eventNoDestinationIdExtended", {
						eventId,
						ns: "services",
						error: trigger.error,
					});

					return { data: "", error: errorMessage };
				} else return { data: trigger.data?.sourceType, error: undefined };
			}

			if (eventConverted.destinationId.startsWith("con_")) {
				const connection = await ConnectionService.get(eventConverted.destinationId);
				if (connection.error) {
					const errorMessage = i18n.t("eventNoDestinationIdExtended", {
						eventId,
						ns: "services",
						error: connection.error,
					});

					LoggerService.error(namespaces.eventsService, errorMessage);

					return { data: "", error: connection.error };
				} else return { data: connection.data?.name, error: undefined };
			}
			const errorMessage = i18n.t("eventUnknownDestinationId", {
				eventId,
				ns: "services",
			});

			LoggerService.error(namespaces.eventsService, errorMessage);

			return { data: "", error: errorMessage };
		} catch (error) {
			LoggerService.error(
				namespaces.eventsService,
				i18n.t("fetchFailedForEvent", {
					eventId,
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}
}
