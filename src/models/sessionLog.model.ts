import moment from "moment";

import { GetPrintsResponse_Print as ProtoGetPrintsResponse_Print } from "@ak-proto-ts/sessions/v1/svc_pb";
import { dateTimeFormat } from "@constants";
import { SessionOutputLog } from "@interfaces/models";
import { convertTimestampToDate } from "@utilities";

export function convertSessionLogProtoToModel(protoPrintLog?: ProtoGetPrintsResponse_Print): SessionOutputLog {
	const time = convertTimestampToDate(protoPrintLog?.t);
	const print = protoPrintLog?.v?.string?.v || "Empty print";
	const formattedDateTime = moment(time).local().format(dateTimeFormat);

	return { time: formattedDateTime, print };
}
