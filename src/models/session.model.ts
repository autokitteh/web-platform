import { Session as ProtoSession } from "@ak-proto-ts/sessions/v1/session_pb";
import { ViewerSession } from "@src/types/models/session.type";
import { Connection, EntrypointTrigger, Session } from "@type/models";
import { Event } from "@type/models/event.type";
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
export function convertSessionProtoToViewerModel(protoSession: ProtoSession, connectionName: string): ViewerSession {
	return {
		buildId: protoSession.buildId,
		connectionName,
		createdAt: convertTimestampToDate(protoSession.createdAt),
		updatedAt: convertTimestampToDate(protoSession.updatedAt),
		entrypoint: protoSession.entrypoint as unknown as EntrypointTrigger,
		eventId: protoSession.eventId,
		inputs: protoSession.inputs,
		sessionId: protoSession.sessionId,
		state: protoSession.state,
		triggerName: protoSession?.inputs?.trigger?.struct?.fields?.name?.string?.v || "",
		eventType: protoSession?.inputs?.event?.struct?.fields?.type?.string?.v || "",
	};
}
