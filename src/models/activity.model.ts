import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { Activity } from "@src/types/models";
import { convertTimestampToMilliseconds } from "@src/utilities/convertTimestampToDate.utils";
import { convertTimestampToDate } from "@utilities";

/**
 * Converts a ProtoSession object to a SessionType object.
 * @param protoSession The ProtoSession object to convert.
 * @returns The SessionType object.
 */
export function convertSessionLogRecordsProtoToActivitiesModel(
	ProtoSessionLogRecords: ProtoSessionLogRecord[]
): Activity[] {
	const activities = [];
	let currentActivity = null;

	for (let i = ProtoSessionLogRecords.length - 1; i >= 0; i--) {
		const log = ProtoSessionLogRecords[i];
		const { callAttemptComplete, callAttemptStart, callSpec, state } = log;

		if (callSpec) {
			if (currentActivity) {
				activities.push(currentActivity);
			}
			const paramNames = callSpec?.function?.function?.desc?.input.map((param) => param.name);
			const paramValues = callSpec.args.map((arg) => (arg.string ? arg.string.v : null));

			const parameters: { [key: string]: string | null } = paramNames?.reduce((acc, paramName: string, index) => {
				acc[paramName] = paramValues[index] || null;

				return acc;
			}, {});

			currentActivity = {
				functionName: `${callSpec.function.function.name}(${paramNames.join(", ")})`,
				parameters,
				status: "created",
				startTime: null,
				endTime: null,
				returnValue: null,
				key: convertTimestampToMilliseconds(log.t).getTime(),
			};
		}

		if (callAttemptStart && currentActivity) {
			currentActivity.status = "running";
			currentActivity.startTime = convertTimestampToDate(callAttemptStart.startedAt);
		}

		if (callAttemptComplete && currentActivity) {
			currentActivity.status = "completed";
			currentActivity.endTime = convertTimestampToDate(callAttemptComplete.completedAt);
			currentActivity.returnValue = callAttemptComplete.result.value;
		}

		if (state && state.error && currentActivity) {
			currentActivity.endTime = convertTimestampToDate(log.t);
			currentActivity.status = "error";
		}
	}

	// Push the last activity if it exists
	if (currentActivity) {
		activities.push(currentActivity);
	}

	console.log("activities", activities);

	return activities.reverse();
}
