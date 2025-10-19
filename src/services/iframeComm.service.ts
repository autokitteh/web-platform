import { t } from "i18next";
import { v4 as uuidv4 } from "uuid";

import { MessageListener, PendingRequest } from "@interfaces/services";
import { LoggerService } from "@services";
import { aiChatbotOrigin, aiChatbotUrl, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks/useEventListener";
import {
	AkbotMessage,
	CodeFixSuggestionMessage,
	CodeFixSuggestionAllMessage,
	CodeSuggestionAcceptedMessage,
	CodeSuggestionRejectedMessage,
	DatadogSetSessionIdMessage,
	DatadogSetViewIdMessage,
	DiagramDisplayMessage,
	DownloadChatMessage,
	DownloadDumpMessage,
	ErrorMessage,
	EventMessage,
	HandshakeMessage,
	HandshakeAckMessage,
	IframeMessage,
	MessageTypes,
	NavigateToBillingMessage,
	RefreshDeploymentsMessage,
	VarUpdatedMessage,
} from "@src/types/iframeCommunication.type";

export const CONFIG = {
	APP_SOURCE: "web-platform-new",
	AKBOT_SOURCE: "akbot",
	APP_VERSION: "1.0",
	REQUEST_TIMEOUT: 10000,
	MAX_RETRIES: 3,
	RETRY_DELAY: 1000,
} as const;

class IframeCommService {
	private readonly expectedOrigin: string = ((): string => {
		try {
			if (aiChatbotOrigin && (aiChatbotOrigin.startsWith("http") || aiChatbotOrigin.startsWith("https"))) {
				return new URL(aiChatbotOrigin).origin;
			}

			if (aiChatbotUrl && (aiChatbotUrl.startsWith("http") || aiChatbotUrl.startsWith("https"))) {
				return new URL(aiChatbotUrl).origin;
			}

			return aiChatbotOrigin?.replace(/\/$/, "") || "";
		} catch (error) {
			// eslint-disable-next-line no-console
			console.error("Failed to parse aiChatbotOrigin or aiChatbotUrl:", error);
			return aiChatbotOrigin || "";
		}
	})();
	private listeners: MessageListener[] = [];
	private pendingRequests: Map<string, PendingRequest> = new Map();
	private iframeRef: HTMLIFrameElement | null = null;
	private isConnected = false;
	private connectionPromise: Promise<void> | null = null;
	private connectionResolve: (() => void) | null = null;
	private messageQueue: IframeMessage[] = [];
	private isProcessingQueue = false;
	private queueProcessCount = 0;
	private readonly maxQueueProcessAttempts = 10;
	private readonly maxQueueSize = 50;

	constructor() {
		this.handleIncomingMessages = this.handleIncomingMessages.bind(this);
		window.addEventListener("message", this.handleIncomingMessages);

		this.setupNavigationCleanup();
	}

	public get isConnectedToIframe(): boolean {
		return this.isConnected;
	}

	private setupNavigationCleanup(): void {
		window.addEventListener("beforeunload", () => {
			this.reset();
		});

		window.addEventListener("popstate", () => {
			this.reset();
		});

		if (typeof MutationObserver !== "undefined") {
			const observer = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type === "childList" && this.iframeRef) {
						if (!document.contains(this.iframeRef)) {
							LoggerService.debug(
								namespaces.iframeCommService,
								t("debug.iframeComm.iframeRemovedFromDOM", { ns: "services" })
							);
							this.reset();
							this.iframeRef = null;
						}
					}
				});
			});

			observer.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}
	}

	public setIframe(iframe: HTMLIFrameElement): void {
		if (this.iframeRef === iframe) {
			return;
		}

		if (this.iframeRef !== iframe) {
			this.reset();
		}

		this.iframeRef = iframe;
	}

	public destroy(): void {
		LoggerService.debug(namespaces.iframeCommService, t("debug.iframeComm.destroyingService", { ns: "services" }));

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		this.pendingRequests.forEach((request, _requestId) => {
			request.reject(new Error(t("errors.iframeComm.serviceDestroyedDuringNavigation", { ns: "services" })));
		});

		this.listeners = [];
		this.pendingRequests.clear();
		this.isConnected = false;
		this.iframeRef = null;
		this.messageQueue = [];
		this.queueProcessCount = 0;
		this.isProcessingQueue = false;
		this.connectionPromise = null;
		this.connectionResolve = null;
	}

	public reset(): void {
		LoggerService.debug(namespaces.iframeCommService, t("debug.iframeComm.resettingService", { ns: "services" }));

		this.isConnected = false;
		this.connectionPromise = null;
		this.connectionResolve = null;
		this.messageQueue = [];
		this.queueProcessCount = 0;
		this.isProcessingQueue = false;

		this.pendingRequests.forEach((request) => {
			request.reject(new Error(t("errors.iframeComm.serviceResetDuringNavigation", { ns: "services" })));
		});
		this.pendingRequests.clear();
	}

	private async initiateHandshake(): Promise<void> {
		if (!this.iframeRef) {
			throw new Error(t("errors.iframeComm.iframeReferenceNotSet", { ns: "services" }));
		}

		if (this.isConnected || this.connectionPromise) {
			return;
		}

		this.connectionPromise = new Promise((resolve) => {
			this.connectionResolve = resolve;
		});

		const handshakeMessage: HandshakeMessage = {
			type: MessageTypes.HANDSHAKE,
			source: CONFIG.APP_SOURCE,
			data: {
				version: CONFIG.APP_VERSION,
			},
		};

		try {
			await this.sendMessage(handshakeMessage);
			LoggerService.debug(
				namespaces.iframeCommService,
				t("debug.iframeComm.handshakeMessageSent", { ns: "services" })
			);
		} catch (error) {
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.failedToSendHandshakeMessage", { ns: "services", error })
			);
			this.connectionPromise = null;
			this.connectionResolve = null;
			throw error;
		}
	}

	public async waitForAnyMessage(): Promise<void> {
		if (this.isConnected) {
			return Promise.resolve();
		}

		return new Promise((resolve) => {
			this.connectionResolve = resolve;
		});
	}

	public async waitForConnection(): Promise<void> {
		if (this.isConnected) {
			LoggerService.debug(
				namespaces.iframeCommService,
				t("debug.iframeComm.alreadyConnected", { ns: "services" })
			);
			return Promise.resolve();
		}

		if (!this.connectionPromise) {
			LoggerService.debug(
				namespaces.iframeCommService,
				t("debug.iframeComm.noConnectionPromiseExists", { ns: "services" })
			);
			if (this.iframeRef) {
				await this.initiateHandshake();
			} else {
				return Promise.reject(
					new Error(t("errors.iframeComm.noConnectionAttemptInProgress", { ns: "services" }))
				);
			}
		}

		LoggerService.debug(
			namespaces.iframeCommService,
			t("debug.iframeComm.waitingForConnection", { ns: "services" })
		);
		return (
			this.connectionPromise ||
			Promise.reject(new Error(t("errors.iframeComm.noConnectionAttemptInProgress", { ns: "services" })))
		);
	}

	public async sendMessage<T>(message: IframeMessage<T>): Promise<void> {
		if (!this.iframeRef) {
			throw new Error(t("errors.iframeComm.iframeReferenceNotSet", { ns: "services" }));
		}

		if (!document.contains(this.iframeRef)) {
			return;
		}

		const messageToSend = { ...message, source: CONFIG.APP_SOURCE };

		if (
			!this.isConnected &&
			message.type !== MessageTypes.HANDSHAKE &&
			message.type !== MessageTypes.HANDSHAKE_ACK
		) {
			if (this.messageQueue.length >= this.maxQueueSize) {
				LoggerService.debug(
					namespaces.iframeCommService,
					t("debug.iframeComm.messageQueueFull", { ns: "services", maxQueueSize: this.maxQueueSize })
				);
				this.messageQueue.splice(0, this.messageQueue.length - this.maxQueueSize + 1);
			}

			this.messageQueue.push(messageToSend);
			if (!this.isProcessingQueue) {
				void this.processMessageQueue();
			}
			return;
		}

		if (this.iframeRef.contentWindow) {
			const targetOrigin = this.getTargetOrigin();
			LoggerService.debug(
				namespaces.iframeCommService,
				t("debug.iframeComm.postingMessageToChatbot", {
					ns: "services",
					origin: targetOrigin,
					message: JSON.stringify(messageToSend),
				})
			);
			this.iframeRef.contentWindow.postMessage(messageToSend, targetOrigin);
		} else {
			throw new Error(t("errors.iframeComm.iframeContentWindowNotAvailable", { ns: "services" }));
		}
	}

	private async processMessageQueue(): Promise<void> {
		if (this.isProcessingQueue || this.messageQueue.length === 0) {
			return;
		}

		this.queueProcessCount++;
		if (this.queueProcessCount > this.maxQueueProcessAttempts) {
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.queueProcessingExceeded", {
					ns: "services",
					maxAttempts: this.maxQueueProcessAttempts,
				})
			);
			this.messageQueue = [];
			this.queueProcessCount = 0;
			return;
		}

		this.isProcessingQueue = true;
		try {
			const batchSize = 5;
			let processed = 0;
			const targetOrigin = this.getTargetOrigin();

			while (this.messageQueue.length > 0 && processed < batchSize) {
				if (!this.isConnected) {
					break;
				}

				const message = this.messageQueue.shift();
				if (message) {
					if (this.iframeRef?.contentWindow) {
						this.iframeRef.contentWindow.postMessage(message, targetOrigin);
					}
					processed++;
				}
			}

			if (this.messageQueue.length > 0 && this.isConnected) {
				setTimeout(() => {
					this.isProcessingQueue = false;
					void this.processMessageQueue();
				}, 10);
			} else {
				this.queueProcessCount = 0;
			}
		} finally {
			if (this.messageQueue.length === 0 || !this.isConnected) {
				this.isProcessingQueue = false;
				this.queueProcessCount = 0;
			}
		}
	}

	public sendEvent<T>(eventName: string, payload: T): void {
		const message: EventMessage = {
			type: MessageTypes.EVENT,
			source: CONFIG.APP_SOURCE,
			data: {
				eventName,
				payload,
			},
		};
		this.sendMessage(message);
	}

	public safeSendEvent<T>(eventName: string, payload: T): void {
		try {
			if (!this.iframeRef || !document.contains(this.iframeRef)) {
				return;
			}
			this.sendEvent(eventName, payload);
		} catch (error) {
			LoggerService.debug(
				namespaces.iframeCommService,
				t("debug.iframeComm.failedToSendEvent", {
					ns: "services",
					eventName,
					error: (error as Error).message,
				})
			);
		}
	}

	public sendCodeSuggestionAccepted(
		fileName: string,
		operation: "add" | "modify" | "remove",
		suggestionId?: string
	): void {
		const message: CodeSuggestionAcceptedMessage = {
			type: MessageTypes.CODE_SUGGESTION_ACCEPTED,
			source: CONFIG.APP_SOURCE,
			data: {
				fileName,
				operation,
				suggestionId,
			},
		};

		LoggerService.debug(
			namespaces.iframeCommService,
			t("debug.iframeComm.sendingCodeSuggestionAccepted", {
				ns: "services",
				fileName,
				operation,
			})
		);

		this.sendMessage(message);
	}

	public sendCodeSuggestionRejected(
		fileName: string,
		operation: "add" | "modify" | "remove",
		suggestionId?: string,
		reason?: string
	): void {
		const message: CodeSuggestionRejectedMessage = {
			type: MessageTypes.CODE_SUGGESTION_REJECTED,
			source: CONFIG.APP_SOURCE,
			data: {
				fileName,
				operation,
				suggestionId,
				reason,
			},
		};

		LoggerService.debug(
			namespaces.iframeCommService,
			t("debug.iframeComm.sendingCodeSuggestionRejected", {
				ns: "services",
				fileName,
				operation,
				reason,
			})
		);

		this.sendMessage(message);
	}

	public sendDatadogSessionId(sessionId: string): void {
		const message: DatadogSetSessionIdMessage = {
			type: MessageTypes.DATADOG_SET_SESSION_ID,
			source: CONFIG.APP_SOURCE,
			data: sessionId,
		};

		LoggerService.debug(
			namespaces.iframeCommService,
			t("debug.iframeComm.sendingDatadogSessionId", {
				ns: "services",
				sessionId: sessionId.substring(0, 8) + "...",
			})
		);

		this.sendMessage(message);
	}

	public sendDatadogViewId(viewId: string): void {
		const message: DatadogSetViewIdMessage = {
			type: MessageTypes.DATADOG_SET_VIEW_ID,
			source: CONFIG.APP_SOURCE,
			data: viewId,
		};

		LoggerService.debug(
			namespaces.iframeCommService,
			t("debug.iframeComm.sendingDatadogViewId", {
				ns: "services",
				viewId: viewId.substring(0, 8) + "...",
			})
		);

		this.sendMessage(message);
	}

	public sendDatadogContext(): void {
		if (!this.isConnected || !this.iframeRef) {
			return;
		}

		void import("@src/utilities/datadog.utils")
			.then(({ DatadogUtils }) => {
				const sessionId = DatadogUtils.getSessionId();
				const viewId = DatadogUtils.getViewId();

				if (sessionId) {
					this.sendDatadogSessionId(sessionId);
				}

				if (viewId) {
					this.sendDatadogViewId(viewId);
				}

				return undefined;
			})
			.catch((error) => {
				LoggerService.error(
					namespaces.iframeCommService,
					t("errors.iframeComm.errorImportingDatadogUtils", {
						ns: "services",
						error,
					})
				);
			});
	}

	public async requestData<T>(resource: string, originalRequestId?: string): Promise<T> {
		if (!this.isConnected) {
			await this.waitForConnection();
		}

		return new Promise<T>((resolve, reject) => {
			const requestId = originalRequestId || uuidv4();

			const existingRequest = Array.from(this.pendingRequests.values()).find(
				(req) => req.resource === resource && req.requestId !== requestId
			);

			if (existingRequest) {
				LoggerService.debug(
					namespaces.iframeCommService,
					t("debug.iframeComm.duplicateRequestForResource", {
						ns: "services",
						resource,
					})
				);
				return;
			}

			const currentRequest = this.pendingRequests.get(requestId);
			const retryCount = currentRequest?.retries || 0;

			if (retryCount >= CONFIG.MAX_RETRIES) {
				this.pendingRequests.delete(requestId);
				reject(new Error(t("errors.iframeComm.requestTimeoutForResource", { ns: "services", resource })));
				return;
			}

			this.pendingRequests.set(requestId, {
				requestId,
				resource,
				resolve: (value: unknown) => resolve(value as T),
				reject,
				retries: retryCount,
			});

			this.sendMessage({
				type: MessageTypes.DATA_REQUEST,
				source: CONFIG.APP_SOURCE,
				data: {
					requestId,
					resource,
				},
			});

			const timeout = CONFIG.REQUEST_TIMEOUT * Math.pow(2, retryCount);

			setTimeout(
				() => {
					if (this.pendingRequests.has(requestId)) {
						const request = this.pendingRequests.get(requestId);
						if (request && request.retries < CONFIG.MAX_RETRIES) {
							request.retries++;
							void this.requestData<T>(resource, requestId).then(resolve).catch(reject);
						} else {
							this.pendingRequests.delete(requestId);
							reject(
								new Error(
									t("errors.iframeComm.requestTimeoutForResource", { ns: "services", resource })
								)
							);
						}
					}
				},
				Math.min(timeout, 30000)
			);
		});
	}

	public addListener(type: MessageTypes | string, callback: (message: AkbotMessage) => void): string {
		const id = uuidv4();
		this.listeners.push({ id, type, callback });
		return id;
	}

	public removeListener(id: string): void {
		this.listeners = this.listeners.filter((listener) => listener.id !== id);
	}

	private handleErrorMessage(message: ErrorMessage): void {
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

	private handleEventMessage(message: EventMessage): void {
		if (message.data.eventName === "IFRAME_READY" && !this.isConnected) {
			this.isConnected = true;
			if (this.connectionResolve) {
				this.connectionResolve();
				this.connectionResolve = null;
			}
		}
	}

	private getTargetOrigin(): string {
		if (this.iframeRef && this.iframeRef.src) {
			try {
				const iframeOrigin = new URL(this.iframeRef.src).origin;
				return iframeOrigin;
			} catch (error) {
				LoggerService.debug(
					namespaces.iframeCommService,
					t("debug.iframeComm.errorParsingIframeOrigin", {
						ns: "services",
						error: (error as Error).message,
						iframeRefSrc: this.iframeRef.src,
					})
				);
			}
		}

		return this.expectedOrigin || aiChatbotOrigin;
	}

	private isValidOrigin(origin: string): boolean {
		if (origin.includes("autokitteh.cloud")) {
			return true;
		}

		if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
			return true;
		}

		return false;
	}

	private isValidMessage(message: unknown): message is AkbotMessage {
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
	}

	private async handleIncomingMessages(event: MessageEvent): Promise<void> {
		try {
			if (!this.iframeRef || !document.contains(this.iframeRef)) {
				return;
			}

			if (event.origin === (this.expectedOrigin || aiChatbotOrigin) && !this.isConnected) {
				this.isConnected = true;
				if (this.connectionResolve) {
					this.connectionResolve();
					this.connectionResolve = null;
				}
				this.sendDatadogContext();
			}

			if (!this.isValidOrigin(event.origin)) {
				LoggerService.debug(
					namespaces.iframeCommService,
					t("debug.iframeComm.invalidOrigin", {
						ns: "services",
						origin: event.origin,
						expectedOrigin: this.expectedOrigin || aiChatbotOrigin,
					})
				);
				try {
					const raw: any = event.data as any;
					LoggerService.debug(
						namespaces.iframeCommService,
						`Filtered message due to origin mismatch: type=${String(raw?.type)} source=${String(raw?.source)}`
					);
				} catch (error) {
					LoggerService.debug(
						namespaces.iframeCommService,
						`Filtered message due to origin mismatch: error extracting type/source ${error}`
					);
				}
				return;
			}

			const message = event.data as AkbotMessage;

			if (!Object.values(MessageTypes).includes(message?.type)) {
				if (
					(message as any)?.source === "react-devtools-content-script" ||
					(message as any)?.source === "react-devtools-bridge"
				)
					return;
			}

			if (
				(message as any)?.vscodeScheduleAsyncWork ||
				Object.prototype.hasOwnProperty.call(message, "vscodeScheduleAsyncWork")
			) {
				return;
			}

			if (!this.isValidMessage(message)) {
				LoggerService.debug(
					namespaces.iframeCommService,
					t("debug.iframeComm.invalidMessageFormat", { ns: "services" })
				);
				return;
			}

			if (this.messageQueue.length > 0) {
				await this.processMessageQueue();
			}

			switch (message.type) {
				case MessageTypes.HANDSHAKE: {
					const handshakeAckMessage: HandshakeAckMessage = {
						type: MessageTypes.HANDSHAKE_ACK,
						source: CONFIG.APP_SOURCE,
						data: {
							version: CONFIG.APP_VERSION,
						},
					};
					this.sendMessage(handshakeAckMessage);
					break;
				}
				case MessageTypes.HANDSHAKE_ACK:
					break;
				case MessageTypes.EVENT:
					this.handleEventMessage(message as EventMessage);
					break;
				case MessageTypes.ERROR:
					this.handleErrorMessage(message as ErrorMessage);
					break;
				case MessageTypes.DISPLAY_DIAGRAM:
					this.handleDiagramDisplayMessage(message as DiagramDisplayMessage);
					break;
				case MessageTypes.VAR_UPDATED:
					this.handleVarUpdatedMessage(message as VarUpdatedMessage);
					break;
				case MessageTypes.REFRESH_DEPLOYMENTS:
					this.handleRefreshDeploymentsMessage(message as RefreshDeploymentsMessage);
					break;
				case MessageTypes.NAVIGATE_TO_BILLING:
					this.handleNavigateToBillingMessage(message as NavigateToBillingMessage);
					break;
				case MessageTypes.CODE_FIX_SUGGESTION:
					this.handleCodeFixSuggestionMessage(message as CodeFixSuggestionMessage);
					break;
				case MessageTypes.CODE_FIX_SUGGESTION_ALL:
					this.handleCodeFixSuggestionAllMessage(message as CodeFixSuggestionAllMessage);
					break;
				case MessageTypes.DOWNLOAD_DUMP:
					this.handleDownloadDumpMessage(message as DownloadDumpMessage);
					break;
				case MessageTypes.DOWNLOAD_CHAT:
					this.handleDownloadChatMessage(message as DownloadChatMessage);
					break;
			}

			this.listeners
				.filter((listener) => listener.type === message.type)
				.forEach((listener) => {
					listener.callback(message);
				});
		} catch (error) {
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.errorProcessingIncomingMessage", {
					ns: "services",
					error,
				})
			);
		}
	}

	private handleDiagramDisplayMessage(message: DiagramDisplayMessage): void {
		void import("@src/store")
			.then(({ useModalStore }) => {
				const { openModal } = useModalStore.getState();
				const { content } = message.data;

				if (content) {
					const trimmedContent = content.trim();
					const isYamlContent =
						trimmedContent.startsWith("version:") ||
						trimmedContent.includes("project:") ||
						trimmedContent.includes("connections:") ||
						trimmedContent.includes("triggers:");

					if (isYamlContent) {
						const filename = "autokitteh.yaml";
						openModal(ModalName.fileViewer, {
							filename,
							content,
							language: "yaml",
						});
					} else {
						openModal(ModalName.diagramViewer, { content });
					}
				}
				return true;
			})
			.catch((error) => {
				LoggerService.error(
					namespaces.iframeCommService,
					t("errors.iframeComm.errorImportingStoreForDiagramDisplayHandling", {
						ns: "services",
						error,
					})
				);
			});
	}

	private handleVarUpdatedMessage(message: VarUpdatedMessage): void {
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
				LoggerService.error(
					namespaces.iframeCommService,
					t("errors.iframeComm.errorImportingStoreForVarUpdatedHandling", {
						ns: "services",
						error,
					})
				);
			});
	}

	private handleRefreshDeploymentsMessage(_message: RefreshDeploymentsMessage): void {
		// mark param as used for linting while keeping signature for type-safety
		void _message;
		triggerEvent(EventListenerName.refreshDeployments);
	}

	private handleNavigateToBillingMessage(_message: NavigateToBillingMessage): void {
		// mark param as used for linting while keeping signature for type-safety
		void _message;
		try {
			window.location.href = "/organization-settings/billing";
		} catch (error) {
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.errorNavigatingToBilling", {
					ns: "services",
					error: (error as Error).message,
				})
			);
		}
	}

	private handleCodeFixSuggestionMessage(message: CodeFixSuggestionMessage): void {
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

	private async handleCodeFixSuggestionAllMessage(message: CodeFixSuggestionAllMessage): Promise<void> {
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
				LoggerService.error(
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

	private handleDownloadDumpMessage(message: DownloadDumpMessage): void {
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
				source: CONFIG.APP_SOURCE,
				data: {
					success: true,
				},
			});
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";

			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.failedToDownloadFile", {
					ns: "services",
					filename,
					error: errorMessage,
				})
			);

			this.sendMessage({
				type: MessageTypes.DOWNLOAD_DUMP_RESPONSE,
				source: CONFIG.APP_SOURCE,
				data: {
					success: false,
					error: errorMessage,
				},
			});
		}
	}

	private handleDownloadChatMessage(message: DownloadChatMessage): void {
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
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.failedToDownloadChatFile", {
					ns: "services",
					filename,
					error: errorMessage,
				})
			);
		}
	}
}
export const iframeCommService = new IframeCommService();
