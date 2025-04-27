import { Status, Status_Code } from "@ak-proto-ts/common/v1/status_pb";
import { Connection as ProtoConnection } from "@ak-proto-ts/connections/v1/connection_pb";
import { Connection, ConnectionStatusType } from "@type/models";

export const mapProtoStatusToConnectionStatus = (protoStatus?: Status): ConnectionStatusType => {
	if (!protoStatus) {
		return "ok";
	}

	const temporaryStatusMapping = protoStatus.code === Status_Code.UNSPECIFIED ? Status_Code.OK : protoStatus.code;

	switch (temporaryStatusMapping) {
		case Status_Code.OK:
			return "ok";
		case Status_Code.WARNING:
			return "warning";
		case Status_Code.ERROR:
			return "error";
		default:
			return "error";
	}
};

export const convertConnectionProtoToModel = (protoConnection: ProtoConnection): Connection => {
	return {
		connectionId: protoConnection.connectionId,
		initUrl: protoConnection.links?.init_url || "",
		integrationId: protoConnection.integrationId,
		name: protoConnection.name,
		status: mapProtoStatusToConnectionStatus(protoConnection.status),
		statusInfoMessage: protoConnection.status?.message || "",
		projectId: protoConnection.projectId,
	};
};
