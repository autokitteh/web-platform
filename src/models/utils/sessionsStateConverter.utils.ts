import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { SessionStateType } from "@enums";

export const sessionStateConverter = (sessionState: number): SessionStateType | undefined => {
	if (!(sessionState in ProtoSessionStateType)) {
		return;
	}
	const sessionStateType = ProtoSessionStateType[sessionState].toLowerCase();
	return SessionStateType[sessionStateType as keyof typeof SessionStateType];
};
