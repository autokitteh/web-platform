import { triggerTypeConverter } from "./utils";
import { Trigger as ProtoTrigger } from "@ak-proto-ts/triggers/v1/trigger_pb";
import { Trigger } from "@type/models";

export const convertTriggerProtoToModel = (protoTrigger: ProtoTrigger): Trigger => ({
	webhookSlug: protoTrigger.webhookSlug,
	schedule: protoTrigger.schedule,
	timezone: protoTrigger.timezone,
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
	isDurable: protoTrigger?.isDurable,
	isSync: protoTrigger?.isSync,
});
