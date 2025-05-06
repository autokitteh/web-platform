import { t } from "i18next";

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
			if (!user) {
				throw new Error(
					t("failedGettingLoggedInUser", {
						ns: "services",
					})
				);
			}

			const { data: token, error: tokenError } = await this.createToken();

			if (tokenError || !token) {
				throw new Error(
					t("failedGenerateUserJWTToken", {
						ns: "services",
					})
				);
			}
			const convertedUser = convertUserProtoToModel(user, token);

			return { data: convertedUser, error: undefined };
		} catch (error) {
			const errorMessage = t("accountFetchErrorExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.authService, errorMessage);

			return { data: undefined, error };
		}
	}
	static async createToken(): Promise<ServiceResponse<string>> {
		try {
			const { token } = await authClient.createToken({});

			return { data: token, error: undefined };
		} catch (error) {
			const errorMessage = t("tokenCreationErrorExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.authService, errorMessage);

			return { data: undefined, error };
		}
	}
}
