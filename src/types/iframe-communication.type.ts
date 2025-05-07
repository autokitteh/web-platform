export interface IframeMessage<T = unknown> {
	type: string;
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
}

export interface HandshakeMessage extends IframeMessage<{ version: string }> {
	type: MessageTypes.HANDSHAKE | MessageTypes.HANDSHAKE_ACK;
}

export interface ProjectCreationMessage
	extends IframeMessage<{ data: { eventName: string; payload: { projectId: string; projectName: string } } }> {
	type: MessageTypes.NAVIGATE_TO_PROJECT;
}

export interface DataResponseMessage extends IframeMessage<{ data: unknown; requestId: string; resource: string }> {
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

export type AkbotMessage =
	| HandshakeMessage
	| EventMessage
	| ErrorMessage
	| DataResponseMessage
	| ProjectCreationMessage;
