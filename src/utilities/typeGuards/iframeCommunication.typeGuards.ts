import { NavigateToConnectionMessage, NavigateToProjectMessage, VarUpdatedMessage } from "@src/interfaces/services";
import { MessageTypes } from "@src/types/iframeCommunication.type";

export const isNavigateToProjectMessage = (message: any): message is NavigateToProjectMessage => {
	return message.type === MessageTypes.NAVIGATE_TO_PROJECT && typeof message.data?.projectId === "string";
};

export const isNavigateToConnectionMessage = (message: any): message is NavigateToConnectionMessage => {
	return (
		message.type === MessageTypes.NAVIGATE_TO_CONNECTION &&
		typeof message.data?.projectId === "string" &&
		typeof message.data?.connectionId === "string"
	);
};

export const isVarUpdatedMessage = (message: any): message is VarUpdatedMessage => {
	return message.type === MessageTypes.ASSET_UPDATED && typeof message.data?.projectId === "string";
};
