import { TriggerTypeKeyType } from "@types/models";

import { Trigger_SourceType as ProtoTriggerType } from "@ak-proto-ts/triggers/v1/trigger_pb";
import { TriggerTypes } from "@enums";

export const triggerTypeConverter = (triggerType: number): TriggerTypes | undefined => {
	if (!(triggerType in ProtoTriggerType)) {
		return;
	}
	const triggerTypeName = ProtoTriggerType[triggerType].toLowerCase();

	return TriggerTypes[triggerTypeName as TriggerTypeKeyType];
};

export const reverseTriggerTypeConverter = (triggerType?: TriggerTypeKeyType): number | undefined => {
	if (!triggerType) {
		return;
	}
	if (!(triggerType in TriggerTypes)) {
		return;
	}
	const sessionStateType = ProtoTriggerType[triggerType.toUpperCase() as keyof typeof ProtoTriggerType];

	return sessionStateType;
};
