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
			const convertedUser = convertUserProtoToModel(user);

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

export async function descopeJwtLogin(token: string, apiBaseUrl: string) {
	const response = await fetch(`${apiBaseUrl}/auth/descope/login?jwt=${token}`, {
		credentials: "include",
		method: "GET",
	});

	if (!response.ok) {
		const errorText = await response.text();
		throw new Error(
			t("authenticationFailedExtended", {
				ns: "services",
				status: response.status,
				errorText,
			})
		);
	}

	return response;
}

export async function logoutBackend(apiBaseUrl: string) {
	await fetch(`${apiBaseUrl}/logout`, {
		credentials: "include",
		method: "GET",
	});
}
