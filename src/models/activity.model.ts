import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { ActivityState } from "@src/constants";
import { SessionActivity } from "@src/interfaces/models";
import { convertProtoTimestampToDate, convertPythonStringToJSON } from "@src/utilities";

export function convertSessionLogRecordsProtoToActivitiesModel(
	protoSessionLogRecords: ProtoSessionLogRecord[]
): SessionActivity[] {
	const activities: SessionActivity[] = [];
	let currentActivity: Partial<SessionActivity> | null = null;

	for (let i = protoSessionLogRecords.length - 1; i >= 0; i--) {
		const log: ProtoSessionLogRecord = protoSessionLogRecords[i];
		const { callAttemptComplete, callAttemptStart, callSpec } = log;
		const logTime = convertProtoTimestampToDate(log.t);

		if (callSpec) {
			if (currentActivity) {
				if (currentActivity.functionName && currentActivity.startTime && currentActivity.status) {
					if (currentActivity.endTime) {
						activities.push(currentActivity as SessionActivity);
						currentActivity = null;
					}
				}
			}

			const kwargs: { [key: string]: any } = {};
			let error: Error | undefined;

			if (callSpec?.kwargs) {
				for (const key in callSpec.kwargs) {
					if (!Object.prototype.hasOwnProperty.call(callSpec.kwargs, key)) continue;

					const { data, error: parseError } = convertPythonStringToJSON(
						callSpec.kwargs[key]?.string?.v || "{}"
					);
					if (parseError) {
						error = parseError;
						break;
					}
					kwargs[key] = data;
				}
			}

			if (error) throw error;

			const args = callSpec.args
				.map((arg) => (arg.string ? arg.string.v : null))
				.filter((arg): arg is string => arg !== null);

			currentActivity = {
				functionName: callSpec?.function?.function?.name || "Unnamed Activity",
				startTime: logTime,
				args: args,
				kwargs: kwargs,
				endTime: undefined,
				returnJSONValue: {},
				sequence: callSpec?.seq,
				status: ActivityState.created,
			};
		} else if (callAttemptStart && currentActivity) {
			const attemptStartTime = convertProtoTimestampToDate(callAttemptStart.startedAt);
			if (attemptStartTime && (!currentActivity.startTime || attemptStartTime < currentActivity.startTime)) {
				currentActivity.startTime = attemptStartTime;
			}
		} else if (callAttemptComplete && currentActivity) {
			currentActivity.status = callAttemptComplete.result?.error ? ActivityState.error : ActivityState.completed;
			currentActivity.endTime =
				convertProtoTimestampToDate(callAttemptComplete.completedAt) || logTime || new Date();
		}
	}

	if (!currentActivity || currentActivity === null) return activities;

	const { functionName, startTime, status, endTime } = currentActivity;
	if (!functionName || !startTime || !status) {
		return activities;
	}

	let finalEndTime = endTime;
	let finalStatus = status;

	if (!endTime && (status === ActivityState.running || status === ActivityState.created)) {
		finalEndTime = new Date();
		if (status === ActivityState.created) {
			finalStatus = ActivityState.running;
		}
	}

	activities.push({
		...currentActivity,
		endTime: finalEndTime,
		status: finalStatus,
	} as SessionActivity);

	return activities;
}
