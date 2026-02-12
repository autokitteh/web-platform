import { t } from "i18next";

import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { ActivityState, dateTimeFormatWithMS } from "@src/constants";
import { SessionActivity } from "@src/interfaces/models";
import { DeepProtoValueResult } from "@src/interfaces/utilities";
import { AkDateTime } from "@src/types/global";
import {
	twConfig,
	convertProtoTimestampToDate,
	convertPythonStringToJSON,
	safeParseSingleProtoValue,
} from "@src/utilities";

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

					const rawValue = callSpec.kwargs[key]?.string?.v || "{}";

					const { data, error: parseError } = convertPythonStringToJSON(rawValue);
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
				functionName:
					callSpec?.function?.function?.name ||
					t("unnamedActivity", {
						ns: "deployments",
					}),
				startTime: logTime,
				args: args,
				kwargs: kwargs,
				endTime: undefined,
				returnValue: { type: "object", value: {} } as DeepProtoValueResult,
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
				convertProtoTimestampToDate(callAttemptComplete.completedAt) || logTime || new AkDateTime();
			currentActivity.duration = currentActivity.startTime!.duration(currentActivity.endTime);

			if (callAttemptComplete.result?.value) {
				try {
					let parsedValue = safeParseSingleProtoValue(callAttemptComplete.result.value);

					if (typeof parsedValue === "string") {
						try {
							parsedValue = JSON.parse(parsedValue);
						} catch {
							parsedValue = { value: parsedValue };
						}
					}

					currentActivity.returnValue = parsedValue
						? { type: "object", value: parsedValue }
						: { type: "object", value: {} };
				} catch {
					currentActivity.returnValue = { type: "object", value: {} } as DeepProtoValueResult;
				}
			} else {
				currentActivity.returnValue = { type: "object", value: {} } as DeepProtoValueResult;
			}

			const xAxisName = currentActivity.sequence
				? `[#${currentActivity.sequence}] ${currentActivity.functionName}`
				: currentActivity.functionName ||
					t("unnamedActivity", {
						ns: "deployments",
					});

			currentActivity.chartRepresentation = {
				x: xAxisName,
				y: [currentActivity.startTime!.getTime(), currentActivity.endTime!.getTime()],
				fillColor: twConfig.theme.colors.green[500],
				duration: currentActivity.duration,
				functionName:
					xAxisName ||
					t("unnamedActivity", {
						ns: "deployments",
					}),
				startTime: currentActivity.startTime!.toString(dateTimeFormatWithMS),
				endTime: currentActivity.endTime.toString(dateTimeFormatWithMS),
			};
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
		finalEndTime = new AkDateTime();
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
