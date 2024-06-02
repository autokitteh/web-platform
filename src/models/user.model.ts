import { User as ProtoUser } from "@ak-proto-ts/users/v1/user_pb";
import { User } from "@type/models";

export function convertUserProtoToModel(protoUser: ProtoUser): User {
	return {
		firstName: protoUser.data?.firstName || "",
		id: protoUser.data?.id || "",
	};
}
