import { ProtoTimestamp } from "@type/utilities";

/**
 * Converts a gRPC Timestamp to a JavaScript Date object.
 * @param timestamp The gRPC Timestamp object which might have 'seconds' and 'nanoseconds'.
 * @returns The JavaScript Date object or undefined.
 */
export const convertTimestampToDate = (timestamp: unknown): Date => {
	const timestampConverted = timestamp as ProtoTimestamp;

	const milliseconds =
		timestampConverted.seconds * BigInt(1000) +
		BigInt(timestampConverted.nanoseconds ? timestampConverted.nanoseconds / 1000000 : 0);

	return new Date(Number(milliseconds));
};
