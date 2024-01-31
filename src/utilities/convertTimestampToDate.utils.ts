import { ProtoTimestamp } from "@type/utilities";

/**
 * Converts a gRPC Timestamp to a JavaScript Date object.
 * @param timestamp The gRPC Timestamp object which might have 'seconds' and 'nanoseconds'.
 * @returns The JavaScript Date object or undefined.
 */
export const convertTimestampToDate = (timestamp: ProtoTimestamp): Date => {
	const milliseconds =
		timestamp.seconds * BigInt(1000) + BigInt(timestamp.nanoseconds ? timestamp.nanoseconds / 1000000 : 0);

	return new Date(Number(milliseconds));
};
