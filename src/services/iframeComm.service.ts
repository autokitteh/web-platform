import { t } from "i18next";
import { v4 as uuidv4 } from "uuid";

import { MessageListener, PendingRequest } from "@interfaces/services";
import { LoggerService } from "@services";
import { aiChatbotOrigin, aiChatbotUrl, namespaces } from "@src/constants";
import {
	AkbotMessage,
	CodeFixSuggestionMessage,
	CodeFixSuggestionAllMessage,
	CodeSuggestionAcceptedMessage,
	CodeSuggestionRejectedMessage,
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
	SetContextMessage,
	VarUpdatedMessage,
} from "@src/types/iframeCommunication.type";
import { CorrelationIdUtils } from "@src/utilities";
import {
	handleCodeFixSuggestionAllMessage,
	handleCodeFixSuggestionMessage,
	handleDiagramDisplayMessage,
	handleDownloadChatMessage,
	handleDownloadDumpMessage,
	handleErrorMessage,
	handleEventMessage,
	handleNavigateToBillingMessage,
	handleRefreshDeploymentsMessage,
	handleVarUpdatedMessage,
	isValidAkbotMessage,
	isValidOrigin,
	shouldIgnoreMessage,
} from "@src/utilities/iframeMessageHandlers.utils";

export const CONFIG = {
	APP_SOURCE: "web-platform-new",
	AKBOT_SOURCE: "akbot",
	APP_VERSION: "1.0",
	REQUEST_TIMEOUT: 10000,
	MAX_RETRIES: 3,
	RETRY_DELAY: 1000,
} as const;

const parseOrigin = (url: string | undefined, errorContext?: string): string => {
	if (!url) {
		return "";
	}

	try {
		if (url.startsWith("http://") || url.startsWith("https://")) {
			return new URL(url).origin;
		}

		return url.replace(/\/$/, "");
	} catch (error) {
		if (errorContext) {
			LoggerService.error(namespaces.iframeCommService, `${errorContext}: ${url}: ${error}`);
		}

		return "";
	}
};

class IframeCommService {
	private readonly expectedOrigin: string = parseOrigin(
		aiChatbotOrigin,
		`Failed to parse aiChatbotOrigin or aiChatbotUrl: ${aiChatbotOrigin} ${aiChatbotUrl}`
	);
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
	private mutationObserver: MutationObserver | null = null;
	private readonly messageHandlers: Partial<Record<MessageTypes, (message: AkbotMessage) => void>> = {
		[MessageTypes.HANDSHAKE]: () => {
			const handshakeAckMessage: HandshakeAckMessage = {
				type: MessageTypes.HANDSHAKE_ACK,
				source: CONFIG.APP_SOURCE,
				data: { version: CONFIG.APP_VERSION },
			};
			this.sendMessage(handshakeAckMessage);
		},
		[MessageTypes.HANDSHAKE_ACK]: () => {},
		[MessageTypes.EVENT]: (msg) => this.handleEventMessageInternal(msg as EventMessage),
		[MessageTypes.ERROR]: (msg) => this.handleErrorMessageInternal(msg as ErrorMessage),
		[MessageTypes.DISPLAY_DIAGRAM]: (msg) => handleDiagramDisplayMessage(msg as DiagramDisplayMessage),
		[MessageTypes.VAR_UPDATED]: (msg) => handleVarUpdatedMessage(msg as VarUpdatedMessage),
		[MessageTypes.REFRESH_DEPLOYMENTS]: (msg) => handleRefreshDeploymentsMessage(msg as RefreshDeploymentsMessage),
		[MessageTypes.NAVIGATE_TO_BILLING]: (msg) => handleNavigateToBillingMessage(msg as NavigateToBillingMessage),
		[MessageTypes.CODE_FIX_SUGGESTION]: (msg) => handleCodeFixSuggestionMessage(msg as CodeFixSuggestionMessage),
		[MessageTypes.CODE_FIX_SUGGESTION_ALL]: (msg) =>
			handleCodeFixSuggestionAllMessage(msg as CodeFixSuggestionAllMessage),
		[MessageTypes.DOWNLOAD_DUMP]: (msg) =>
			handleDownloadDumpMessage(msg as DownloadDumpMessage, (m) => this.sendMessage(m)),
		[MessageTypes.DOWNLOAD_CHAT]: (msg) => handleDownloadChatMessage(msg as DownloadChatMessage),
	};

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
			this.mutationObserver = new MutationObserver((mutations) => {
				mutations.forEach((mutation) => {
					if (mutation.type === "childList" && this.iframeRef) {
						if (!document.contains(this.iframeRef)) {
							LoggerService.warn(
								namespaces.iframeCommService,
								t("errors.iframeComm.iframeRemovedFromDOM", { ns: "services" }),
								true
							);
							this.reset();
							this.iframeRef = null;
						}
					}
				});
			});

