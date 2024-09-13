import i18n from "i18next";

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
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
		} catch (error) {
			const errorMessage = i18n.t("intergrationsNotFound", { ns: "services" });
			LoggerService.error(namespaces.integrationService, errorMessage);

			return {
				data: undefined,
				error: new Error(errorMessage),
			};
		}
	}
}
