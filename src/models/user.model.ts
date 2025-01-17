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
