import { manifestApplyClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type/services.types";

export class ManifestService {
	static async applyManifest(
		manifestYaml: string,
		path: string
	): Promise<ServiceResponse<{ logs: string[]; projectIds: string[] }>> {
		try {
			const { logs, projectIds } = await manifestApplyClient.apply({ manifest: manifestYaml, path });
			return { data: { logs, projectIds }, error: undefined };
		} catch (error: unknown) {
			LoggerService.error(namespaces.manifestService, (error as Error).message);
			return { data: undefined, error };
		}
	}
}
