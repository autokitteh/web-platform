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
	CodeSuggestionAcceptedMessage,
	CodeSuggestionRejectedMessage,
	DownloadDumpMessage,
	DownloadDumpResponseMessage,
	DownloadChatMessage,
	SetContextMessage,
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
	type CodeSuggestionAcceptedMessage,
	type CodeSuggestionRejectedMessage,
	type DownloadDumpMessage,
	type DownloadDumpResponseMessage,
	type DownloadChatMessage,
	type SetContextMessage,
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
	| CodeSuggestionAcceptedMessage
	| CodeSuggestionRejectedMessage
	| DownloadDumpMessage
	| DownloadDumpResponseMessage
	| DownloadChatMessage
	| SetContextMessage;
