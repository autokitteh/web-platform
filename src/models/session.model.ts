import { Session as ProtoSession } from "@ak-proto-ts/sessions/v1/session_pb";
import { Session, EntrypointTrigger } from "@type/models";
import { convertTimestampToDate } from "@utilities";

/**
 * Converts a ProtoSession object to a SessionType object.
 * @param protoSession The ProtoSession object to convert.
 * @returns The SessionType object.
 */
export function convertSessionProtoToModel(protoSession: ProtoSession): Session {
	return {
		sessionId: protoSession.sessionId,
		deploymentId: protoSession.deploymentId,
		state: protoSession.state,
		createdAt: convertTimestampToDate(protoSession.createdAt!),
		inputs: protoSession.inputs,
		entrypoint: protoSession.entrypoint as unknown as EntrypointTrigger,
	};
}
