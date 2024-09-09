import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { ActivityState } from "@src/enums";
import { SessionActivity } from "@src/types/models";
import { convertTimestampToEpoch } from "@src/utilities/convertTimestampToDate.utils";
import { convertPythonStringToJSON, convertTimestampToDate } from "@utilities";

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

			const kwargs = convertPythonStringToJSON(callSpec?.kwargs?.params?.string?.v || "{}");

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
				returnJSONValue: {},
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
			if (callAttemptComplete.result?.value?.bytes?.v) {
				try {
					const byteArray = callAttemptComplete?.result?.value?.bytes?.v;

					if (!byteArray || !Array.isArray(byteArray)) {
						throw new Error("Invalid or missing byte array");
					}

					const uint8Array = new Uint8Array(byteArray);
					const decoder = new TextDecoder("utf-8"); // Specify 'utf-8' or another encoding if known
					const decodedString = decoder.decode(uint8Array);
					currentActivity.returnBytesValue = decodedString;
				} catch (error) {
					console.error("Error decoding text:", error);
				}
			}
			if (callAttemptComplete.result?.value?.string?.v) {
				const returnValueConverted = convertPythonStringToJSON(callAttemptComplete?.result?.value?.string?.v);
				if (typeof returnValueConverted === "string") {
					currentActivity.returnStringValue = returnValueConverted;
				} else {
					currentActivity.returnJSONValue = returnValueConverted;
				}
			}
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
