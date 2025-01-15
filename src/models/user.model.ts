import { User as ProtoUser } from "@ak-proto-ts/users/v1/user_pb";
import { User } from "@type/models";

export function convertUserProtoToModel(protoUser: ProtoUser): User {
	return {
		email: protoUser.email,
		name: protoUser.displayName,
		id: protoUser.userId,
		defaultOrganizationId: protoUser.defaultOrgId,
	};
}

export function reverseConvertUserProtoToModel(user: User): Partial<ProtoUser> {
	return {
		email: user.email,
		displayName: user.name,
		userId: user.id,
		defaultOrgId: user.defaultOrganizationId,
	};
}
