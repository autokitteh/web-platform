import i18n from "i18next";

import { variablesClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertVariableProtoToModel } from "@models/variable.model";
import { EnvironmentsService, LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Variable } from "@type/models";

export class VariablesService {
	static async delete({ name, scopeId }: { name: string; scopeId: string }): Promise<ServiceResponse<void>> {
		try {
			await variablesClient.delete({ names: [name], scopeId });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.variableService,
				i18n.t("variableRemoveFailedExtended", { name, ns: "services" })
			);

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
				i18n.t("variableGetFailedExtended", { error, name, ns: "services" })
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
				namespaces.variableService,
				i18n.t("errorFetchingVariablesByEnvironmentIdExtended", { envId, error, ns: "services" })
			);

			return { data: undefined, error };
		}
	}

	static async setByConnectiontId(
		connectionId: string,
		singleVariable: Variable
	): Promise<ServiceResponse<undefined>> {
		try {
			const { data: vars } = await this.list(connectionId);
			await variablesClient.set({ vars: [...(vars || []), { ...singleVariable, scopeId: connectionId }] });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.variableService,
				i18n.t("variableNotCreatedByConnectionIdExtended", {
					name: singleVariable.name,
					ns: "services",
					value: singleVariable.value,
					connectionId,
					error,
				})
			);

			return { data: undefined, error };
		}
	}

	static async setByProjectId(projectId: string, singleVariable: Variable): Promise<ServiceResponse<undefined>> {
		try {
			const { data: defaultEnvironment, error } = await EnvironmentsService.getDefaultEnvironment(projectId);

			if (error) {
				LoggerService.error(
					namespaces.variableService,
					i18n.t("variableNotCreatedByProjectIdExtended", {
						name: singleVariable.name,
						ns: "services",
						value: singleVariable.value,
						projectId,
						error,
					})
				);

				return { data: undefined, error };
			}

			await variablesClient.set({ vars: [{ ...singleVariable, scopeId: defaultEnvironment!.envId }] });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.variableService,
				i18n.t("variableNotCreatedByProjectIdExtended", {
					name: singleVariable.name,
					ns: "services",
					value: singleVariable.value,
					projectId,
					error,
				})
			);

			return { data: undefined, error };
		}
	}
}
