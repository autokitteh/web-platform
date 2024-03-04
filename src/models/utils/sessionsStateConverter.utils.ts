import { SessionStateType as ProtoSessionStateType } from "@ak-proto-ts/sessions/v1/session_pb";
import { namespaces } from "@constants";
import { SessionStateType } from "@enums";
import { LoggerService } from "@services";
import i18n from "i18next";

export const sessionStateConverter = (sessionState: number): SessionStateType => {
	if (!ProtoSessionStateType[sessionState]) {
		return SessionStateType.unknown;
	}

	try {
		const sessionStateType = ProtoSessionStateType[sessionState].toLowerCase();
		return SessionStateType[sessionStateType as keyof typeof SessionStateType];
	} catch (error) {
		LoggerService.error(namespaces.sessionsHistory, `${i18n.t("errors.unexpectedError")}: ${error}`);
		return SessionStateType.unknown;
	}
};
