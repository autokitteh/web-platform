import { LintViolationCheckLevelTypes } from "@enums";
import { SessionEntrypoint } from "@interfaces/models";

export type LintViolationCheckType = {
	[key in LintViolationCheckKeyType]: LintViolationCheck[];
};

export type LintViolationCheck = {
	level: LintViolationCheckLevelTypes;
	location?: SessionEntrypoint;
	message: string;
	ruleId?: string;
};

export type LintViolationCheckKeyType = keyof typeof LintViolationCheckLevelTypes;
