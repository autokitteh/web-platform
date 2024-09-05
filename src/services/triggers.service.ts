import i18n from "i18next";

import { triggersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertTriggerProtoToModel } from "@models";
import { EnvironmentsService, LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Trigger } from "@type/models";

export class TriggersService {
	static async create(projectId: string, trigger: Trigger): Promise<ServiceResponse<string>> {
		try {
			const { data: defaultEnvironment, error } = await EnvironmentsService.getDefaultEnvironment(projectId);

			if (error) {
				return { data: undefined, error };
			}

			const { connectionId, entryFunction, eventType, filter, name, path } = trigger;

			const { triggerId } = await triggersClient.create({
				trigger: {
					codeLocation: { name: entryFunction, path },
					connectionId,
					envId: defaultEnvironment!.envId,
					eventType,
					filter,
					name,
					triggerId: undefined,
				},
			});

			return { data: triggerId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.triggerService,
				i18n.t("triggerNotCreatedExtended", { error: (error as Error).message, ns: "services", projectId })
			);

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
				i18n.t("triggerRemoveFailedExtended", { ns: "services", triggerId })
			);

			return { data: undefined, error };
		}
	}

	static async get(triggerId: string): Promise<ServiceResponse<Trigger>> {
		try {
			const { trigger } = await triggersClient.get({ triggerId });
			const convertedTrigger = convertTriggerProtoToModel(trigger!);

			const triggerData = {
				...convertedTrigger,
				connectionName: "",
			} as Trigger;

			return { data: triggerData, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				i18n.t("triggerNotFoundExtended", { ns: "services", triggerId })
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

			const enrhichedTriggers = convertedTriggers.map((trigger) => {
				return {
					...trigger,
					connectionName: "",
				};
			});

			return { data: enrhichedTriggers, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, i18n.t("triggersNotFound", { ns: "services" }));

			return { data: undefined, error };
		}
	}

	static async update(projectId: string, trigger: Trigger): Promise<ServiceResponse<void>> {
		try {
			const { data: environments, error } = await EnvironmentsService.listByProjectId(projectId);

			if (error) {
				LoggerService.error(
					namespaces.triggerService,
					i18n.t("defaultEnvironmentNotFoundExtended", { projectId, ns: "services" })
				);

				return { data: undefined, error };
			}

			if (!environments?.length) {
				return { data: undefined, error: i18n.t("environmentNotFound", { ns: "services" }) };
			}

			if (environments.length !== 1) {
				return { data: undefined, error: i18n.t("multipleEnvironments", { ns: "services" }) };
			}

			const { connectionId, entryFunction, eventType, filter, name, path, triggerId } = trigger;

			await triggersClient.update({
				trigger: {
					codeLocation: { name: entryFunction, path },
					connectionId,
					envId: environments && environments[0].envId,
					eventType,
					filter,
					name,
					triggerId,
				},
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.triggerService,
				i18n.t("triggerNotUpdatedExtended", {
					error: (error as Error).message,
					ns: "services",
					triggerId: trigger.triggerId,
				})
			);

			return { data: undefined, error };
		}
	}
}
