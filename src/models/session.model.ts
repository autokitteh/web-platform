import i18n from "i18next";

import { Session as ProtoSession } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionEntrypoint, ViewerSession } from "@src/types/models/session.type";
import { EntrypointTrigger, Session, Value } from "@type/models";
import { convertTimestampToDate, parseNestedJson } from "@utilities";
/**
 * Converts a ProtoSession object to a SessionType object.
 * @param protoSession The ProtoSession object to convert.
 * @returns The SessionType object.
 */
export function convertSessionProtoToModel(protoSession: ProtoSession): Session {
	return {
		createdAt: convertTimestampToDate(protoSession.createdAt!),
		deploymentId: protoSession.deploymentId,
		entrypoint: protoSession.entrypoint as unknown as EntrypointTrigger,
		inputs: parseNestedJson(protoSession.inputs as Value),
		sessionId: protoSession.sessionId,
		state: protoSession.state,
		triggerName: protoSession.memo.trigger_name,
		connectionName: protoSession.memo.connection_name,
	};
}
export function convertSessionProtoToViewerModel(
	protoSession: ProtoSession,
	sourceType?: string,
	destinationName?: string
): ViewerSession {
	const sourceTypeEnriched = sourceType ? sourceType : i18n.t("sessions.viewer.manualRun", { ns: "deployments" });

	return {
		buildId: protoSession.buildId,
		sourceType: sourceTypeEnriched,
		destinationName,
		createdAt: convertTimestampToDate(protoSession.createdAt),
		updatedAt: convertTimestampToDate(protoSession.updatedAt),
		entrypoint: protoSession.entrypoint as unknown as SessionEntrypoint,
		eventId: protoSession.eventId,
		inputs: parseNestedJson(protoSession.inputs as Value),
		sessionId: protoSession.sessionId,
		state: protoSession.state,
		triggerName: JSON.parse(protoSession?.inputs?.trigger?.string?.v || "{}")?.name || "",
		eventType: JSON.parse(protoSession?.inputs?.event?.string?.v || "{}")?.id || "",
	};
}
