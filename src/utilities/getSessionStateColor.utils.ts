import { sessionStatusTextClasses } from "@constants";
import { SessionStateType } from "@src/enums";

export const getSessionStateColor = (state?: SessionStateType): string | undefined => {
	if (state === undefined) return undefined;

	return sessionStatusTextClasses[state];
};
