import { Trigger as ProtoTrigger } from "@ak-proto-ts/triggers/v1/trigger_pb";
import { Trigger, TriggerData } from "@type/models";
import { get } from "lodash";

/**
 * Converts a ProtoTrigger object to a TypeScript Trigger object.
 *
 * @param {ProtoTrigger} ProtoTrigger - The ProtoTrigger object to convert.
 * @returns {Trigger} The converted TypeScript Trigger object.
 */
export const convertTriggerProtoToModel = (protoTrigger: ProtoTrigger): Trigger => {
	const keyData = Object.keys(protoTrigger.data);
	const data: TriggerData = {};

	keyData.forEach((key: string) => {
		const valueData = get(protoTrigger, ["data", key, "string", "v"]);
		data[key] = { string: { v: valueData } };
	});

	return {
		connectionId: protoTrigger.connectionId,
		data,
		entryFunction: protoTrigger.codeLocation!.name,
		eventType: protoTrigger.eventType,
		filter: protoTrigger.filter,
		name: protoTrigger.name,
		path: protoTrigger.codeLocation!.path,
		triggerId: protoTrigger.triggerId,
	};
};
