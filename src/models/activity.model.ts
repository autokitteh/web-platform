import { convertValue } from "./value.model";
import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { ActivityState } from "@src/enums";
import { SessionActivity } from "@src/types/models";
import { isWrappedJsonValueWithBytes, isWrappedJsonValueWithString } from "@src/types/models/value.type";
import { convertTimestampToEpoch } from "@src/utilities/convertTimestampToDate.utils";
import { convertPythonStringToJSON, convertTimestampToDate } from "@utilities";

export function convertSessionLogRecordsProtoToActivitiesModel(
	ProtoSessionLogRecords: ProtoSessionLogRecord[]
): SessionActivity[] {
	const activities: SessionActivity[] = [];
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

			const kwargs = convertPythonStringToJSON(callSpec?.kwargs?.params?.string?.v || "{}");

			const args = callSpec.args
				.map((arg) => (arg.string ? arg.string.v : null))
				.filter((arg): arg is string => arg !== null);

			currentActivity = {
				functionName: `${callSpec?.function?.function?.name}(${paramNames?.join(", ")})`,
				args,
				kwargs,
				status: "created" as keyof ActivityState,
				startTime: convertTimestampToDate(log.t),
				endTime: undefined,
				returnJSONValue: {},
				key: convertTimestampToEpoch(log.t).getTime().toString(),
			};
		}

		if (callAttemptStart && currentActivity) {
			currentActivity.status = "running" as keyof ActivityState;
			currentActivity.startTime = convertTimestampToDate(callAttemptStart.startedAt);
		}

		if (callAttemptComplete && currentActivity) {
			if (callAttemptComplete.result?.error) {
				currentActivity.status = "error" as keyof ActivityState;
			} else {
				currentActivity.status = "completed" as keyof ActivityState;
			}
			currentActivity.endTime = convertTimestampToDate(callAttemptComplete.completedAt);

			const convertedValue = convertValue(callAttemptComplete.result?.value);

			if (isWrappedJsonValueWithBytes(convertedValue)) {
				try {
					const byteArray = convertedValue.bytes;
					if (!byteArray) {
						throw new Error("Invalid or missing byte array");
					}
					const uint8Array = new Uint8Array(byteArray);
					const decoder = new TextDecoder("utf-8");
					const decodedString = decoder.decode(uint8Array);
					currentActivity.returnBytesValue = decodedString;
				} catch (error) {
					console.error("Error decoding text:", error);
				}
			}

			if (isWrappedJsonValueWithString(convertedValue)) {
				const returnValueConverted = convertedValue.string;
				if (typeof returnValueConverted === "string") {
					currentActivity.returnStringValue = returnValueConverted;
				} else {
					currentActivity.returnJSONValue = returnValueConverted;
				}
			}
		}

		if (state?.error && currentActivity) {
			currentActivity.endTime = convertTimestampToDate(log.t);
			currentActivity.status = "error" as keyof ActivityState;
		}
	}

	if (currentActivity) {
		activities.push(currentActivity);
	}

	return activities.reverse();
}
