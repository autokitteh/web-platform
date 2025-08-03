import type {
	HandshakeMessage,
	HandshakeAckMessage,
	EventMessage,
	ErrorMessage,
	DataRequestMessage,
	DataResponseMessage,
	ProjectCreationMessage,
	FileContentMessage,
	DiagramDisplayMessage,
	NavigateToProjectMessage,
	NavigateToConnectionMessage,
	WelcomeMessage,
	VarUpdatedMessage,
	CodeFixSuggestionMessage,
	DownloadDumpMessage,
	DownloadDumpResponseMessage,
	DownloadChatMessage,
} from "@interfaces/services/iframeCommunication.interface";

export {
	MessageTypes,
	type IframeMessage,
	type HandshakeMessage,
	type HandshakeAckMessage,
	type EventMessage,
	type ErrorMessage,
	type DataRequestMessage,
	type DataResponseMessage,
	type ProjectCreationMessage,
	type FileContentMessage,
	type DiagramDisplayMessage,
	type NavigateToProjectMessage,
	type NavigateToConnectionMessage,
	type WelcomeMessage,
	type VarUpdatedMessage,
	type CodeFixSuggestionMessage,
	type DownloadDumpMessage,
	type DownloadDumpResponseMessage,
	type DownloadChatMessage,
} from "@interfaces/services/iframeCommunication.interface";

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
	| VarUpdatedMessage
	| CodeFixSuggestionMessage
	| DownloadDumpMessage
	| DownloadDumpResponseMessage
	| DownloadChatMessage;
