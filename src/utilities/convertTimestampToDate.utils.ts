import { Timestamp } from "@bufbuild/protobuf";

import { AkDateTime } from "@src/types/global";
import { ProtoTimestamp } from "@type/utilities";

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

export const convertProtoTimestampToDate = (timestamp: Timestamp | undefined | null): AkDateTime | undefined => {
	if (!timestamp || timestamp.seconds == null || timestamp.nanos == null) {
		return undefined;
	}
	const seconds = BigInt(timestamp.seconds);
	const nanos = Number(timestamp.nanos);
	return new AkDateTime(seconds * 1000n + BigInt(Math.floor(nanos / 1000000)));
};
