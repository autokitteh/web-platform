import type {
	HandshakeMessage,
	HandshakeAckMessage,
	EventMessage,
	ErrorMessage,
	AssetsRefreshMessage,
	ProjectCreationMessage,
	FileContentMessage,
	DiagramDisplayMessage,
	NavigateToProjectMessage,
	NavigateToConnectionMessage,
	NavigateToBillingMessage,
	WelcomeMessage,
	RefreshDeploymentsMessage,
	CodeFixSuggestionMessage,
	CodeFixSuggestionAllMessage,
	CodeSuggestionAcceptedMessage,
	CodeSuggestionRejectedMessage,
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
	type AssetsRefreshMessage,
	type ProjectCreationMessage,
	type FileContentMessage,
	type DiagramDisplayMessage,
	type NavigateToProjectMessage,
	type NavigateToConnectionMessage,
	type NavigateToBillingMessage,
	type WelcomeMessage,
	type RefreshDeploymentsMessage,
	type CodeFixSuggestionMessage,
	type CodeFixSuggestionAllMessage,
	type CodeSuggestionAcceptedMessage,
	type CodeSuggestionRejectedMessage,
	type DownloadDumpMessage,
	type DownloadDumpResponseMessage,
	type DownloadChatMessage,
} from "@interfaces/services/iframeCommunication.interface";

export type AkbotMessage =
	| HandshakeMessage
	| HandshakeAckMessage
	| EventMessage
	| ErrorMessage
	| AssetsRefreshMessage
	| ProjectCreationMessage
	| FileContentMessage
	| DiagramDisplayMessage
	| NavigateToProjectMessage
	| NavigateToConnectionMessage
	| NavigateToBillingMessage
	| WelcomeMessage
	| RefreshDeploymentsMessage
	| CodeFixSuggestionMessage
	| CodeFixSuggestionAllMessage
	| CodeSuggestionAcceptedMessage
	| CodeSuggestionRejectedMessage
	| DownloadDumpMessage
	| DownloadDumpResponseMessage
	| DownloadChatMessage;
