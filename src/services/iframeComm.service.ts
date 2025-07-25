import { t } from "i18next";
import { v4 as uuidv4 } from "uuid";

import { LoggerService } from "@services/logger.service";
import { aiChatbotOrigin, namespaces } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { ModalName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks/useEventListener";
import {
	AkbotMessage,
	CodeFixSuggestionMessage,
	DiagramDisplayMessage,
	DownloadDumpMessage,
	ErrorMessage,
	EventMessage,
	HandshakeMessage,
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

interface MessageListener {
	id: string;
	type: MessageTypes | string;
	callback: (message: AkbotMessage) => void;
}

interface PendingRequest {
	requestId: string;
	resource: string;
	resolve: (value: unknown) => void;
	reject: (error: Error) => void;
	retries: number;
}

/**
 * Service for managing communication between the web platform and the chatbot iframe.
 * Handles message passing, connection management, and error handling.
 *
 * Features:
 * - Secure origin validation
 * - Message queuing during connection establishment
 * - Automatic retry logic for failed requests
 * - Event-based communication system
 * - TypeScript type safety for all message types
 *
 * @example
 * ```typescript
 * // Send an event to the chatbot
 * iframeCommService.sendEvent('CUSTOM_EVENT', { data: 'value' });
 *
 * // Listen for messages from the chatbot
 * const listenerId = iframeCommService.addListener(MessageTypes.NAVIGATE_TO_PROJECT, (message) => {
 *   console.log('Navigation requested:', message);
 * });
 *
 * // Clean up listener
 * iframeCommService.removeListener(listenerId);
 * ```
 */
class IframeCommService {
	private listeners: MessageListener[] = [];
	private pendingRequests: Map<string, PendingRequest> = new Map();
	private iframeRef: HTMLIFrameElement | null = null;
	private isConnected = false;
	private connectionPromise: Promise<void> | null = null;
	private connectionResolve: (() => void) | null = null;
	private messageQueue: IframeMessage[] = [];
	private isProcessingQueue = false;

	constructor() {
		this.handleIncomingMessages = this.handleIncomingMessages.bind(this);
		window.addEventListener("message", this.handleIncomingMessages);
	}

	/**
	 * Sets the iframe reference and initiates handshake if not already connected.
	 * @param iframe - The HTMLIFrameElement to communicate with
	 */
	public setIframe(iframe: HTMLIFrameElement): void {
		this.iframeRef = iframe;
		if (this.iframeRef && !this.isConnected && !this.connectionPromise) {
			this.initiateHandshake();
		}
	}

	/**
	 * Cleans up all listeners, pending requests, and connection state.
	 * Should be called when the component unmounts or service is no longer needed.
	 */
	public destroy(): void {
		this.listeners = [];
		this.pendingRequests.clear();
		this.isConnected = false;
		this.iframeRef = null;
		this.messageQueue = [];
	}

	/**
	 * Initiates the handshake process with the chatbot iframe.
	 * Sets up connection promise and sends initial handshake message.
	 * @throws {Error} If iframe reference is not set
	 * @private
	 */
	private async initiateHandshake(): Promise<void> {
		if (!this.iframeRef) {
			throw new Error(t("iframeComm.iframeReferenceNotSet", { ns: "services" }));
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
			// DON'T set isConnected = true here
			await this.sendMessage(handshakeMessage);
			// Connection state will be set when we receive HANDSHAKE_ACK
		} catch (error) {
			this.connectionPromise = null;
			this.connectionResolve = null;
			throw error;
		}
	}

	/**
	 * Waits for the iframe connection to be established.
	 * @returns Promise that resolves when connection is ready
	 * @throws {Error} If no connection attempt is in progress
	 */
	public async waitForConnection(): Promise<void> {
		if (this.isConnected) {
			return Promise.resolve();
		}
		return (
			this.connectionPromise ||
			Promise.reject(new Error(t("iframeComm.noConnectionAttemptInProgress", { ns: "services" })))
		);
	}

	/**
	 * Sends a message to the chatbot iframe.
	 * Messages are queued if connection is not yet established.
	 * @param message - The message to send
	 * @throws {Error} If iframe reference is not set or content window is unavailable
	 */
	public async sendMessage<T>(message: IframeMessage<T>): Promise<void> {
		if (!this.iframeRef) {
			throw new Error(t("iframeComm.iframeReferenceNotSet", { ns: "services" }));
		}

		const messageToSend = { ...message, source: CONFIG.APP_SOURCE };

		if (!this.isConnected && message.type !== MessageTypes.HANDSHAKE) {
			this.messageQueue.push(messageToSend);
			if (!this.isProcessingQueue) {
				this.processMessageQueue();
			}
			return;
		}

		if (this.iframeRef.contentWindow) {
			this.iframeRef.contentWindow.postMessage(messageToSend, aiChatbotOrigin);
		} else {
			throw new Error(t("iframeComm.iframeContentWindowNotAvailable", { ns: "services" }));
		}
	}

	private async processMessageQueue(): Promise<void> {
		if (this.isProcessingQueue || this.messageQueue.length === 0) {
			return;
		}

		this.isProcessingQueue = true;
		try {
			while (this.messageQueue.length > 0) {
				const message = this.messageQueue[0];
				await this.sendMessage(message);
				this.messageQueue.shift();
			}
		} finally {
			this.isProcessingQueue = false;
		}
	}

	/**
	 * Sends an event to the chatbot iframe.
	 * @param eventName - The name of the event to send
	 * @param payload - The data payload to include with the event
	 */
	public sendEvent<T>(eventName: string, payload: T): void {
		const message: EventMessage = {
			type: MessageTypes.EVENT,
			source: CONFIG.APP_SOURCE,
			data: {
				eventName,
				payload,
			},
		};
		LoggerService.info(
			namespaces.iframeCommService,
			`Sending event: ${eventName} with payload: ${JSON.stringify(payload)}`
		);
		this.sendMessage(message);
	}

	/**
	 * Safely sends an event to the chatbot iframe.
	 * If the iframe is not available, the event is silently ignored with a warning log.
	 * @param eventName - The name of the event to send
	 * @param payload - The data payload to include with the event
	 */
	public safeSendEvent<T>(eventName: string, payload: T): void {
		try {
			this.sendEvent(eventName, payload);
		} catch (error) {
			LoggerService.warn(
				namespaces.iframeCommService,
				`Failed to send event ${eventName} to chatbot iframe: ${(error as Error).message}. This is expected if chatbot is not open.`
			);
		}
	}

	/**
	 * Requests data from the chatbot iframe with automatic retry logic.
	 * @param resource - The resource identifier to request
	 * @returns Promise that resolves with the requested data
	 * @throws {Error} If request times out after maximum retries
	 */
	public async requestData<T>(resource: string): Promise<T> {
		if (!this.isConnected) {
			await this.waitForConnection();
		}

		return new Promise<T>((resolve, reject) => {
			const requestId = uuidv4();

			this.pendingRequests.set(requestId, {
				requestId,
				resource,
				resolve: (value: unknown) => resolve(value as T),
				reject,
				retries: 0,
			});

			this.sendMessage({
				type: MessageTypes.DATA_REQUEST,
				source: CONFIG.APP_SOURCE,
				data: {
					requestId,
					resource,
				},
			});

			setTimeout(() => {
				if (this.pendingRequests.has(requestId)) {
					const request = this.pendingRequests.get(requestId);
					if (request && request.retries < CONFIG.MAX_RETRIES) {
						request.retries++;
						void this.requestData<T>(resource).then(resolve).catch(reject);
					} else {
						this.pendingRequests.delete(requestId);
						reject(new Error(t("iframeComm.requestTimeoutForResource", { ns: "services", resource })));
					}
				}
			}, CONFIG.REQUEST_TIMEOUT);
		});
	}

	/**
	 * Adds a listener for specific message types from the chatbot.
	 * @param type - The message type to listen for
	 * @param callback - Function to call when message is received
	 * @returns Unique listener ID for removal
	 */
	public addListener(type: MessageTypes | string, callback: (message: AkbotMessage) => void): string {
		const id = uuidv4();
		this.listeners.push({ id, type, callback });
		return id;
	}

	/**
	 * Removes a previously registered message listener.
	 * @param id - The listener ID returned from addListener
	 */
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

	/**
	 * Validates if the message origin is from a trusted source
	 */
	private isValidOrigin(origin: string): boolean {
		// Allow messages from the chatbot origin
		if (origin === aiChatbotOrigin) {
			return true;
		}

		// Allow localhost and development origins
		if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
			return true;
		}

		// Log suspicious origins
		// LoggerService.warn(namespaces.iframeCommService, `Message received from untrusted origin: ${origin}`);
		return false;
	}

	/**
	 * Validates the structure and content of incoming messages
	 */
	private isValidMessage(message: unknown): message is AkbotMessage {
		if (!message || typeof message !== "object") {
			return false;
		}

		const msg = message as Record<string, unknown>;

		// Check for required fields
		if (!msg.type || !msg.source || typeof msg.type !== "string" || typeof msg.source !== "string") {
			return false;
		}

		// Validate source
		if (msg.source !== CONFIG.AKBOT_SOURCE) {
			return false;
		}

		// Validate message type is a known enum value
		if (!Object.values(MessageTypes).includes(msg.type as MessageTypes)) {
			// eslint-disable-next-line no-console
			console.log(`Unknown message type received: ${msg.type}`);
			// LoggerService.warn(namespaces.iframeCommService, `Unknown message type received: ${msg.type}`);
			return false;
		}

		return true;
	}

	private async handleIncomingMessages(event: MessageEvent): Promise<void> {
		try {
			// Validate origin first for security
			if (!this.isValidOrigin(event.origin)) {
				return;
			}

			const message = event.data as AkbotMessage;

			if (!Object.values(MessageTypes).includes(message?.type)) {
				return; // Ignore messages that are not part of the MessageTypes enum
			}

			// Filter out VSCode extension messages
			if (
				(message as any)?.vscodeScheduleAsyncWork ||
				Object.prototype.hasOwnProperty.call(message, "vscodeScheduleAsyncWork")
			) {
				return;
			}

			if (!this.isValidMessage(message)) {
				return;
			}

			switch (message.type) {
				case MessageTypes.HANDSHAKE:
					if (!this.isConnected) {
						this.isConnected = true;
						if (this.connectionResolve) {
							this.connectionResolve();
							this.connectionResolve = null;
						}
					}
					break;
				case MessageTypes.HANDSHAKE_ACK:
					this.isConnected = true;
					if (this.connectionResolve) {
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
			}

			this.listeners
				.filter((listener) => listener.type === message.type)
				.forEach((listener) => {
					listener.callback(message);
				});
		} catch (error) {
			LoggerService.error(
				namespaces.iframeCommService,
				t("iframeComm.errorProcessingIncomingMessage", { ns: "services", error })
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
					t("iframeComm.errorImportingStoreForDiagramDisplayHandling", { ns: "services", error })
				);
			});
	}

	private handleVarUpdatedMessage(message: VarUpdatedMessage): void {
		void import("@src/store/cache/useCacheStore")
			.then(({ useCacheStore }) => {
				// eslint-disable-next-line no-console
				console.log("Fetching variables for project:", message);

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
					t("iframeComm.errorImportingStoreForVarUpdatedHandling", { ns: "services", error })
				);
			});
	}

	private handleCodeFixSuggestionMessage(message: CodeFixSuggestionMessage): void {
		const { startLine, endLine, newCode, fileName } = message.data;

		LoggerService.info(
			namespaces.iframeCommService,
			`Received code fix suggestion for lines ${startLine}-${endLine}+ in file ${fileName}: ${newCode}`
		);

		// Use triggerEvent from useEventListener instead of window.dispatchEvent
		triggerEvent(EventListenerName.codeFixSuggestion, { startLine, endLine, newCode });
	}

	private handleDownloadDumpMessage(message: DownloadDumpMessage): void {
		const { filename, content, contentType } = message.data;

		LoggerService.info(namespaces.iframeCommService, `Received download dump request for file: ${filename}`);

		try {
			// Create blob with the content
			const blob = new Blob([content], { type: contentType });

			// Create download URL
			const url = URL.createObjectURL(blob);

			// Create download link
			const link = document.createElement("a");
			link.href = url;
			link.download = filename;
			link.style.display = "none";

			// Append to body, click, and remove
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);

			// Clean up the URL
			URL.revokeObjectURL(url);

			// Send success response back to chatbot
			this.sendMessage({
				type: MessageTypes.DOWNLOAD_DUMP_RESPONSE,
				source: CONFIG.APP_SOURCE,
				data: {
					success: true,
				},
			});

			LoggerService.info(namespaces.iframeCommService, `Successfully downloaded file: ${filename}`);
		} catch (error) {
			const errorMessage = error instanceof Error ? error.message : "Unknown error";

			LoggerService.error(namespaces.iframeCommService, `Failed to download file ${filename}: ${errorMessage}`);

			// Send error response back to chatbot
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
}
export const iframeCommService = new IframeCommService();
