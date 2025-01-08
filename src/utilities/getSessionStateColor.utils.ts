import { SessionStateType } from "@src/enums";

export const getSessionStateColor = (state?: SessionStateType) => {
	return {
		"text-blue-500": state === SessionStateType.running,
		"text-white": state === SessionStateType.stopped,
		"text-green-800": state === SessionStateType.completed,
		"text-error": state === SessionStateType.error,
	};
};
