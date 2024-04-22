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
			const { data: environments, error } = await EnvironmentsService.listByProjectId(projectId);

			if (error) {
				LoggerService.error(
					namespaces.triggerService,
					i18n.t("defaulEnvironmentNotFoundExtended", { projectId, ns: "services" })
				);
				return { data: undefined, error };
			}

			const { connectionId, eventType, path, name, filter, data } = trigger;

			const { triggerId } = await triggersClient.create({
				trigger: {
					triggerId: undefined,
					envId: environments && environments[0].envId,
					connectionId,
					eventType,
					filter,
					codeLocation: { path, name },
					data,
				},
			});

			return { data: triggerId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.triggerService,
				i18n.t("triggerNotCreatedExtended", { projectId, error: (error as Error).message, ns: "services" })
			);
			return { data: undefined, error };
		}
	}

	static async get(triggerId: string): Promise<ServiceResponse<Trigger>> {
		try {
			const { trigger } = await triggersClient.get({ triggerId });
			const convertedTrigger = convertTriggerProtoToModel(trigger!);
			const { data: connection } = await ConnectionService.get(convertedTrigger.connectionId);
			const triggerData = {
				...convertedTrigger,
				connectionName: connection?.name,
			} as Trigger;
			return { data: triggerData, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, i18n.t("triggerNotFoundExtended", { triggerId, ns: "services" }));
			return { data: undefined, error };
		}
	}

	static async update(projectId: string, trigger: Trigger): Promise<ServiceResponse<void>> {
		try {
			const { data: environments, error } = await EnvironmentsService.listByProjectId(projectId);

			if (error) {
				LoggerService.error(
					namespaces.triggerService,
					i18n.t("errors.defaultEnvironmentNotFoundExtended", { projectId })
				);
				return { data: undefined, error };
			}

			const { triggerId, connectionId, eventType, path, name, filter, data } = trigger;

			await triggersClient.update({
				trigger: {
					triggerId,
					connectionId,
					envId: environments && environments[0].envId,
					eventType,
					filter,
					codeLocation: { path, name },
					data,
				},
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.triggerService,
				i18n.t("triggerNotUpdatedExtended", { triggerId: trigger.triggerId, ns: "services" })
			);
			return { data: undefined, error };
		}
	}

	static async listByProjectId(projectId: string): Promise<ServiceResponse<Trigger[]>> {
		try {
			const { data: environments, error: errorEnvs } = await EnvironmentsService.listByProjectId(projectId);

			if (errorEnvs) {
				LoggerService.error(
					namespaces.triggerService,
					i18n.t("errors.defaultEnvironmentNotFoundExtended", { projectId })
				);
				return { data: undefined, error: errorEnvs };
			}

			const { triggers } = await triggersClient.list({ envId: environments && environments[0].envId });

			const convertedTriggers = triggers.map(convertTriggerProtoToModel);
			const { data: connectionsList, error } = await ConnectionService.listByProjectId(projectId);
			if (error) {
				LoggerService.error(namespaces.triggerService, i18n.t("triggersNotFound", { ns: "services" }));
				return { data: undefined, error };
			}
			const enrhichedTriggers = convertedTriggers.map((trigger) => {
				const connection = connectionsList?.find((connection) => connection.connectionId === trigger.connectionId);
				return {
					...trigger,
					connectionName: connection?.name || i18n.t("connectionNotFound", { ns: "services" }),
				};
			});

			return { data: enrhichedTriggers, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, i18n.t("triggersNotFound", { ns: "services" }));
			return { data: undefined, error };
		}
	}

	static async delete(triggerId: string): Promise<ServiceResponse<void>> {
		try {
			await triggersClient.delete({ triggerId });
			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.triggerService,
				i18n.t("triggerRemoveFailedExtended", { triggerId, ns: "services" })
			);
			return { data: undefined, error };
		}
	}
}
