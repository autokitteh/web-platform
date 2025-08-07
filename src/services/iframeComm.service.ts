/* eslint-disable no-console */
import { t } from "i18next";
import { v4 as uuidv4 } from "uuid";

import { MessageListener, PendingRequest } from "@interfaces/services";
import { aiChatbotOrigin } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks/useEventListener";
import {
	AkbotMessage,
	CodeFixSuggestionMessage,
	DiagramDisplayMessage,
	DownloadChatMessage,
	DownloadDumpMessage,
	ErrorMessage,
	EventMessage,
	HandshakeMessage,
	HandshakeAckMessage,
	IframeMessage,
	MessageTypes,
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
							console.debug("[IframeComm] Iframe removed from DOM - resetting service");
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
		console.debug("[IframeComm] Setting iframe reference");
		this.iframeRef = iframe;
		if (this.iframeRef && !this.isConnected && !this.connectionPromise) {
			setTimeout(() => {
				if (this.iframeRef && !this.isConnected && !this.connectionPromise) {
					this.initiateHandshake();
				}
			}, 100);
		}
	}

	public destroy(): void {
		console.debug("[IframeComm] Destroying service - cleaning up all resources");

		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		this.pendingRequests.forEach((request, _requestId) => {
			request.reject(new Error("Service destroyed during navigation"));
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
		console.debug("[IframeComm] Resetting service for navigation");

		this.isConnected = false;
		this.connectionPromise = null;
		this.connectionResolve = null;
		this.messageQueue = [];
		this.queueProcessCount = 0;
		this.isProcessingQueue = false;

		this.pendingRequests.forEach((request) => {
			request.reject(new Error("Service reset during navigation"));
		});
		this.pendingRequests.clear();
	}

	private async initiateHandshake(): Promise<void> {
		if (!this.iframeRef) {
			throw new Error(t("iframeComm.iframeReferenceNotSet", { ns: "services" }));
		}

		if (this.isConnected || this.connectionPromise) {
			return;
		}

		console.debug("[IframeComm] Initiating handshake with iframe");

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
			console.debug("[IframeComm] Handshake message sent");
		} catch (error) {
			console.error("[IframeComm] Failed to send handshake message:", error);
			this.connectionPromise = null;
			this.connectionResolve = null;
			throw error;
		}
	}

	public async waitForConnection(): Promise<void> {
		if (this.isConnected) {
			console.debug("[IframeComm] Already connected, returning");
			return Promise.resolve();
		}

		if (!this.connectionPromise) {
			console.debug("[IframeComm] No connection promise exists, trying to initiate handshake");
			if (this.iframeRef) {
				await this.initiateHandshake();
			} else {
				return Promise.reject(new Error(t("iframeComm.noConnectionAttemptInProgress", { ns: "services" })));
			}
		}

		console.debug("[IframeComm] Waiting for connection promise to resolve");
		return (
			this.connectionPromise ||
			Promise.reject(new Error(t("iframeComm.noConnectionAttemptInProgress", { ns: "services" })))
		);
	}

	public async sendMessage<T>(message: IframeMessage<T>): Promise<void> {
		if (!this.iframeRef) {
			throw new Error(t("iframeComm.iframeReferenceNotSet", { ns: "services" }));
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
				console.warn(`[IframeComm] Message queue full (${this.maxQueueSize}), dropping oldest messages`);
				this.messageQueue.splice(0, this.messageQueue.length - this.maxQueueSize + 1);
			}

			this.messageQueue.push(messageToSend);
			if (!this.isProcessingQueue) {
				void this.processMessageQueue();
			}
			return;
		}

		if (this.iframeRef.contentWindow) {
			console.debug(`[IframeComm] Posting message to chatbot at origin ${aiChatbotOrigin}:`, messageToSend);
			this.iframeRef.contentWindow.postMessage(messageToSend, aiChatbotOrigin);
		} else {
			throw new Error(t("iframeComm.iframeContentWindowNotAvailable", { ns: "services" }));
		}
	}

	private async processMessageQueue(): Promise<void> {
		if (this.isProcessingQueue || this.messageQueue.length === 0) {
			return;
		}

		this.queueProcessCount++;
		if (this.queueProcessCount > this.maxQueueProcessAttempts) {
			console.error(
				`[IframeComm] Queue processing exceeded max attempts (${this.maxQueueProcessAttempts}), clearing queue`
			);
			this.messageQueue = [];
			this.queueProcessCount = 0;
			return;
		}

		this.isProcessingQueue = true;
		try {
			const batchSize = 5;
			let processed = 0;

			while (this.messageQueue.length > 0 && processed < batchSize) {
				if (!this.isConnected) {
					break;
				}

				const message = this.messageQueue.shift();
				if (message) {
					if (this.iframeRef?.contentWindow) {
						this.iframeRef.contentWindow.postMessage(message, aiChatbotOrigin);
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
			console.warn(
				`[IframeComm] Failed to send event ${eventName} to chatbot iframe: ${(error as Error).message}. This is expected if chatbot is not open.`
			);
		}
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
				console.warn(`[IframeComm] Duplicate request for resource ${resource}, waiting for existing request`);
				return;
			}

			const currentRequest = this.pendingRequests.get(requestId);
			const retryCount = currentRequest?.retries || 0;

			if (retryCount >= CONFIG.MAX_RETRIES) {
				this.pendingRequests.delete(requestId);
				reject(new Error(t("iframeComm.requestTimeoutForResource", { ns: "services", resource })));
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
							reject(new Error(t("iframeComm.requestTimeoutForResource", { ns: "services", resource })));
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
			console.debug("[IframeComm] Received IFRAME_READY event");
			this.isConnected = true;
			if (this.connectionResolve) {
				console.debug("[IframeComm] Connection established via IFRAME_READY event");
				this.connectionResolve();
				this.connectionResolve = null;
			}
		}
	}

	private isValidOrigin(origin: string): boolean {
		if (origin === aiChatbotOrigin) {
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

			if (!this.isValidOrigin(event.origin)) {
				console.debug(`[IframeComm] Invalid origin: ${event.origin}, expected: ${aiChatbotOrigin}`);
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
				console.debug("[IframeComm] Invalid message format, message:", message);
				return;
			}

			console.debug(`[IframeComm] Received message:`, message);

			switch (message.type) {
				case MessageTypes.HANDSHAKE:
					console.debug("[IframeComm] Received handshake from iframe");
					if (!this.isConnected) {
						this.isConnected = true;
						if (this.connectionResolve) {
							console.debug("[IframeComm] Connection established via handshake");
							this.connectionResolve();
							this.connectionResolve = null;
							triggerEvent(EventListenerName.iframeHandshake);
						}

						const handshakeAckMessage: HandshakeAckMessage = {
							type: MessageTypes.HANDSHAKE_ACK,
							source: CONFIG.APP_SOURCE,
							data: {
								version: CONFIG.APP_VERSION,
							},
						};
						this.sendMessage(handshakeAckMessage);
					}
					break;
				case MessageTypes.HANDSHAKE_ACK:
					console.debug("[IframeComm] Received handshake ACK from iframe");
					this.isConnected = true;
					if (this.connectionResolve) {
						console.debug("[IframeComm] Connection established via handshake ACK");
						this.connectionResolve();
						this.connectionResolve = null;
					}
					if (this.messageQueue.length > 0) {
						await this.processMessageQueue();
					}
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
				case MessageTypes.CODE_FIX_SUGGESTION:
					this.handleCodeFixSuggestionMessage(message as CodeFixSuggestionMessage);
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
			console.error(`[IframeComm] Error processing incoming message: ${error}`);
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
				console.error(`[IframeComm] Error importing store for diagram display handling: ${error}`);
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
				console.error(`[IframeComm] Error importing store for var updated handling: ${error}`);
			});
	}

	private handleCodeFixSuggestionMessage(message: CodeFixSuggestionMessage): void {
		const { startLine, endLine, newCode } = message.data;

		triggerEvent(EventListenerName.codeFixSuggestion, { startLine, endLine, newCode });
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

			console.error(`[IframeComm] Failed to download file ${filename}: ${errorMessage}`);

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
			console.error(`[IframeComm] Failed to download chat file ${filename}: ${errorMessage}`);
		}
	}
}
export const iframeCommService = new IframeCommService();
