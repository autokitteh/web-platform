import { t } from "i18next";

import { eventsClient, dispatcherClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { convertAndEnrichEventProtoToModel, convertEventProtoToSimplifiedModel } from "@src/models/event.model";
import { BaseEvent, EnrichedEvent } from "@src/types/models/event.type";
import { ServiceResponse } from "@type";

export class EventsService {
	static async getEnriched(eventId: string): Promise<ServiceResponse<EnrichedEvent | undefined>> {
		try {
			const { event } = await eventsClient.get({ eventId, jsonValues: true });
			if (!event) {
				return { data: undefined, error: undefined };
			}
			const eventConverted = await convertAndEnrichEventProtoToModel(event);

			return { data: eventConverted, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.eventsService,
				t("fetchFailedForEvent", {
					eventId,
					error: new Error(error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}

	static async get(eventId: string): Promise<ServiceResponse<BaseEvent | undefined>> {
		try {
			const { event } = await eventsClient.get({ eventId, jsonValues: true });
			if (!event) {
				return { data: undefined, error: undefined };
			}

			return { data: convertEventProtoToSimplifiedModel(event), error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.eventsService,
				t("fetchFailedForEvent", {
					eventId,
					error: new Error(error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}

	static async list(
		limit?: number,
		destinationId?: string,
		projectId?: string,
		orgId?: string
	): Promise<ServiceResponse<BaseEvent[]>> {
		try {
			const { events } = await eventsClient.list({
				maxResults: limit,
				destinationId,
				projectId,
				orgId,
			});
			const eventsConverted = events.map(convertEventProtoToSimplifiedModel);

			return { data: eventsConverted, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.eventsService,
				t("fetchFailedForEventList", {
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}

	static async redispatch(eventId: string, deploymentId?: string): Promise<ServiceResponse<string>> {
		try {
			const { eventId: newEventId } = await dispatcherClient.redispatch({
				eventId,
				deploymentId,
			});

			return { data: newEventId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.eventsService,
				t("failedRedispatchEvent", {
					error: (error as Error).message,
					ns: "services",
				})
			);

			return { data: undefined, error };
		}
	}
}
