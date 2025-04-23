import dayjs from "dayjs";

import { GetPrintsResponse_Print as ProtoGetPrintsResponse_Print } from "@ak-proto-ts/sessions/v1/svc_pb";
import { dateTimeFormat } from "@src/constants";
import { SessionOutputLog } from "@src/interfaces/models";
import { convertTimestampToDate } from "@src/utilities";

export function convertSessionLogProtoToModel(protoPrintLog?: ProtoGetPrintsResponse_Print): SessionOutputLog {
	const time = convertTimestampToDate(protoPrintLog?.t);
	const print = protoPrintLog?.v?.string?.v || "Empty print";
	const formattedDateTime = dayjs(time).format(dateTimeFormat);

	return { time: formattedDateTime, print };
}
