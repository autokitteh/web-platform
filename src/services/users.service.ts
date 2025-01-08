import i18n from "i18next";

import { usersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertUserProtoToModel } from "@models";
import { LoggerService } from "@services";
import { ServiceResponse } from "@type";
import { User } from "@type/models";

export class UsersService {
	static async get(userId: string): Promise<ServiceResponse<User>> {
		try {
			const { user } = await usersClient.get({ userId });
			if (!user) {
				throw new Error(
					i18n.t("userNotFound", {
						ns: "services",
					})
				);
			}
			const convertedUser = convertUserProtoToModel(user);

			return { data: convertedUser, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("accountFetchErrorExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.authService, errorMessage);

			return { data: undefined, error };
		}
	}
}
