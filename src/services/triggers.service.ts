import { ConnectionService } from "./connection.service";
import { triggersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertTriggerProtoToModel } from "@models";
import { EnvironmentsService, LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Trigger } from "@type/models";
import i18n from "i18next";

export class TriggersService {
	static async create(projectId: string, trigger: Trigger): Promise<ServiceResponse<string>> {
		try {
			const { data: environments, error: envError } = await EnvironmentsService.listByProjectId(projectId);
			if (envError) {
				return { data: undefined, error: envError };
			}

			if (!environments?.length) {
				const errorMessage = i18n.t("errors.defaultEnvironmentNotFound");
				LoggerService.error(namespaces.projectService, errorMessage);
				return { data: undefined, error: new Error(errorMessage) };
			}

			const { connectionId, eventType, path, name } = trigger;

			const { triggerId } = await triggersClient.create({
				trigger: {
					triggerId: undefined,
					envId: environments[0].envId,
					connectionId,
					eventType,
					codeLocation: { path, name },
				},
			});

			if (!triggerId) {
				const errorMessage = i18n.t("errors.triggerNotCreated");
				LoggerService.error(namespaces.triggerService, "errorMessage");

				return { data: undefined, error: errorMessage };
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
				const errorMessage = i18n.t("errors.triggerNotFoundExtended", { triggerId });
				LoggerService.error(namespaces.triggerService, errorMessage);
				return { data: undefined, error: errorMessage };
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
				const errorMessage = i18n.t("errors.triggerNotFoundExtended", { triggerId: trigger.triggerId });
				LoggerService.error(namespaces.triggerService, errorMessage);
				return { data: undefined, error: errorMessage };
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
			const { data: connectionsList, error } = await ConnectionService.list();
			if (error) {
				LoggerService.error(namespaces.triggerService, (error as Error).message);
				return { data: undefined, error };
			}
			const enrhichedTriggers = convertedTriggers.map((trigger) => {
				const connection = connectionsList?.find((connection) => connection.connectionId === trigger.connectionId);
				return {
					...trigger,
					connectionName: connection?.name || i18n.t("errors.connectionNotFound"),
				};
			});

			return { data: enrhichedTriggers, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async delete(triggerId: string): Promise<ServiceResponse<void>> {
		try {
			const data = await triggersClient.delete({ triggerId });
			if (!data) {
				const errorMessage = i18n.t("errors.triggerRemoveFailedExtended", { triggerId });
				LoggerService.error(namespaces.triggerService, errorMessage);
				return { data: undefined, error: errorMessage };
			}
			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, (error as Error).message);
			return { data: undefined, error };
		}
	}
}
