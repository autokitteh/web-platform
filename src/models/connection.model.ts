import { Connection as ProtoConnection } from "@ak-proto-ts/connections/v1/connection_pb";
import { Connection } from "@type/models";

export const convertConnectionProtoToModel = (protoConnection: ProtoConnection): Connection => {
	return {
		connectionId: protoConnection.connectionId,
		name: protoConnection.name,
	};
};
