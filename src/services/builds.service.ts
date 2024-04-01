import { buildsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import i18n from "i18next";

export class BuildsService {
	static async getBuildDescription(buildId: string): Promise<ServiceResponse<{ descriptionJson: string }>> {
		try {
			const buildResponse = await buildsClient.describe({ buildId });
			return { data: buildResponse, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.deploymentsService,
				i18n.t("errors.buildInfoFetchFailedForBuild", { error: (error as Error).message, buildId: buildId })
			);
			return { data: undefined, error };
		}
	}
}