			this.mutationObserver.observe(document.body, {
				childList: true,
				subtree: true,
			});
		}
	}

	public setIframe(iframe: HTMLIFrameElement): void {
		if (this.iframeRef === iframe) {
			return;
		}

		this.reset();
		this.iframeRef = iframe;
	}

	public destroy(): void {
		window.removeEventListener("message", this.handleIncomingMessages);

		this.mutationObserver?.disconnect();
		this.mutationObserver = null;

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
			return Promise.resolve();
		}

		if (!this.connectionPromise) {
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.noConnectionPromiseExists", { ns: "services" })
			);
			if (this.iframeRef) {
				await this.initiateHandshake();
			} else {
				return Promise.reject(
					new Error(t("errors.iframeComm.noConnectionAttemptInProgress", { ns: "services" }))
				);
			}
		}

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
				LoggerService.error(
					namespaces.iframeCommService,
					t("errors.iframeComm.messageQueueFull", { ns: "services", maxQueueSize: this.maxQueueSize })
				);
				this.messageQueue = this.messageQueue.slice(-(this.maxQueueSize - 1));
			}

			this.messageQueue.push(messageToSend);
			if (!this.isProcessingQueue) {
				void this.processMessageQueue();
			}
			return;
		}

		if (this.iframeRef.contentWindow) {
			const targetOrigin = this.getTargetOrigin();
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
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.failedToSendEvent", {
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

		this.sendMessage(message);
	}

	public sendDatadogContext(context?: {
		currentOrganization?: { displayName?: string; id?: string; uniqueName?: string };
		user?: { email?: string; id?: string; name?: string };
	}): void {
		if (!this.isConnected || !this.iframeRef) {
			return;
		}

		void import("@src/utilities/datadog.utils")
			.then(async () => {
				if (context) {
					const contextData: SetContextMessage["data"] = {};

					const akCorrelationId = CorrelationIdUtils.get();
					if (akCorrelationId) {
						contextData.akCorrelationId = akCorrelationId;
					}

					if (context.currentOrganization?.id) {
						contextData.orgId = context.currentOrganization.id;
					}
					if (context.user?.id) {
						contextData.userId = context.user.id;
					}
					if (context.user?.email) {
						contextData.userEmail = context.user.email;
					}
					if (context.user?.name) {
						contextData.userName = context.user.name;
					}
					if (context.currentOrganization?.displayName) {
						contextData.orgDisplayName = context.currentOrganization.displayName;
					}
					if (context.currentOrganization?.uniqueName) {
						contextData.orgUniqueName = context.currentOrganization.uniqueName;
					}
					this.sendMessage({
						type: MessageTypes.DATADOG_SET_CONTEXT,
						source: CONFIG.APP_SOURCE,
						data: contextData,
					});
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

	public async requestData<T>(resource: string): Promise<T> {
		if (!this.isConnected) {
			await this.waitForConnection();
		}

		const existingRequest = Array.from(this.pendingRequests.values()).find((req) => req.resource === resource);

		if (existingRequest) {
			LoggerService.warn(
				namespaces.iframeCommService,
				t("errors.iframeComm.duplicateRequestForResource", {
					ns: "services",
					resource,
				})
			);

			return new Promise<T>((resolve, reject) => {
				const originalResolve = existingRequest.resolve;
				const originalReject = existingRequest.reject;
				existingRequest.resolve = (value: unknown) => {
					originalResolve(value);
					resolve(value as T);
				};
				existingRequest.reject = (error: Error) => {
					originalReject(error);
					reject(error);
				};
			});
		}

		for (let attempt = 0; attempt < CONFIG.MAX_RETRIES; attempt++) {
			try {
				return await this.sendDataRequestWithTimeout<T>(resource, attempt);
			} catch (error) {
				if (attempt === CONFIG.MAX_RETRIES - 1) {
					throw error;
				}
				await new Promise((resolve) => setTimeout(resolve, CONFIG.RETRY_DELAY * Math.pow(2, attempt)));
			}
		}

		throw new Error(t("errors.iframeComm.requestTimeoutForResource", { ns: "services", resource }));
	}

	private sendDataRequestWithTimeout<T>(resource: string, attempt: number): Promise<T> {
		return new Promise<T>((resolve, reject) => {
			const requestId = uuidv4();
			const timeout = Math.min(CONFIG.REQUEST_TIMEOUT * Math.pow(2, attempt), 30000);

			const timeoutId = setTimeout(() => {
				if (this.pendingRequests.has(requestId)) {
					this.pendingRequests.delete(requestId);
					reject(new Error(t("errors.iframeComm.requestTimeoutForResource", { ns: "services", resource })));
				}
			}, timeout);

			this.pendingRequests.set(requestId, {
				requestId,
				resource,
				resolve: (value: unknown) => {
					clearTimeout(timeoutId);
					this.pendingRequests.delete(requestId);
					resolve(value as T);
				},
				reject: (error: Error) => {
					clearTimeout(timeoutId);
					this.pendingRequests.delete(requestId);
					reject(error);
				},
				retries: attempt,
			});

			this.sendMessage({
				type: MessageTypes.DATA_REQUEST,
				source: CONFIG.APP_SOURCE,
				data: {
					requestId,
					resource,
				},
			});
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

	private handleErrorMessageInternal(message: ErrorMessage): void {
		const requestId = handleErrorMessage(message, this.pendingRequests);
		if (requestId) {
			this.pendingRequests.delete(requestId);
		}
	}

	private handleEventMessageInternal(message: EventMessage): void {
		const result = handleEventMessage(message, this.isConnected, this.connectionResolve, () =>
			this.sendDatadogContext()
		);
		if (result.shouldSetConnected) {
			this.isConnected = true;
		}
		if (result.shouldClearResolver) {
			this.connectionResolve = null;
		}
	}

	private getTargetOrigin(): string {
		if (this.iframeRef?.src) {
			const iframeOrigin = parseOrigin(
				this.iframeRef.src,
				t("errors.iframeComm.errorParsingIframeOrigin", {
					ns: "services",
					iframeRefSrc: this.iframeRef.src,
				})
			);
			if (iframeOrigin) {
				return iframeOrigin;
			}
		}

		return this.expectedOrigin;
	}

	private handleConnectionOnFirstMessage(eventOrigin: string): void {
		const origin = this.getTargetOrigin();
		if (eventOrigin === origin && !this.isConnected) {
			this.isConnected = true;
			if (this.connectionResolve) {
				this.connectionResolve();
				this.connectionResolve = null;
			}
			this.sendDatadogContext();
		}
	}

	private logInvalidOrigin(eventOrigin: string, messageData: unknown): void {
		LoggerService.error(
			namespaces.iframeCommService,
			t("errors.iframeComm.invalidOrigin", {
				ns: "services",
				origin: eventOrigin,
				expectedOrigin: this.expectedOrigin || aiChatbotOrigin,
			})
		);
		try {
			const raw = messageData as Record<string, unknown>;
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.filteredMessageOriginMismatch", {
					ns: "services",
					type: String(raw?.type),
					source: String(raw?.source),
				})
			);
		} catch (error) {
			LoggerService.error(
				namespaces.iframeCommService,
				t("errors.iframeComm.filteredMessageOriginMismatchError", {
					ns: "services",
					error,
				})
			);
		}
	}

	private handleIncomingMessages(event: MessageEvent): void {
		try {
			if (!this.iframeRef || !document.contains(this.iframeRef)) {
				return;
			}

			this.handleConnectionOnFirstMessage(event.origin);

			if (!isValidOrigin(event.origin)) {
				this.logInvalidOrigin(event.origin, event.data);
				return;
			}

			if (shouldIgnoreMessage(event.data)) {
				return;
			}

			if (!isValidAkbotMessage(event.data)) {
				LoggerService.error(
					namespaces.iframeCommService,
					t("errors.iframeComm.invalidMessageFormat", { ns: "services" }),
					true
				);
				return;
			}

			const message = event.data;

			if (this.messageQueue.length > 0) {
				void this.processMessageQueue();
			}

			const handler = this.messageHandlers[message.type];
			if (handler) {
				handler(message);
			}

			this.listeners
				.filter((listener) => listener.type === message.type)
				.forEach((listener) => listener.callback(message));
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
}
export const iframeCommService = new IframeCommService();
