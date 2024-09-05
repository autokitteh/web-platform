import { Trigger_SourceType as ProtoTriggerType } from "@ak-proto-ts/triggers/v1/trigger_pb";
import { TriggerTypes } from "@src/enums";
import { TriggerTypeKeyType } from "@src/types/models";

export const triggerTypeConverter = (triggerType: number): TriggerTypes | undefined => {
	if (!(triggerType in ProtoTriggerType)) {
		return;
	}
	const triggerTypeName = ProtoTriggerType[triggerType].toLowerCase();

	return TriggerTypes[triggerTypeName as TriggerTypeKeyType];
};
