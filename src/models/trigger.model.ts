import { Trigger as ProtoTrigger } from "@ak-proto-ts/triggers/v1/trigger_pb";
import { Trigger } from "@type/models";

/**
 * Converts a ProtoTrigger object to a TypeScript Trigger object.
 *
 * @param {ProtoTrigger} ProtoTrigger - The ProtoTrigger object to convert.
 * @returns {Trigger} The converted TypeScript Trigger object.
 */
export const convertTriggerProtoToModel = (protoTrigger: ProtoTrigger): Trigger => {
	return {
		triggerId: protoTrigger.triggerId,
		connectionId: protoTrigger.connectionId,
		connectionName: "",
		eventType: protoTrigger.eventType,
		path: protoTrigger.codeLocation!.path,
		name: protoTrigger.codeLocation!.name,
		filter: protoTrigger.filter,
	};
};
