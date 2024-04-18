import { environmentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { TVariable } from "@type/models";
import i18n from "i18next";

export class VariablesService {
	static async create(singleVariable: TVariable): Promise<ServiceResponse<string>> {
		try {
			await environmentsClient.setVar({ var: singleVariable });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				i18n.t("variableNotCreatedExtended", { name: singleVariable.name, value: singleVariable.value })
			);
			return { data: undefined, error };
		}
	}

	static async list(envId: string): Promise<ServiceResponse<TVariable[]>> {
		try {
			const { vars } = await environmentsClient.getVars({ envId });

			return { data: vars, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.projectService, i18n.t("variablesNotFoundExtended", { id: envId }));
			return { data: undefined, error };
		}
	}

	static async delete({ envId, name }: { envId: string; name: string }): Promise<ServiceResponse<void>> {
		try {
			await environmentsClient.removeVar({ envId, name });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.variableService, i18n.t("variableRemoveFailedExtended", { name }));
			return { data: undefined, error };
		}
	}
}
