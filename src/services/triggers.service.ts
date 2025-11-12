import { t } from "i18next";

import { triggersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertTriggerProtoToModel } from "@models";
import { LoggerService } from "@services";
import { reverseTriggerTypeConverter } from "@src/models/utils";
import { ServiceResponse } from "@type";
import { Trigger } from "@type/models";

export class TriggersService {
	static async create(projectId: string, trigger: Trigger): Promise<ServiceResponse<string>> {
		try {
			const {
				connectionId,
				entryFunction,
				eventType,
				filter,
				name,
				path,
				schedule,
				sourceType,
				timezone,
				isDurable,
				isSync,
			} = trigger;

			const { triggerId } = await triggersClient.create({
				trigger: {
					codeLocation: { name: entryFunction, path },
					connectionId,
					projectId,
					eventType,
					filter,
					name,
					triggerId: undefined,
					sourceType: reverseTriggerTypeConverter(sourceType),
					schedule,
					timezone,
					isDurable,
					isSync,
				},
			});

			return { data: triggerId, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.triggerService,
				t("triggerNotCreatedExtended", { error: (error as Error).message, ns: "services", projectId })
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
				t("triggerRemoveFailedExtended", { ns: "services", triggerId })
			);

			return { data: undefined, error };
		}
	}

	static async get(triggerId: string): Promise<ServiceResponse<Trigger>> {
		try {
			const { trigger } = await triggersClient.get({ triggerId });
			const convertedTrigger = convertTriggerProtoToModel(trigger!);

			return { data: convertedTrigger, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, t("triggerNotFoundExtended", { ns: "services", triggerId }));

			return { data: undefined, error };
		}
	}

	static async list(projectId: string): Promise<ServiceResponse<Trigger[]>> {
		try {
			const { triggers } = await triggersClient.list({ projectId });

			const convertedTriggers = triggers.map(convertTriggerProtoToModel);

			return { data: convertedTriggers, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.triggerService, t("triggersNotFound", { ns: "services" }));

			return { data: undefined, error };
		}
	}

	static async update(projectId: string, trigger: Trigger): Promise<ServiceResponse<void>> {
		try {
			const {
				connectionId,
				entryFunction,
				eventType,
				filter,
				name,
				path,
				schedule,
				sourceType,
				timezone,
				triggerId,
				webhookSlug,
				isDurable,
				isSync,
			} = trigger;

			await triggersClient.update({
				trigger: {
					sourceType: reverseTriggerTypeConverter(sourceType),
					schedule,
					timezone,
					webhookSlug,
					codeLocation: { name: entryFunction, path },
					connectionId,
					projectId,
					eventType,
					filter,
					name,
					triggerId,
					isDurable,
					isSync,
				},
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.triggerService,
				t("triggerNotUpdatedExtended", {
					error: (error as Error).message,
					ns: "services",
					triggerId: trigger.triggerId,
				})
			);

			return { data: undefined, error };
		}
	}
}
