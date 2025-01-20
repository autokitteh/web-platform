import { UserStatus as ProtoUserStatus } from "@ak-proto-ts/users/v1/user_pb";
import { UserStatus, UserStatusType } from "@enums";
import { UserStatusKeyType } from "@src/interfaces/models";

export const userStatusConverter = (protoUserStatus?: ProtoUserStatus): UserStatusType => {
	if (!protoUserStatus) return UserStatusType.unspecified;

	const userStatus = ProtoUserStatus[protoUserStatus].toLowerCase();

	return UserStatusType[userStatus as UserStatusKeyType];
};

export const reverseUserStatusConverter = (userStatus?: UserStatusType): ProtoUserStatus => {
	if (!userStatus) {
		return ProtoUserStatus.UNSPECIFIED;
	}
	if (!(userStatus in UserStatus)) {
		return ProtoUserStatus.UNSPECIFIED;
	}
	const protoUserStatus = ProtoUserStatus[userStatus.toUpperCase() as keyof typeof ProtoUserStatus];

	return protoUserStatus;
};
