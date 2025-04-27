import { t } from "i18next";

import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { namespaces } from "@constants";
import { ActivityState } from "@enums";
import { SessionActivity } from "@interfaces/models";
import { convertValue } from "@models";
import { LoggerService } from "@services/logger.service";
import { isWrappedJsonValueWithBytes, isWrappedJsonValueWithString } from "@type/models/value.type";
import { convertPythonStringToJSON, convertTimestampToDate } from "@utilities";
import { convertTimestampToEpoch } from "@utilities/convertTimestampToDate.utils";

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
				functionName: callSpec?.function?.function?.name || "",
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
			currentActivity.status = (callAttemptComplete.result?.error ? "error" : "completed") as keyof ActivityState;

			currentActivity.endTime = convertTimestampToDate(callAttemptComplete.completedAt);

			const convertedValue = convertValue(callAttemptComplete.result?.value);

			try {
				if (isWrappedJsonValueWithBytes(convertedValue)) {
					try {
						const byteArray = convertedValue.bytes;
						if (!byteArray) {
							throw new Error(t("sessions.viewer.invalidByteArray", { ns: "deployments" }));
						}
						const uint8Array = new Uint8Array(byteArray);
						const decoder = new TextDecoder("utf-8");
						const decodedString = decoder.decode(uint8Array);
						currentActivity.returnBytesValue = decodedString;
					} catch (error) {
						throw new Error(t("sessions.viewer.errorDecodingText", { ns: "deployments", error }));
					}
				}

				if (isWrappedJsonValueWithString(convertedValue)) {
					const returnValueConverted = convertedValue.string;
					if (typeof returnValueConverted === "string") {
						try {
							const parsedValue = JSON.parse(returnValueConverted);
							if (typeof parsedValue === "object" && parsedValue !== null) {
								currentActivity.returnJSONValue = parsedValue;
							} else {
								currentActivity.returnStringValue = returnValueConverted;
							}
						} catch {
							currentActivity.returnStringValue = returnValueConverted;
						}
					}
				}
			} catch (error) {
				LoggerService.error(
					namespaces.models.activity,
					t("sessionLogRecordActivtyErrorConvert", { ns: "services", error: error.message })
				);

				throw error;
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
