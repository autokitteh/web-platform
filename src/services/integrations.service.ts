import { t } from "i18next";

import { integrationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { fitleredIntegrationsMap } from "@src/enums/components";
import { convertIntegrationProtoToModel } from "@src/models";
import { Integration } from "@src/types/models";
import { ServiceResponse } from "@type";

import { useCacheStore } from "@store";

export class IntegrationsService {
	static async list(): Promise<ServiceResponse<Integration[]>> {
		try {
			const cachedIntegrations = useCacheStore.getState().integrations;
			if (cachedIntegrations) {
				return { data: cachedIntegrations, error: undefined };
			}

			const { integrations } = await integrationsClient.list({});
			const integrationsConverted = integrations
				.map(convertIntegrationProtoToModel)
				.filter((integration) => Object.keys(fitleredIntegrationsMap).includes(integration.uniqueName));

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
