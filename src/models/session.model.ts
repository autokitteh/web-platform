import { Session as ProtoSession } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionEntrypoint, ViewerSession } from "@src/types/models/session.type";
import { EntrypointTrigger, Session } from "@type/models";
import { convertTimestampToDate } from "@utilities";
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
		inputs: protoSession.inputs,
		sessionId: protoSession.sessionId,
		state: protoSession.state,
	};
}
export function convertSessionProtoToViewerModel(protoSession: ProtoSession, sourceType?: string): ViewerSession {
	return {
		buildId: protoSession.buildId,
		sourceType,
		createdAt: convertTimestampToDate(protoSession.createdAt),
		updatedAt: convertTimestampToDate(protoSession.updatedAt),
		entrypoint: protoSession.entrypoint as unknown as SessionEntrypoint,
		eventId: protoSession.eventId,
		inputs: protoSession.inputs,
		sessionId: protoSession.sessionId,
		state: protoSession.state,
		triggerName: JSON.parse(protoSession?.inputs?.trigger?.string?.v || "{}")?.name || "",
		eventType: JSON.parse(protoSession?.inputs?.event?.string?.v || "{}")?.id || "",
	};
}
