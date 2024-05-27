import { User } from "@ak-proto-ts/users/v1/user_pb";
import { authClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";

export class AuthService {
	static async whoAmI(): Promise<ServiceResponse<User>> {
		try {
			const { user } = await authClient.whoAmI({});
			return { data: user, error: undefined };
		} catch (error) {
			LoggerService.error(
				namespaces.deploymentsService,
				"error"
				// i18n.t("buildInfoFetchFailedForBuild", { buildId, error: (error as Error).message, ns: "services" })
			);
			return { data: undefined, error };
		}
	}
}
