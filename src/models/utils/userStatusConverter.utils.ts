import { UserStatus as ProtoUserStatus } from "@ak-proto-ts/users/v1/user_pb";
import { UserStatus, UserStatusType } from "@enums";

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
