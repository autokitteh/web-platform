import i18n from "i18next";

import { User as ProtoUser } from "@ak-proto-ts/users/v1/user_pb";
import { usersClient } from "@api/grpc/clients.grpc.api";
import { namespaces } from "@constants";
import { convertUserProtoToModel, reverseConvertUserProtoToModel } from "@models";
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
				throw new Error(
					i18n.t("userNotFound", {
						ns: "services",
					})
				);
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

	static async create(email: string, status: UserStatusType): Promise<ServiceResponse<string>> {
		try {
			const { userId } = await usersClient.create({
				user: { email, status: reverseUserStatusConverter(status) },
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
			const errorMessage = i18n.t("userCreationFailedExtended", {
				ns: "services",
				error: new Error(error).message,
			});
			LoggerService.error(namespaces.usersService, errorMessage);

			return { data: undefined, error };
		}
	}

	static async update(user: User, fieldsToUpdate: string[]): Promise<ServiceResponse<void>> {
		try {
			for (const field of fieldsToUpdate) {
				if (!Object.prototype.hasOwnProperty.call(ProtoUser.fields, field)) {
					const errorMessage = i18n.t("userUpdateErrorExtended", {
						ns: "services",
						user: JSON.stringify(user),
						fieldMask: fieldsToUpdate.join(", "),
					});
					LoggerService.error(namespaces.usersService, errorMessage);

					return {
						data: undefined,
						error: i18n.t("userUpdateError", {
							ns: "services",
						}),
					};
				}
			}
			const protoUser = reverseConvertUserProtoToModel(user);
			await usersClient.update({ user: protoUser, fieldMask: { paths: fieldsToUpdate } });

			return { data: undefined, error: undefined };
		} catch (error) {
			const errorMessage = i18n.t("userUpdateErrorExtendedCatch", {
				ns: "services",
				error: new Error(error).message,
				user: JSON.stringify(user),
				fieldMask: fieldsToUpdate.join(", "),
			});
			LoggerService.error(namespaces.usersService, errorMessage);

			return { data: undefined, error };
		}
	}
}
