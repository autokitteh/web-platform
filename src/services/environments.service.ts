import { environmentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services/logger.service";
import { TEnvironment } from "@type/models";
import { ServiceResponse } from "@type/services.types";
import i18n from "i18next";

export class EnvironmentsService {
	static async listByProjectId(projectId: string): Promise<ServiceResponse<TEnvironment[]>> {
		try {
			const { envs } = await environmentsClient.list({
				projectId,
			});

			return { data: envs, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.environmentsService, i18n.t("errors.environmentsNotFoundExtended", { projectId }));

			return { data: undefined, error };
		}
	}
}
