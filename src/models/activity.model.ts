import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { ActivityState } from "@src/enums";
import { SessionActivity } from "@src/types/models";
import { convertTimestampToEpoch } from "@src/utilities/convertTimestampToDate.utils";
import { convertTimestampToDate } from "@utilities";

/**
 * Converts a ProtoSessionLogRecords array to an Activities array.
 * @param protoSession The ProtoSessionLogRecords object to convert.
 * @returns The SessionActivity array.
 */
export function convertSessionLogRecordsProtoToActivitiesModel(
	ProtoSessionLogRecords: ProtoSessionLogRecord[]
): SessionActivity[] {
	const activities = [];
	let currentActivity: SessionActivity | null = null;

	for (let i = ProtoSessionLogRecords.length - 1; i >= 0; i--) {
		const log = ProtoSessionLogRecords[i];
		const { callAttemptComplete, callAttemptStart, callSpec, state } = log;

		if (callSpec) {
			if (currentActivity) {
				activities.push(currentActivity);
			}
			const paramNames = callSpec?.function?.function?.desc?.input.map((param) =>
				param.optional ? `${param.name}?` : param.name
			);

			const kwargs = JSON.parse(callSpec?.kwargs?.params?.string?.v || "{}");

			const args = callSpec.args
				.map((arg) => (arg.string ? arg.string.v : null))
				.filter((arg) => arg !== null) as string[];

			currentActivity = {
				functionName: `${callSpec?.function?.function?.name}(${paramNames?.join(", ")})`,
				args,
				kwargs,
				status: "created" as keyof ActivityState,
				startTime: convertTimestampToDate(log.t),
				endTime: undefined,
				returnValue: "",
				key: convertTimestampToEpoch(log.t).getTime().toString(),
			};
		}

		if (callAttemptStart && currentActivity) {
			currentActivity.status = "running" as keyof ActivityState;
			currentActivity.startTime = convertTimestampToDate(callAttemptStart.startedAt);
		}

		if (callAttemptComplete && currentActivity) {
			currentActivity.status = "completed" as keyof ActivityState;
			currentActivity.endTime = convertTimestampToDate(callAttemptComplete.completedAt) as Date | undefined;
			currentActivity.returnValue = callAttemptComplete?.result?.value?.string?.v as string;
		}

		if (state && state.error && currentActivity) {
			currentActivity.endTime = convertTimestampToDate(log.t) as Date | undefined;
			currentActivity.status = "error" as keyof ActivityState;
		}
	}

	if (currentActivity) {
		activities.push(currentActivity);
	}

	return activities.reverse();
}
