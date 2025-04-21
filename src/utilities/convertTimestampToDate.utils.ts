import { ProtoTimestamp } from "@type/utilities";

/**
 * Converts a gRPC Timestamp to a JavaScript Date object.
 * @param timestamp The gRPC Timestamp object which might have 'seconds' and 'nanoseconds'.
 * @returns The JavaScript Date object or undefined.
 */
export const convertTimestampToDate = (timestamp: unknown): Date => {
	const timestampConverted = timestamp as ProtoTimestamp;

	if (!timestampConverted?.seconds && !timestampConverted?.nanos) {
		return new Date();
	}

	const milliseconds =
		BigInt(timestampConverted.seconds ? timestampConverted.seconds : 0) * BigInt(1000) +
		BigInt(timestampConverted.nanos ? Math.floor(timestampConverted.nanos / 1000000) : 0);

	return new Date(Number(milliseconds));
};

export const convertTimestampToEpoch = (timestamp: unknown): Date => {
	const timestampConverted = timestamp as ProtoTimestamp;

	if (!timestampConverted?.seconds && !timestampConverted?.nanos) {
		return new Date();
	}

	const milliseconds =
		BigInt(timestampConverted.seconds ? timestampConverted.seconds : 0) * BigInt(1000) +
		BigInt(timestampConverted.nanos ? timestampConverted.nanos : 0);

	return new Date(Number(milliseconds));
};
