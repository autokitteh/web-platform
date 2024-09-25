import { User as ProtoUser } from "@ak-proto-ts/users/v1/user_pb";
import { User } from "@type/models";

export function convertUserProtoToModel(protoUser: ProtoUser | undefined): User {
	return {
		email: protoUser?.data?.email || "",
		name: protoUser?.data?.name || "",
	};
}
