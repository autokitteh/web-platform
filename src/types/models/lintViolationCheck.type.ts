import { lintViolationRules } from "@constants";
import { LintViolationCheckLevelTypes } from "@enums";
import { SessionEntrypoint } from "@interfaces/models";

export { lintViolationRules };

export type LintViolationCheckType = {
	[key in LintViolationCheckKeyType]: LintViolationCheck[];
};

export type LintViolationCheck = {
	level: LintViolationCheckLevelTypes;
	location?: SessionEntrypoint;
	message: string;
	ruleId: keyof typeof lintViolationRules;
	ruleMessage?: string;
};

export type LintViolationCheckKeyType = keyof typeof LintViolationCheckLevelTypes;
