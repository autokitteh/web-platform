import i18n from "i18next";

import { environmentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services/logger.service";
import { Environment } from "@type/models";
import { ServiceResponse } from "@type/services.types";

export class EnvironmentsService {
	static async listByProjectId(projectId: string): Promise<ServiceResponse<Environment[]>> {
		try {
			const { envs: environments } = await environmentsClient.list({
				projectId,
			});

			return { data: environments, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("listEnvironmentsByProjectIdExtended", {
				error: (error as Error).message,
				projectId,
				ns: "services",
			});
			LoggerService.error(namespaces.environmentsService, errorMessage);

			return { data: undefined, error };
		}
	}
	static async getDefaultEnvironment(projectId: string): Promise<ServiceResponse<Environment>> {
		try {
			const { data: environments, error } = await this.listByProjectId(projectId);

			if (error) {
				return { data: undefined, error };
			}

			if (!environments?.length) {
				const errorMessage = i18n.t("environmentNotFoundExtended", { ns: "services", projectId });
				LoggerService.error(namespaces.environmentsService, errorMessage);

				return { data: undefined, error: errorMessage };
			}

			if (environments.length !== 1) {
				const errorMessage = i18n.t("multipleEnvironmentsFoundExtended", { ns: "services", projectId });
				LoggerService.error(namespaces.environmentsService, errorMessage);

				return { data: undefined, error: errorMessage };
			}

			return { data: environments[0], error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("issueFetchingDefaultEnvironment", {
				ns: "services",
				projectId,
				error: (error as Error).message,
			});
			LoggerService.error(namespaces.environmentsService, errorMessage);

			return { data: undefined, error };
		}
	}
}
