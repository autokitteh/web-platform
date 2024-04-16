import { environmentsClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services/logger.service";
import { TEnvironment } from "@type/models";
import { ServiceResponse } from "@type/services.types";

export class EnvironmentsService {
	static async listByProjectId(projectId: string): Promise<ServiceResponse<TEnvironment[]>> {
		try {
			const { envs: environments } = await environmentsClient.list({
				projectId,
			});
			return { data: environments, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.environmentsService, (error as Error).message);

			return { data: undefined, error };
		}
	}
}
