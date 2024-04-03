import { environmentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { TVariable } from "@type/models";
import i18n from "i18next";

export class VariablesService {
	static async create(singleVariable: TVariable): Promise<ServiceResponse<string>> {
		try {
			const variable = await environmentsClient.setVar({ var: singleVariable });
			if (!variable) {
				LoggerService.error(namespaces.projectService, i18n.t("errors.variableNotCreated"));

				return { data: undefined, error: i18n.t("errors.variableNotCreated") };
			}
			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}

	static async list(envId: string): Promise<ServiceResponse<TVariable[]>> {
		try {
			const { vars } = await environmentsClient.getVars({ envId });
			if (!vars) {
				LoggerService.error(namespaces.projectService, i18n.t("errors.variableNotCreated"));

				return { data: undefined, error: i18n.t("errors.variableNotCreated") };
			}
			return { data: vars, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, (error as Error).message);
			return { data: undefined, error };
		}
	}
}
