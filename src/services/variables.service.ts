import { variablesClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertVariableProtoToModel } from "@models/variable.model";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Variable } from "@type/models";
import i18n from "i18next";

export class VariablesService {
	static async set(singleVariable: Variable): Promise<ServiceResponse<string>> {
		try {
			await variablesClient.set({ vars: [singleVariable] });

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
			const { vars } = await variablesClient.get({ scopeId: envId });
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

	static async delete({ name }: { name: string }): Promise<ServiceResponse<void>> {
		try {
			await variablesClient.delete({ names: [name] });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.variableService, i18n.t("variableRemoveFailedExtended", { name, ns: "services" }));
			return { data: undefined, error };
		}
	}

	static async get(envId: string, name: string): Promise<ServiceResponse<Variable>> {
		try {
			const { data: environmentVariables } = await this.list(envId);
			const variable = environmentVariables?.find((env) => env.name === name);

			return { data: variable, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.variableService,
				i18n.t("variableGetFailedExtended", { name, error, ns: "services" })
			);
			return { data: undefined, error };
		}
	}
}
