import { ConnectError } from "@connectrpc/connect";
import { t } from "i18next";

import { usersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertUserProtoToModel } from "@models";
import { AuthService, LoggerService } from "@services";
import { UserStatusType } from "@src/enums";
import { reverseConvertUserModelToProto } from "@src/models/user.model";
import { reverseUserStatusConverter } from "@src/models/utils";
import { ServiceResponse } from "@type";
import { User } from "@type/models";

export class UsersService {
	static async get({ email, userId }: { email?: string; userId?: string }): Promise<ServiceResponse<User>> {
		try {
			if (!userId && !email) {
				throw new Error(
					t("userIdentifierRequired", {
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

			const { data: token, error: tokenError } = await AuthService.createToken();

			if (tokenError || !token) {
				return { data: undefined, error: tokenError || t("failedGenerateUserJWTToken", { ns: "services" }) };
			}

			const convertedUser = convertUserProtoToModel(user, token);

			return { data: convertedUser, error: undefined };
		} catch (error) {
			if (error instanceof ConnectError && error.code === 5) {
				return { data: undefined, error: undefined };
			}
			const errorMessage = t("usersFetchErrorExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.usersService, errorMessage);

			return { data: undefined, error: new Error(errorMessage) };
		}
	}

	static async create(email: string, status: UserStatusType): Promise<ServiceResponse<string>> {
		try {
			const { userId } = await usersClient.create({
				user: { email, status: reverseUserStatusConverter(status) },
			});
			if (!userId) {
				throw new Error(
					t("userNotCreated", {
						ns: "services",
					})
				);
			}

			return { data: userId, error: undefined };
		} catch (error) {
			const errorMessage = t("userCreationFailedExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.usersService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async update(user: User, fieldMaskPathsArray: string[]): Promise<ServiceResponse<string>> {
		try {
			await usersClient.update({
				user: reverseConvertUserModelToProto(user),
				fieldMask: { paths: fieldMaskPathsArray },
			});

			return { data: undefined, error: undefined };
		} catch (error) {
			const errorMessage = t("userUpdatingFailedExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.usersService, errorMessage);

			return { data: undefined, error };
		}
	}
}
