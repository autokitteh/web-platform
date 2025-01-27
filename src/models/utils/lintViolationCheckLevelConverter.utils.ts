import { CheckViolation_Level } from "@src/autokitteh/proto/gen/ts/autokitteh/projects/v1/svc_pb";
import { LintViolationCheckLevelTypes, LoggerLevel } from "@src/enums";
import { LintViolationCheckKeyType } from "@src/types/models/lintViolationCheck.type";

export const lintViolationCheckLevelConverter = (violationCheckLevel: number): LintViolationCheckLevelTypes => {
	if (!(violationCheckLevel in CheckViolation_Level)) {
		return LintViolationCheckLevelTypes.unspecified;
	}
	const violationCheckLevelName = CheckViolation_Level[violationCheckLevel].toLowerCase();

	return LintViolationCheckLevelTypes[violationCheckLevelName as LintViolationCheckKeyType];
};

export const lintViolationCheckLevelConverterToSystemLogStatus = (
	violationCheckLevel: LintViolationCheckLevelTypes
): LoggerLevel => {
	if (!(violationCheckLevel in LoggerLevel)) {
		return LoggerLevel.unspecified;
	}
	switch (violationCheckLevel) {
		case LintViolationCheckLevelTypes.error:
			return LoggerLevel.error;
		case LintViolationCheckLevelTypes.warning:
			return LoggerLevel.warn;
		case LintViolationCheckLevelTypes.unspecified:
			return LoggerLevel.unspecified;
		default:
			return LoggerLevel.unspecified;
	}
};
