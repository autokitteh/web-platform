import i18n from "i18next";

import { Session as ProtoSession } from "@ak-proto-ts/sessions/v1/session_pb";
import { Session, ViewerSession } from "@src/interfaces/models";
import { Value } from "@src/types/models";
import { convertTimestampToDate, parseNestedJson } from "@utilities";

function convertProtoSessionBase(protoSession: ProtoSession) {
	return {
		createdAt: convertTimestampToDate(protoSession.createdAt),
		inputs: parseNestedJson(protoSession.inputs as Value),
		sessionId: protoSession.sessionId,
		state: protoSession.state,
		triggerName: protoSession.memo?.trigger_name,
		entrypoint: {
			col: protoSession.entrypoint?.col,
			name: protoSession.entrypoint?.name,
			path: protoSession.entrypoint?.path,
			row: protoSession.entrypoint?.row,
		},
	};
}

export function convertSessionProtoToModel(protoSession: ProtoSession): Session {
	const baseSession = convertProtoSessionBase(protoSession);

	return {
		...baseSession,
		deploymentId: protoSession.deploymentId,
		connectionName: protoSession.memo?.connection_name,
	} as Session;
}

export function convertSessionProtoToViewerModel(protoSession: ProtoSession): ViewerSession {
	const baseSession = convertProtoSessionBase(protoSession);

	return {
		...baseSession,
		buildId: protoSession.buildId,
		eventId: protoSession.eventId,
		sourceType:
			protoSession.memo?.trigger_source_type || i18n.t("sessions.viewer.manualRun", { ns: "deployments" }),
		updatedAt: convertTimestampToDate(protoSession.updatedAt!),
	} as ViewerSession;
}
