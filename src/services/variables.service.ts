import { environmentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertVariableProtoToModel } from "@models/variable.model";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Variable } from "@type/models";
import i18n from "i18next";

export class VariablesService {
	static async create(singleVariable: Variable): Promise<ServiceResponse<string>> {
		try {
			await environmentsClient.setVar({ var: singleVariable });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				i18n.t("variableNotCreatedExtended", { name: singleVariable.name, value: singleVariable.value, ns: "services" })
			);
			return { data: undefined, error };
		}
	}

	static async list(envId: string): Promise<ServiceResponse<Variable[]>> {
		try {
			const { vars } = await environmentsClient.getVars({ envId });
			const variables = vars.map(convertVariableProtoToModel);

			return { data: variables, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.projectService,
				i18n.t("variablesNotFoundExtended", { id: envId, ns: "services" })
			);
			return { data: undefined, error };
		}
	}

	static async delete({ envId, name }: { envId: string; name: string }): Promise<ServiceResponse<void>> {
		try {
			await environmentsClient.removeVar({ envId, name });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.variableService, i18n.t("variableRemoveFailedExtended", { name, ns: "services" }));
			return { data: undefined, error };
		}
	}

	static async get(envId: string, name: string): Promise<ServiceResponse<TVariable>> {
		try {
			const { data: environmentVariables } = await this.list(envId);
			const variable = environmentVariables?.find((env) => env.name === name);

			return { data: variable, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.variableService, i18n.t("variableRemoveFailedExtended", { name, ns: "services" }));
			return { data: undefined, error };
		}
	}
}
