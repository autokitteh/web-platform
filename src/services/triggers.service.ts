import { Trigger } from "@ak-proto-ts/triggers/v1/trigger_pb";
import { triggersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertTriggerProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Trigger as TriggerModel } from "@type/models";
import i18n from "i18next";

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
			return { data: trigger, error: undefined };
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

	static async list(): Promise<ServiceResponse<TriggerModel[]>> {
		try {
			const triggers = (await triggersClient.list({})).triggers.map(convertTriggerProtoToModel);
			return { data: triggers, error: undefined };
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
