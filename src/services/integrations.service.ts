import { t } from "i18next";

import { integrationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { convertIntegrationProtoToModel } from "@src/models";
import { Integration } from "@src/types/models";
import { ServiceResponse } from "@type";

export class IntegrationsService {
	static async list(): Promise<ServiceResponse<Integration[]>> {
		try {
			const { integrations } = await integrationsClient.list({});
			const integrationsConverted = integrations.map(convertIntegrationProtoToModel);

			return { data: integrationsConverted, error: undefined };
		} catch (error) {
			const errorMessage = t("intergrationsNotFoundExtendedError", {
				ns: "services",
				error: new Error(error).message,
			});

			LoggerService.error(namespaces.integrationService, errorMessage);

			return {
				data: undefined,
				error: errorMessage,
			};
		}
	}
}
