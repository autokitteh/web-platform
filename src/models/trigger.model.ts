import { triggerTypeConverter } from "./utils";
import { Trigger as ProtoTrigger } from "@ak-proto-ts/triggers/v1/trigger_pb";
import { Trigger } from "@type/models";

/**
 * Converts a ProtoTrigger object to a TypeScript Trigger object.
 *
 * @param {ProtoTrigger} ProtoTrigger - The ProtoTrigger object to convert.
 * @returns {Trigger} The converted TypeScript Trigger object.
 */
export const convertTriggerProtoToModel = (protoTrigger: ProtoTrigger): Trigger => ({
	webhookSlug: protoTrigger.webhookSlug,
	schedule: protoTrigger.schedule,
	connectionId: protoTrigger.connectionId,
	sourceType: triggerTypeConverter(protoTrigger.sourceType),
	entryFunction: protoTrigger.codeLocation?.name,
	eventType: protoTrigger.eventType,
	filter: protoTrigger.filter,
	name: protoTrigger.name,
	path: protoTrigger.codeLocation?.path,
	triggerId: protoTrigger.triggerId,
	entrypoint: protoTrigger.codeLocation ? `${protoTrigger.codeLocation.path}:${protoTrigger.codeLocation.name}` : "",
	projectId: protoTrigger.projectId,
});
