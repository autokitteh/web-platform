import { authClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertUserProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { User } from "@type/models";
import i18n from "i18next";

export class AuthService {
	static async whoAmI(): Promise<ServiceResponse<User>> {
		try {
			const { user } = await authClient.whoAmI({});
			if (!user) {
				const error = i18n.t("userNotFound", { ns: "services" });
				LoggerService.error(namespaces.authService, error);

				return { data: undefined, error };
			}
			const convertedUser = convertUserProtoToModel(user);
			return { data: convertedUser, error: undefined };
		} catch (error) {
			LoggerService.error(namespaces.authService, new Error(error).message);
			return { data: undefined, error };
		}
	}
}
