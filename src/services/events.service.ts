import i18n from "i18next";

import { eventsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { convertEventProtoToModel } from "@src/models/event.model";
import { Event } from "@src/types/models/event.type";
import { ServiceResponse } from "@type";

export class EventsService {
	static async get(eventId: string): Promise<ServiceResponse<Event>> {
		try {
			const { event } = await eventsClient.get({ eventId });
			const eventConverted = convertEventProtoToModel(event);

			return { data: eventConverted, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.deploymentsService,
				i18n.t("fetchFailedForEvent", {
					eventId,
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}
	static async list(): Promise<ServiceResponse<Event[]>> {
		try {
			const { events } = await eventsClient.list({ maxResults: 0, order: "DESC" });
			const eventsConverted = events.map(convertEventProtoToModel);

			return { data: eventsConverted, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.deploymentsService,
				i18n.t("fetchFailedForEvents", {
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}
}
