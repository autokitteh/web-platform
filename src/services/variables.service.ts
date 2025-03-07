import { t } from "i18next";

import { variablesClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertVariableProtoToModel } from "@models/variable.model";
import { LoggerService } from "@services";
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
				t("variableRemoveFailedExtended", { name, ns: "services" })
			);

			return { data: undefined, error };
		}
	}

	static async get(scopeId: string, name: string): Promise<ServiceResponse<Variable>> {
		try {
			const { vars } = await variablesClient.get({ scopeId, names: [name] });

			if (!vars || !vars.length) {
				return { data: undefined, error: undefined };
			}

			if (vars.length > 1) {
				const lenghtErrorMessage = t("variableGetMultipleFound", { name, ns: "services" });
				LoggerService.error(namespaces.variableService, lenghtErrorMessage);

				return { data: undefined, error: lenghtErrorMessage };
			}

			return { data: vars[0], error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.variableService,
				t("variableGetFailedExtended", { error, name, ns: "services" })
			);

			return { data: undefined, error };
		}
	}

	static async list(scopeId: string): Promise<ServiceResponse<Variable[]>> {
		try {
			const { vars } = await variablesClient.get({ scopeId });

			const variables = vars.map(convertVariableProtoToModel);

			return { data: variables, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.variableService,
				t("errorFetchingVariables", { scopeId, error, ns: "errors" })
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
				t("variableNotCreatedByConnectionIdExtended", {
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
			await variablesClient.set({ vars: [{ ...singleVariable, scopeId: projectId }] });

			return { data: undefined, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.variableService,
				t("variableNotCreatedByProjectIdExtended", {
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
