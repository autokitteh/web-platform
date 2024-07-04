import { Session as ProtoSession } from "@ak-proto-ts/sessions/v1/session_pb";
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
