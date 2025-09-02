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
	NavigateToBillingMessage,
	WelcomeMessage,
	VarUpdatedMessage,
	RefreshDeploymentsMessage,
	CodeFixSuggestionMessage,
	CodeFixSuggestionAllMessage,
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
	type NavigateToBillingMessage,
	type WelcomeMessage,
	type VarUpdatedMessage,
	type RefreshDeploymentsMessage,
	type CodeFixSuggestionMessage,
	type CodeFixSuggestionAllMessage,
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
	| NavigateToBillingMessage
	| WelcomeMessage
	| VarUpdatedMessage
	| RefreshDeploymentsMessage
	| CodeFixSuggestionMessage
	| CodeFixSuggestionAllMessage
	| DownloadDumpMessage
	| DownloadDumpResponseMessage
	| DownloadChatMessage;
