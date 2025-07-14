export interface WelcomeMessage extends IframeMessage<{ message: string }> {
	type: MessageTypes.WELCOME_MESSAGE;
}
/* eslint-disable @typescript-eslint/naming-convention */
export interface IframeMessage<T = unknown> {
	type: MessageTypes | string;
	source: string;
	data: T;
}

export enum MessageTypes {
	HANDSHAKE = "HANDSHAKE",
	HANDSHAKE_ACK = "HANDSHAKE_ACK",
	DATA_REQUEST = "DATA_REQUEST",
	DATA_RESPONSE = "DATA_RESPONSE",
	EVENT = "EVENT",
	ACTION = "ACTION",
	ERROR = "ERROR",
	NAVIGATE_TO_PROJECT = "NAVIGATE_TO_PROJECT",
	NAVIGATE_TO_CONNECTION = "NAVIGATE_TO_CONNECTION",
	FILE_CONTENT = "FILE_CONTENT",
	DISPLAY_DIAGRAM = "DISPLAY_DIAGRAM",
	SET_EDITOR_CURSOR_POSITION = "SET_EDITOR_CURSOR_POSITION",
	SET_EDITOR_CODE_SELECTION = "SET_EDITOR_CODE_SELECTION",
	WELCOME_MESSAGE = "WELCOME_MESSAGE",
	VAR_UPDATED = "VAR_UPDATED",
}

export interface HandshakeMessage extends IframeMessage<{ version: string }> {
	type: MessageTypes.HANDSHAKE;
}

export interface HandshakeAckMessage extends IframeMessage<{ version: string }> {
	type: MessageTypes.HANDSHAKE_ACK;
}

export interface ProjectCreationMessage
	extends IframeMessage<{ data: { eventName: string; payload: { projectId: string; projectName: string } } }> {
	type: MessageTypes.NAVIGATE_TO_PROJECT;
}
export interface DataRequestMessage extends IframeMessage<{ requestId: string; resource: string }> {
	type: MessageTypes.DATA_REQUEST;
}

export interface DataResponseMessage extends IframeMessage<{ data: unknown; requestId: string }> {
	type: MessageTypes.DATA_RESPONSE;
}

export interface EventMessage extends IframeMessage<{ eventName: string; payload: unknown }> {
	type: MessageTypes.EVENT;
}

export interface ActionMessage extends IframeMessage<{ action: string; payload: unknown }> {
	type: MessageTypes.ACTION;
}

export interface ErrorMessage extends IframeMessage<{ code: string; message: string }> {
	type: MessageTypes.ERROR;
}

export interface FileContentMessage
	extends IframeMessage<{
		content: string;
		filename: string;
		language?: string;
	}> {
	type: MessageTypes.FILE_CONTENT;
}

export interface DiagramDisplayMessage extends IframeMessage<{ content: string }> {
	type: MessageTypes.DISPLAY_DIAGRAM;
}

export interface NavigateToProjectMessage extends IframeMessage<{ projectId: string }> {
	type: MessageTypes.NAVIGATE_TO_PROJECT;
}
export interface NavigateToConnectionMessage extends IframeMessage<{ connectionId: string; projectId: string }> {
	type: MessageTypes.NAVIGATE_TO_CONNECTION;
}

export interface VarUpdatedMessage extends IframeMessage<{ projectId: string }> {
	type: MessageTypes.VAR_UPDATED;
}

export type AkbotMessage =
	| HandshakeMessage
	| HandshakeAckMessage
	| EventMessage
	| ErrorMessage
	| DataRequestMessage
	| DataResponseMessage
	| ProjectCreationMessage
	| FileContentMessage
	| DiagramDisplayMessage
	| NavigateToProjectMessage
	| NavigateToConnectionMessage
	| WelcomeMessage
	| VarUpdatedMessage;
