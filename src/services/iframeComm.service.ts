import { t } from "i18next";
import { v4 as uuidv4 } from "uuid";

import { LoggerService } from "@services/logger.service";
import { aiChatbotOrigin, namespaces } from "@src/constants";
import { ModalName } from "@src/enums/components";
import {
	AkbotMessage,
	DiagramDisplayMessage,
	ErrorMessage,
	EventMessage,
	HandshakeMessage,
	IframeMessage,
	MessageTypes,
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

	public setIframe(iframe: HTMLIFrameElement): void {
		this.iframeRef = iframe;
		if (this.iframeRef && !this.isConnected && !this.connectionPromise) {
			this.initiateHandshake();
		}
	}

	public destroy(): void {
		this.listeners = [];
		this.pendingRequests.clear();
		this.isConnected = false;
		this.iframeRef = null;
		this.messageQueue = [];
	}

	// Fix the initiateHandshake method:
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

	public async waitForConnection(): Promise<void> {
		if (this.isConnected) {
			return Promise.resolve();
		}
		return (
			this.connectionPromise ||
			Promise.reject(new Error(t("iframeComm.noConnectionAttemptInProgress", { ns: "services" })))
		);
	}

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

	private async handleIncomingMessages(event: MessageEvent): Promise<void> {
		try {
			const message = event.data as AkbotMessage;

			if (!message || typeof message !== "object") {
				// eslint-disable-next-line no-console
				console.error("Empty or invalid message received", {
					ns: "services",
					message: JSON.stringify(message),
				});
				return;
			}

			const knownBrowserExtensionSources = [
				"react-devtools-content-script",
				"react-devtools-bridge",
				"react-devtools-detector",
				"chrome-extension",
			];
			if (message?.source && knownBrowserExtensionSources.some((source) => message.source?.includes(source))) {
				return;
			}

			// Filter out VSCode extension messages
			if (
				(message as any)?.vscodeScheduleAsyncWork ||
				Object.prototype.hasOwnProperty.call(message, "vscodeScheduleAsyncWork")
			) {
				return;
			}
			if (!message.type || message.source !== CONFIG.AKBOT_SOURCE) {
				LoggerService.error(
					namespaces.iframeCommService,
					t("iframeComm.invalidMessageReceivedOrSourceMismatch", {
						ns: "services",
						message: JSON.stringify(message),
					})
				);
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
}
export const iframeCommService = new IframeCommService();
