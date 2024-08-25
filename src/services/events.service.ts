import i18n from "i18next";

import { eventsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { convertEventProtoToModel } from "@src/models/event.model";
import { Event } from "@src/types/models/event.type";
import { ServiceResponse } from "@type";

export class EventsService {
	static async list(connectionId: string): Promise<ServiceResponse<Event[]>> {
		try {
			const { events } = await eventsClient.list({ connectionId });
			const eventsConverted = events.map((event) => convertEventProtoToModel(event));

			return { data: eventsConverted, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.deploymentsService,
				i18n.t("fetchFailedForEvents", {
					connectionId,
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}
}
