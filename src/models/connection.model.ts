import { Connection as ProtoConnection } from "@ak-proto-ts/connections/v1/connection_pb";
import { ConnectionStatus } from "@enums";
import { Connection, ConnectionStatusType } from "@type/models";

export const convertConnectionProtoToModel = (protoConnection: ProtoConnection): Connection => {
	return {
		connectionId: protoConnection.connectionId,
		integrationId: protoConnection.integrationId,
		name: protoConnection.name,
		initUrl: protoConnection.links.init_url,
		status: ConnectionStatus[protoConnection.status!.code] as ConnectionStatusType,
		statusInfoMessage: protoConnection.status!.message,
	};
};
