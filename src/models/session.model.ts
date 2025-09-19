import { t } from "i18next";

import { Session as ProtoSession } from "@ak-proto-ts/sessions/v1/session_pb";
import { Session, ViewerSession } from "@src/interfaces/models";
import { convertTimestampToDate, safeParseObjectProtoValue } from "@utilities";

function convertProtoSessionBase(protoSession: ProtoSession) {
	return {
		createdAt: convertTimestampToDate(protoSession.createdAt),
		inputs: safeParseObjectProtoValue(protoSession.inputs),
		memo: protoSession.memo || {},
		sessionId: protoSession.sessionId,
		state: protoSession.state,
		triggerName: protoSession.memo?.trigger_name,
		entrypoint: { ...protoSession.entrypoint },
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
		sourceType: protoSession.memo?.trigger_source_type || t("sessions.viewer.manualRun", { ns: "deployments" }),
		updatedAt: convertTimestampToDate(protoSession.updatedAt!),
	} as ViewerSession;
}
