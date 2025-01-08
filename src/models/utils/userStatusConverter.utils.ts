import { UserStatus as ProtoUserStatus } from "@ak-proto-ts/users/v1/user_pb";
import { UserStatus, UserStatusType } from "@enums";
import { UserStatusKeyType } from "@src/interfaces/models";

export const userStatusConverter = (protoUserStatus: ProtoUserStatus): UserStatus => {
	const userStatus = ProtoUserStatus[protoUserStatus].toLowerCase();

	return UserStatus[userStatus as UserStatusKeyType];
};

export const reverseUserStatusConverter = (userStatus?: UserStatusType): number | undefined => {
	if (!userStatus) {
		return;
	}
	if (!(userStatus in UserStatus)) {
		return;
	}
	const protoUserStatus = ProtoUserStatus[userStatus.toUpperCase() as keyof typeof ProtoUserStatus];

	return protoUserStatus;
};
