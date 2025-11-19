export type SessionTriggerType = "webhook" | "schedule" | "connection" | "manual";

export const getSessionTriggerType = (memo: Record<string, string>): SessionTriggerType => {
	if (!memo || Object.keys(memo).length === 0) {
		return "manual";
	}

	const triggerSourceType = memo.trigger_source_type;

	if (triggerSourceType === "WEBHOOK") {
		return "webhook";
	}

	if (triggerSourceType === "SCHEDULE") {
		return "schedule";
	}

	if (triggerSourceType === "CONNECTION") {
		return "connection";
	}

	return "manual";
};
