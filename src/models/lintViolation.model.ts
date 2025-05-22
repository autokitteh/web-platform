import moment from "moment";
import randomatic from "randomatic";

import { lintViolationCheckLevelConverter, lintViolationCheckLevelConverterToSystemLogStatus } from "@models/utils";
import { CheckViolation as ProtoCheckViolation } from "@src/autokitteh/proto/gen/ts/autokitteh/projects/v1/svc_pb";
import { dateTimeFormat } from "@src/constants";
import { Log } from "@src/interfaces/store";
import { LintViolationCheck } from "@type/models";

export const convertViolationProtoToModel = (protoViolation: ProtoCheckViolation): LintViolationCheck => ({
	level: lintViolationCheckLevelConverter(protoViolation.level),
	location: protoViolation.location,
	message: protoViolation.message,
});

export const convertLintViolationToSystemLog = (lintViolation: LintViolationCheck): Log => {
	const timestamp = moment().utc().local().format(dateTimeFormat);
	const id = randomatic("Aa0", 5);
	return {
		status: lintViolationCheckLevelConverterToSystemLogStatus(lintViolation.level),
		location: lintViolation.location,
		message: lintViolation.message,
		timestamp,
		id,
	};
};
