import { Trigger as ProtoTrigger } from "@ak-proto-ts/triggers/v1/trigger_pb";
import { Trigger } from "@type/models";
import { get, keys } from "lodash";

/**
 * Converts a ProtoTrigger object to a TypeScript Trigger object.
 *
 * @param {ProtoTrigger} ProtoTrigger - The ProtoTrigger object to convert.
 * @returns {Trigger} The converted TypeScript Trigger object.
 */
export const convertTriggerProtoToModel = (protoTrigger: ProtoTrigger): Trigger => {
	const keyData = keys(get(protoTrigger, "data"))[0] || "";
	const valueData = get(protoTrigger, ["data", keyData, "string", "v"], "");

	return {
		triggerId: protoTrigger.triggerId,
		connectionId: protoTrigger.connectionId,
		connectionName: "",
		eventType: protoTrigger.eventType,
		path: protoTrigger.codeLocation!.path,
		name: protoTrigger.codeLocation!.name,
		filter: protoTrigger.filter,
		data: { [keyData]: { string: { v: valueData } } },
	};
};
