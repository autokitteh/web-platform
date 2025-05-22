import { LintViolationCheckLevelTypes } from "@enums";
import { SessionEntrypoint } from "@interfaces/models";

export type LintViolationCheck = {
	level: LintViolationCheckLevelTypes;
	location?: SessionEntrypoint;
	message: string;
};

export type LintViolationCheckKeyType = keyof typeof LintViolationCheckLevelTypes;
