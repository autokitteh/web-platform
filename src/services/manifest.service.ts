import { manifestApplyClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type/services.types";

export class ManifestService {
	static async applyManifest(manifestYaml: string): Promise<ServiceResponse<string>> {
		try {
			const { projectIds } = await manifestApplyClient.apply({ manifest: manifestYaml, path: "path" });
			if (!projectIds || !projectIds.length) {
				return { data: undefined, error: new Error("No projectIds returned") };
			}

			return { data: projectIds[0], error: undefined };
		} catch (error: unknown) {
			LoggerService.error(namespaces.manifestService, (error as Error).message);

			return { data: undefined, error };
		}
	}
}
