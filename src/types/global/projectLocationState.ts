import { SessionStateType } from "@src/enums/session.enum";

export type ProjectLocationState = {
	fileToOpen?: string;
	sessionState?: keyof typeof SessionStateType;
};
