import { ConnectionService } from "./connection.service";
import { triggersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertTriggerProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Trigger } from "@type/models";
import { flattenArray } from "@utilities/index";
import i18n from "i18next";
import { get } from "lodash";

export class TriggersService {
	static async create(trigger: Trigger): Promise<ServiceResponse<string>> {
		try {
			const { triggerId } = await triggersClient.create({ trigger });
			if (!triggerId) {
				LoggerService.error(namespaces.triggerService, i18n.t("errors.triggerNotCreated"));

				return { data: undefined, error: i18n.t("errors.triggerNotCreated") };
			}
			return { data: triggerId, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async get(triggerId: string): Promise<ServiceResponse<Trigger>> {
		try {
			const { trigger } = await triggersClient.get({ triggerId });
			if (!trigger) {
				LoggerService.error(namespaces.triggerService, i18n.t("errors.triggerNotFound"));

				return { data: undefined, error: i18n.t("errors.triggerNotFound") };
			}
			const convertedTrigger = convertTriggerProtoToModel(trigger);
			const { data: connection } = await ConnectionService.get(convertedTrigger.connectionId);
			const triggerData = {
				...convertedTrigger,
				connectionName: connection?.name,
			} as Trigger;
			return { data: triggerData, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async update(trigger: Trigger): Promise<ServiceResponse<void>> {
		try {
			const data = await triggersClient.update({ trigger });
			if (!data) {
				LoggerService.error(namespaces.triggerService, i18n.t("errors.triggerNotFound"));
				return { data: undefined, error: i18n.t("errors.triggerNotFound") };
			}
			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async list(): Promise<ServiceResponse<Trigger[]>> {
		try {
			const { triggers } = await triggersClient.list({});
			const convertedTriggers = triggers.map(convertTriggerProtoToModel);
			const triggerPromises = (convertedTriggers || []).map(async (trigger) => {
				const { data: connection } = await ConnectionService.get(trigger.connectionId);
				return {
					...trigger,
					connectionName: connection!.name,
				};
			});

			const triggerResponses = await Promise.allSettled(triggerPromises);

			const triggerResult = flattenArray<Trigger>(
				triggerResponses
					.filter((response) => response.status === "fulfilled")
					.map((response) => get(response, "value", []))
			);

			console.log("triggerResult", triggerResult);

			return { data: triggerResult, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async delete(triggerId: string): Promise<ServiceResponse<void>> {
		try {
			const data = await triggersClient.delete({ triggerId });
			if (!data) {
				LoggerService.error(namespaces.triggerService, i18n.t("errors.triggerNotFound"));
				return { data: undefined, error: i18n.t("errors.triggerNotFound") };
			}
			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, (error as Error).message);
			return { data: undefined, error };
		}
	}
}
