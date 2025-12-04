import { t } from "i18next";

import { LoggerService } from "@services";
import { namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks/useEventListener";
import {
	CodeFixSuggestionAllMessage,
	CodeFixSuggestionMessage,
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

/**
 * Message handlers for iframe communication
 * Extracted from IframeCommService to improve code organization
 */
export class IframeCommHandlers {
	constructor(
		private readonly sendMessage: (message: any) => void,
		private readonly pendingRequests: Map<string, any>,
		private readonly appSource: string
	) {}

	/**
	 * Handles ERROR messages from the iframe
	 */
	public handleErrorMessage(message: ErrorMessage): void {
		const { code, message: errorMessage } = message.data;

		if (code.startsWith("REQUEST_") && code.includes("_")) {
			const requestId = code.split("_")[1];
			const pendingRequest = this.pendingRequests.get(requestId);

			if (pendingRequest) {
				pendingRequest.reject(new Error(errorMessage));
				this.pendingRequests.delete(requestId);
			}
		}
	}

	/**
	 * Handles EVENT messages from the iframe
	 */
	public handleEventMessage(message: EventMessage, onIframeReady?: () => void): void {
		if (message.data.eventName === "IFRAME_READY" && onIframeReady) {
			onIframeReady();
		}

		if (message.data.eventName === "DATADOG_READY") {
			// The service will handle this by calling sendDatadogContext
		}
	}

	/**
	 * Handles DISPLAY_DIAGRAM messages from the iframe
	 */
	public handleDiagramDisplayMessage(message: DiagramDisplayMessage): void {
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
	}

	/**
	 * Handles VAR_UPDATED messages from the iframe
	 */
	public handleVarUpdatedMessage(message: VarUpdatedMessage): void {
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
	}

	/**
	 * Handles REFRESH_DEPLOYMENTS messages from the iframe
	 */
	public handleRefreshDeploymentsMessage(_message: RefreshDeploymentsMessage): void {
		// mark param as used for linting while keeping signature for type-safety
		void _message;
		triggerEvent(EventListenerName.refreshDeployments);
	}

	/**
	 * Handles NAVIGATE_TO_BILLING messages from the iframe
	 */
	public handleNavigateToBillingMessage(_message: NavigateToBillingMessage): void {
		// mark param as used for linting while keeping signature for type-safety
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
	}

	/**
	 * Handles CODE_FIX_SUGGESTION messages from the iframe
	 */
	public handleCodeFixSuggestionMessage(message: CodeFixSuggestionMessage): void {
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
	}

	/**
	 * Handles CODE_FIX_SUGGESTION_ALL messages from the iframe
	 * Applies multiple code fix suggestions in bulk
	 */
	public async handleCodeFixSuggestionAllMessage(message: CodeFixSuggestionAllMessage): Promise<void> {
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
						await this.applyFileModification(fileName, newCode);
						break;
					}
					case "add": {
						await this.applyFileCreation(fileName, newCode);
						break;
					}
					case "remove": {
						await this.applyFileDeletion(fileName);
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

		// Show appropriate feedback based on results
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

		// Log summary for debugging
		LoggerService.info(
			namespaces.iframeCommService,
			`Bulk code fix operation completed: ${successCount} successful, ${failureCount} failed out of ${suggestions.length} total`
		);
	}

	/**
	 * Handles DOWNLOAD_DUMP messages from the iframe
	 */
	public handleDownloadDumpMessage(message: DownloadDumpMessage): void {
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

			this.sendMessage({
				type: MessageTypes.DOWNLOAD_DUMP_RESPONSE,
				source: this.appSource,
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

			this.sendMessage({
				type: MessageTypes.DOWNLOAD_DUMP_RESPONSE,
				source: this.appSource,
				data: {
					success: false,
					error: errorMessage,
				},
			});
		}
	}

	/**
	 * Handles DOWNLOAD_CHAT messages from the iframe
	 */
	public handleDownloadChatMessage(message: DownloadChatMessage): void {
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
	}

	/**
	 * Helper: Apply file modification operation
	 */
	private async applyFileModification(fileName: string, newCode: string): Promise<void> {
		// Validate inputs
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

		// Validate content can be encoded
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

	/**
	 * Helper: Apply file creation operation
	 */
	private async applyFileCreation(fileName: string, content: string): Promise<void> {
		// Validate inputs
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

		// Check if file already exists
		if (resources?.[fileName]) {
			throw new Error(`File already exists: ${fileName}`);
		}

		// Validate content can be encoded
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

	/**
	 * Helper: Apply file deletion operation
	 */
	private async applyFileDeletion(fileName: string): Promise<void> {
		// Validate inputs
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

		// Check if file exists before attempting deletion
		if (!resources?.[fileName]) {
			throw new Error(`File not found for deletion: ${fileName}`);
		}

		const { deleteFile } = fileOperations(currentProjectId);
		await deleteFile(fileName);

		// Note: deleteFile might not return a boolean, so we check if it threw an error
		// If we reach this point without an error, consider it successful
	}
}
