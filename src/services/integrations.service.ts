import { t } from "i18next";

import { integrationsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertIntegrationProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { Integration } from "@type/models";

import { useCacheStore } from "@store";

export class IntegrationsService {
	static async list(): Promise<ServiceResponse<Integration[]>> {
		try {
			const cachedIntegrations = useCacheStore.getState().integrations;
			if (cachedIntegrations) {
				return { data: cachedIntegrations, error: undefined };
			}

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
