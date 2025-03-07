import { t } from "i18next";

import { buildsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";

export class BuildsService {
	static async getBuildDescription(buildId: string): Promise<ServiceResponse<string>> {
		try {
			const { descriptionJson } = await buildsClient.describe({ buildId });

			return { data: descriptionJson, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.buildService,
				t("buildInfoFetchFailedForBuild", { buildId, error: (error as Error).message, ns: "services" })
			);

			return { data: undefined, error };
		}
	}
}
