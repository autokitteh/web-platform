import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionStateType } from "@enums";
import { SessionStateKeyType } from "@src/types/models/sessionState.type";

export const sessionStateConverter = (sessionState: number): SessionStateType | undefined => {
	if (!(sessionState in ProtoSessionStateType)) {
		return;
	}
	const sessionStateType = ProtoSessionStateType[sessionState].toLowerCase();

	return SessionStateType[sessionStateType as SessionStateKeyType];
};

export const reverseSessionStateConverter = (sessionState?: SessionStateKeyType): number | undefined => {
	if (!sessionState) {
		return;
	}
	if (!(sessionState in SessionStateType)) {
		return;
	}
	const sessionStateType = ProtoSessionStateType[sessionState.toUpperCase() as keyof typeof ProtoSessionStateType];

	return sessionStateType;
};
