import { SessionLogRecord as ProtoSessionLogRecord } from "@ak-proto-ts/sessions/v1/session_pb";
import { ActivityState } from "@src/enums";
import { Activity } from "@src/types/models";
import { convertTimestampToEpoch } from "@src/utilities/convertTimestampToDate.utils";
import { convertTimestampToDate } from "@utilities";

const extractKWArgsData = (input: { [key: string]: any }, parentKey: string = ""): any[] => {
	let result: any[] = [];

	for (const [key, value] of Object.entries(input)) {
		const currentKey = parentKey ? `${parentKey}.${key}` : key;

		if (value?.dict?.items) {
			value.dict.items.forEach((item: any) => {
				if (item.k.string && item.v.string) {
					result.push({
						key: `${currentKey}.${item.k.string.v}`,
						value: item.v.string.v,
					});
				}
			});
		} else if (typeof value === "object" && value !== null) {
			result = result.concat(extractKWArgsData(value, currentKey));
		}
	}

	return result;
};

/**
 * Converts a ProtoSessionLogRecords array to a Activities array.
 * @param protoSession The ProtoSessionLogRecords object to convert.
 * @returns The Activity array.
 */
export function convertSessionLogRecordsProtoToActivitiesModel(
	ProtoSessionLogRecords: ProtoSessionLogRecord[]
): Activity[] {
	const activities = [];
	let currentActivity = null as Activity | null;

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

			const kwargs = extractKWArgsData(callSpec.kwargs) || [];

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
				returnValue: {},
				key: convertTimestampToEpoch(log.t).getTime().toString(),
			};
		}

		if (callAttemptStart && currentActivity) {
			currentActivity.status = "running" as keyof ActivityState;
			currentActivity.startTime = convertTimestampToDate(callAttemptStart.startedAt);
		}

		if (callAttemptComplete && currentActivity) {
			currentActivity.status = "completed" as keyof ActivityState;
			currentActivity.endTime = convertTimestampToDate(callAttemptComplete.completedAt);
			currentActivity.returnValue = callAttemptComplete?.result?.value as object;
		}

		if (state && state.error && currentActivity) {
			currentActivity.endTime = convertTimestampToDate(log.t);
			currentActivity.status = "error" as keyof ActivityState;
		}
	}

	if (currentActivity) {
		activities.push(currentActivity);
	}

	return activities.reverse();
}
