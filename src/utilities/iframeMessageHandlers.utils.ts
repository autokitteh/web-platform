import { t } from "i18next";

import { PendingRequest } from "@interfaces/services";
import { LoggerService } from "@services";
import { CONFIG } from "@services/iframeComm.service";
import { namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks/useEventListener";
import {
	AkbotMessage,
	CodeFixSuggestionMessage,
	CodeFixSuggestionAllMessage,
	DiagramDisplayMessage,
	DownloadChatMessage,
	DownloadDumpMessage,
	ErrorMessage,
	EventMessage,
	MessageTypes,
	NavigateToBillingMessage,
	RefreshDeploymentsMessage,
	VarUpdatedMessage,
} from "@src/types/iframeCommunication.type";

export type SendMessageFn = <T>(message: { data: T; source: string; type: MessageTypes }) => void;

export type ConnectionResolverFn = (() => void) | null;

const ignoredMessageSources = ["react-devtools-content-script", "react-devtools-bridge"] as const;

export const shouldIgnoreMessage = (message: unknown): boolean => {
	if (!message || typeof message !== "object") {
		return true;
	}

	const msg = message as Record<string, unknown>;

	if (ignoredMessageSources.includes(msg.source as (typeof ignoredMessageSources)[number])) {
		return true;
	}

	if (msg.vscodeScheduleAsyncWork || Object.prototype.hasOwnProperty.call(msg, "vscodeScheduleAsyncWork")) {
		return true;
	}

	return false;
};

export const isValidAkbotMessage = (message: unknown): message is AkbotMessage => {
	if (!message || typeof message !== "object") {
		return false;
	}

	const msg = message as Record<string, unknown>;

	if (!msg.type || !msg.source || typeof msg.type !== "string" || typeof msg.source !== "string") {
		return false;
	}

	if (msg.source !== CONFIG.AKBOT_SOURCE) {
		return false;
	}

	if (!Object.values(MessageTypes).includes(msg.type as MessageTypes)) {
		return false;
	}

	return true;
};

export const isValidOrigin = (origin: string): boolean => {
	try {
		const url = new URL(origin);
		const hostname = url.hostname;
		const validHostnames = ["localhost", "127.0.0.1"];

		return (
			validHostnames.includes(hostname) ||
			hostname === "autokitteh.cloud" ||
			hostname.endsWith(".autokitteh.cloud")
		);
	} catch (error) {
		LoggerService.debug(namespaces.iframeCommService, `Failed to parse origin URL: ${origin}: ${error}`);
		return false;
	}
};

export const handleErrorMessage = (
	message: ErrorMessage,
	pendingRequests: Map<string, PendingRequest>
): string | undefined => {
	const { code, message: errorMessage } = message.data;

	if (code.startsWith("REQUEST_") && code.includes("_")) {
		const requestId = code.split("_")[1];
		const pendingRequest = pendingRequests.get(requestId);

		if (pendingRequest) {
			pendingRequest.reject(new Error(errorMessage));
			return requestId;
		}
	}
	return undefined;
};

export const handleEventMessage = (
	message: EventMessage,
	isConnected: boolean,
	connectionResolve: ConnectionResolverFn,
	sendDatadogContext: () => void
): { shouldClearResolver: boolean; shouldSetConnected: boolean } => {
	const result = { shouldSetConnected: false, shouldClearResolver: false };

	if (message.data.eventName === "IFRAME_READY" && !isConnected) {
		result.shouldSetConnected = true;
		if (connectionResolve) {
			connectionResolve();
			result.shouldClearResolver = true;
		}
	}

	if (message.data.eventName === "DATADOG_READY") {
		sendDatadogContext();
	}

	return result;
};

export const handleDiagramDisplayMessage = (message: DiagramDisplayMessage): void => {
	void import("@src/store")
		.then(({ useModalStore }) => {
			const { openModal } = useModalStore.getState();
			const { content } = message.data;

			openModal(ModalName.diagramViewer, { content });
			return true;
		})
		.catch((error) => {
			LoggerService.debug(
				namespaces.iframeCommService,
				t("errors.iframeComm.errorImportingStoreForDiagramDisplayHandling", {
					ns: "services",
					error,
				})
			);
		});
};

export const handleVarUpdatedMessage = (message: VarUpdatedMessage): void => {
	void import("@src/store/cache/useCacheStore")
		.then(({ useCacheStore }) => {
			const { fetchVariables } = useCacheStore.getState();
			const { projectId } = message.data;

			if (projectId) {
				fetchVariables(projectId, true);
			}
			return true;
		})
		.catch((error) => {
			LoggerService.debug(
				namespaces.iframeCommService,
				t("errors.iframeComm.errorImportingStoreForVarUpdatedHandling", {
					ns: "services",
					error,
				})
			);
		});
};

export const handleRefreshDeploymentsMessage = (_message: RefreshDeploymentsMessage): void => {
	void _message;
	triggerEvent(EventListenerName.refreshDeployments);
};

export const handleNavigateToBillingMessage = (_message: NavigateToBillingMessage): void => {
	void _message;
	try {
		window.location.href = "/organization-settings/billing";
	} catch (error) {
		LoggerService.debug(
			namespaces.iframeCommService,
			t("errors.iframeComm.errorNavigatingToBilling", {
				ns: "services",
				error: (error as Error).message,
			})
		);
	}
};

export const handleCodeFixSuggestionMessage = (message: CodeFixSuggestionMessage): void => {
	const { operation, newCode, fileName } = message.data;
	switch (operation) {
		case "modify":
			triggerEvent(EventListenerName.codeFixSuggestion, {
				fileName,
				newCode,
				changeType: operation,
			});
			break;
		case "add":
			triggerEvent(EventListenerName.codeFixSuggestionAdd, { fileName, newCode, changeType: operation });
			break;
		case "remove":
			triggerEvent(EventListenerName.codeFixSuggestionRemove, { fileName, changeType: operation });
			break;
		default:
			triggerEvent(EventListenerName.codeFixSuggestion, {
				fileName,
				newCode,
				changeType: "modify",
			});
	}
};

async function applyFileModification(fileName: string, newCode: string): Promise<void> {
	if (!fileName || typeof fileName !== "string") {
		throw new Error("Invalid fileName provided for file modification");
	}
	if (newCode === null || newCode === undefined) {
		throw new Error("Invalid newCode provided for file modification");
	}

	const [{ fileOperations }, { useCacheStore }] = await Promise.all([
		import("@src/factories"),
		import("@src/store/cache/useCacheStore"),
	]);

	const { currentProjectId, resources } = useCacheStore.getState();

	if (!currentProjectId) {
		throw new Error("No current project ID available");
	}

	const fileResource = resources?.[fileName];

	if (!fileResource) {
		throw new Error(`File resource not found: ${fileName}`);
	}

	try {
		new TextEncoder().encode(String(newCode));
	} catch (error) {
		throw new Error(`Content validation failed for file ${fileName}: ${(error as Error).message}`);
	}

	const { saveFile } = fileOperations(currentProjectId);
	const result = await saveFile(fileName, String(newCode));

	if (!result) {
		throw new Error(`Failed to save file: ${fileName}`);
	}
}

async function applyFileCreation(fileName: string, content: string): Promise<void> {
	if (!fileName || typeof fileName !== "string") {
		throw new Error("Invalid fileName provided for file creation");
	}
	if (content === null || content === undefined) {
		throw new Error("Invalid content provided for file creation");
	}

	const [{ fileOperations }, { useCacheStore }] = await Promise.all([
		import("@src/factories"),
		import("@src/store/cache/useCacheStore"),
	]);

	const { currentProjectId, resources } = useCacheStore.getState();

	if (!currentProjectId) {
		throw new Error("No current project ID available");
	}

	if (resources?.[fileName]) {
		throw new Error(`File already exists: ${fileName}`);
	}

	try {
		new TextEncoder().encode(String(content));
	} catch (error) {
		throw new Error(`Content validation failed for file ${fileName}: ${(error as Error).message}`);
	}

	const { saveFile } = fileOperations(currentProjectId);
	const result = await saveFile(fileName, String(content));

	if (!result) {
		throw new Error(`Failed to create file: ${fileName}`);
	}
}

async function applyFileDeletion(fileName: string): Promise<void> {
	if (!fileName || typeof fileName !== "string") {
		throw new Error("Invalid fileName provided for file deletion");
	}

	const [{ fileOperations }, { useCacheStore }] = await Promise.all([
		import("@src/factories"),
		import("@src/store/cache/useCacheStore"),
	]);

	const { currentProjectId, resources } = useCacheStore.getState();

	if (!currentProjectId) {
		throw new Error("No current project ID available");
	}

	if (!resources?.[fileName]) {
		throw new Error(`File not found for deletion: ${fileName}`);
	}

	const { deleteFile } = fileOperations(currentProjectId);
	await deleteFile(fileName);
}

export const handleCodeFixSuggestionAllMessage = async (message: CodeFixSuggestionAllMessage): Promise<void> => {
	const { suggestions } = message.data;

	if (!suggestions || suggestions.length === 0) {
		LoggerService.warn(namespaces.iframeCommService, "No suggestions provided for bulk code fix operation");
		return;
	}

	const appliedOperations: Array<{
		fileName: string;
		operation: string;
		originalContent?: string;
		success: boolean;
	}> = [];

	let successCount = 0;
	let failureCount = 0;

	for (const suggestion of suggestions) {
		const { operation, newCode, fileName } = suggestion;
		const operationResult = {
			fileName,
			operation,
			success: false,
			originalContent: undefined as string | undefined,
		};

		try {
			if (operation === "modify" || operation === "remove") {
				const [{ useCacheStore }] = await Promise.all([import("@src/store/cache/useCacheStore")]);
				const { resources } = useCacheStore.getState();
				const fileResource = resources?.[fileName];
				if (fileResource) {
					operationResult.originalContent = new TextDecoder().decode(fileResource);
				}
			}

			switch (operation) {
				case "modify": {
					await applyFileModification(fileName, newCode);
					break;
				}
				case "add": {
					await applyFileCreation(fileName, newCode);
					break;
				}
				case "remove": {
					await applyFileDeletion(fileName);
					break;
				}
				default:
					throw new Error(`Unknown operation type: ${operation}`);
			}

			operationResult.success = true;
			successCount++;
		} catch (error) {
			operationResult.success = false;
			failureCount++;
			LoggerService.debug(
				namespaces.iframeCommService,
				`Failed to apply ${operation} operation for file ${fileName}: ${(error as Error).message}`
			);
		}

		appliedOperations.push(operationResult);
	}

	const { useToastStore } = await import("@src/store");
	const { addToast } = useToastStore.getState();

	if (successCount > 0 && failureCount === 0) {
		addToast({
			message: `Successfully applied ${successCount} code fix${successCount > 1 ? "es" : ""} silently`,
			type: "success",
		});
	} else if (successCount > 0 && failureCount > 0) {
		addToast({
			message: `Applied ${successCount} code fixes successfully, ${failureCount} failed. Check logs for details.`,
			type: "warning",
		});
	} else if (failureCount > 0) {
		addToast({
			message: `Failed to apply ${failureCount} code fix${failureCount > 1 ? "es" : ""}. Check logs for details.`,
			type: "error",
		});
	}

	LoggerService.info(
		namespaces.iframeCommService,
		`Bulk code fix operation completed: ${successCount} successful, ${failureCount} failed out of ${suggestions.length} total`
	);
};

export const handleDownloadDumpMessage = (message: DownloadDumpMessage, sendMessage: SendMessageFn): void => {
	const { filename, content, contentType } = message.data;

	try {
		const blob = new Blob([content], { type: contentType });

		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.style.display = "none";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);

		sendMessage({
			type: MessageTypes.DOWNLOAD_DUMP_RESPONSE,
			source: CONFIG.APP_SOURCE,
			data: {
				success: true,
			},
		});
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";

		LoggerService.debug(
			namespaces.iframeCommService,
			t("errors.iframeComm.failedToDownloadFile", {
				ns: "services",
				filename,
				error: errorMessage,
			})
		);

		sendMessage({
			type: MessageTypes.DOWNLOAD_DUMP_RESPONSE,
			source: CONFIG.APP_SOURCE,
			data: {
				success: false,
				error: errorMessage,
			},
		});
	}
};

export const handleDownloadChatMessage = (message: DownloadChatMessage): void => {
	const { filename, content, contentType } = message.data;

	try {
		const blob = new Blob([content], { type: contentType });

		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = filename;
		link.style.display = "none";

		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);

		URL.revokeObjectURL(url);
	} catch (error) {
		const errorMessage = error instanceof Error ? error.message : "Unknown error";
		LoggerService.debug(
			namespaces.iframeCommService,
			t("errors.iframeComm.failedToDownloadChatFile", {
				ns: "services",
				filename,
				error: errorMessage,
			})
		);
	}
};
