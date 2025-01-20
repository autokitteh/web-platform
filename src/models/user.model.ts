import { User as ProtoUser } from "@ak-proto-ts/users/v1/user_pb";
import { userStatusConverter, reverseUserStatusConverter } from "@models/utils/userStatusConverter.utils";
import { User } from "@type/models";

export function convertUserProtoToModel(protoUser: ProtoUser): User {
	return {
		email: protoUser.email,
		name: protoUser.displayName,
		id: protoUser.userId,
		defaultOrganizationId: protoUser.defaultOrgId,
		status: userStatusConverter(protoUser.status),
	};
}

export function reverseConvertUserModelToProto(user: User): Partial<ProtoUser> {
	return {
		userId: user.id,
		displayName: user.name,
		email: user.email,
		defaultOrgId: user.defaultOrganizationId,
		status: reverseUserStatusConverter(user.status),
	};
}
