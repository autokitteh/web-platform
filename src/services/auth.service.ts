import { authClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertUserProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { User } from "@type/models";

export class AuthService {
	static async whoAmI(): Promise<ServiceResponse<User>> {
		try {
			const { user } = await authClient.whoAmI({});
			const convertedUser = convertUserProtoToModel(user);

			return { data: convertedUser, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.authService, new Error(error).message);

			return { data: undefined, error };
		}
	}
}
