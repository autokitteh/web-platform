import i18n from "i18next";

import { usersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertUserProtoToModel } from "@models";
import { LoggerService } from "@services";
import { UserStatusType } from "@src/enums";
import { reverseUserStatusConverter } from "@src/models/utils";
import { ServiceResponse } from "@type";
import { User } from "@type/models";

export class UsersService {
	static async get({ email, userId }: { email?: string; userId?: string }): Promise<ServiceResponse<User>> {
		try {
			if (!userId && !email) {
				throw new Error(
					i18n.t("userIdentifierRequired", {
						ns: "services",
					})
				);
			}

			const { user } = await usersClient.get({
				userId,
				email,
			});

			if (!user) {
				return { data: undefined, error: undefined };
			}
			const convertedUser = convertUserProtoToModel(user);

			return { data: convertedUser, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("usersFetchErrorExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.usersService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async create(email: string): Promise<ServiceResponse<string>> {
		try {
			const { userId } = await usersClient.create({
				user: { email, status: reverseUserStatusConverter(UserStatusType.invited) },
			});
			if (!userId) {
				throw new Error(
					i18n.t("userNotCreated", {
						ns: "services",
					})
				);
			}

			return { data: userId, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("userNotCreatedExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.usersService, errorMessage);

			return { data: undefined, error };
		}
	}
}
