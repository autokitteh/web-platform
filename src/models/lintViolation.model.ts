import dayjs from "dayjs";
import randomatic from "randomatic";

import { lintViolationCheckLevelConverter, lintViolationCheckLevelConverterToSystemLogStatus } from "@models/utils";
import { CheckViolation as ProtoCheckViolation } from "@src/autokitteh/proto/gen/ts/autokitteh/projects/v1/svc_pb";
import { dateTimeFormat } from "@src/constants";
import { Log } from "@src/interfaces/store";
import { violationRules } from "@src/types/models/lintViolationCheck.type";
import { LintViolationCheck } from "@type/models";

export const convertViolationProtoToModel = (protoViolation: ProtoCheckViolation): LintViolationCheck => {
	const violationRuleId = protoViolation.ruleId;
	if (!(violationRuleId in violationRules)) {
		throw new Error(`Unknown violation rule id: ${violationRuleId}`);
	}

	return {
		level: lintViolationCheckLevelConverter(protoViolation.level),
		location: protoViolation.location,
		message: protoViolation.message,
		ruleId: protoViolation.ruleId as keyof typeof violationRules,
		ruleMessage: violationRules[protoViolation.ruleId as keyof typeof violationRules],
	};
};

export const convertLintViolationToSystemLog = (
	lintViolation: LintViolationCheck,
	isManifestFilePresent: boolean
): Log => {
	const timestamp = dayjs().format(dateTimeFormat);
	const id = randomatic("Aa0", 5);
	return {
		status: lintViolationCheckLevelConverterToSystemLogStatus(lintViolation.level),
		location: isManifestFilePresent ? lintViolation.location : undefined,
		message: lintViolation.message,
		timestamp,
		id,
	};
};
