import { LintViolationCheckLevelTypes } from "@enums";
import { SessionEntrypoint } from "@interfaces/models";

export type LintViolationCheckType = {
	[key in LintViolationCheckKeyType]: LintViolationCheck[];
};

export const violationRules = {
	// ID -> Description
	E1: "Project size too large",
	E2: "Duplicate connection name",
	E3: "Duplicate trigger name",
	E4: "Bad `call` format",
	E5: "File not found",
	E6: "Syntax error",
	E7: "Missing handler",
	E8: "Nonexisting connection",
	E9: "Malformed name",

	W1: "Empty variable",
	W2: "No triggers defined",
};

export type LintViolationCheck = {
	level: LintViolationCheckLevelTypes;
	location?: SessionEntrypoint;
	message: string;
	ruleId: keyof typeof violationRules;
	ruleMessage?: string;
};

export type LintViolationCheckKeyType = keyof typeof LintViolationCheckLevelTypes;
