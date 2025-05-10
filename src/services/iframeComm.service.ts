/* eslint-disable no-console */
import { v4 as uuidv4 } from "uuid";

import { HttpService } from "./http.service";
import { aiChatbotOrigin } from "@src/constants";
import {
	AkbotMessage,
	EventMessage,
	IframeMessage,
	MessageTypes,
	HandshakeMessage,
	ErrorMessage,
} from "@src/types/iframeCommunication.type";

// Configuration
const CONFIG = {
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
		console.log("iframeCommService instance created", new Date().toISOString());
		this.handleIncomingMessages = this.handleIncomingMessages.bind(this);
		window.addEventListener("message", this.handleIncomingMessages);
	}

	public setIframe(iframe: HTMLIFrameElement): void {
		this.iframeRef = iframe;
		if (this.iframeRef && !this.isConnected && !this.connectionPromise) {
			console.log("[DEBUG] Initiating handshake with new iframe");
			this.initiateHandshake();
		}
	}

	public destroy(): void {
		window.removeEventListener("message", this.handleIncomingMessages);
		this.listeners = [];
		this.pendingRequests.clear();
		this.isConnected = false;
		this.iframeRef = null;
		this.messageQueue = [];
	}

	private async initiateHandshake(): Promise<void> {
		if (!this.iframeRef) {
			throw new Error("Iframe reference not set");
		}

		if (this.isConnected || this.connectionPromise) {
			console.log("[DEBUG] Handshake already in progress or connection already established.");
			return;
		}

		console.log("[DEBUG] Initiating handshake with akbot iframe");
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
			// Temporarily set isConnected to true to allow the handshake message to be sent
			this.isConnected = true;
			await this.sendMessage(handshakeMessage);
			console.log("[DEBUG] Handshake message sent successfully");
			// Reset isConnected until we get the acknowledgment
			this.isConnected = false;
		} catch (error) {
			this.isConnected = false;
			console.error("[DEBUG] Failed to send handshake message:", error);
			throw error;
		}
	}

	public async waitForConnection(): Promise<void> {
		if (this.isConnected) {
			return Promise.resolve();
		}
		return this.connectionPromise || Promise.reject(new Error("No connection attempt in progress"));
	}

	public async sendMessage<T>(message: IframeMessage<T>): Promise<void> {
		if (!this.iframeRef) {
			throw new Error("Iframe reference not set");
		}

		const messageToSend = { ...message, source: CONFIG.APP_SOURCE };

		// Only queue non-handshake messages when not connected
		if (!this.isConnected && message.type !== MessageTypes.HANDSHAKE) {
			console.log("[DEBUG] Not connected, queueing message");
			this.messageQueue.push(messageToSend);
			if (!this.isProcessingQueue) {
				this.processMessageQueue();
			}
			return;
		}

		if (this.iframeRef.contentWindow) {
			try {
				console.log("[DEBUG] Sending message to iframe:", messageToSend);
				this.iframeRef.contentWindow.postMessage(messageToSend, aiChatbotOrigin);
			} catch (error) {
				console.error("[DEBUG] Error sending message to iframe:", error);
				throw error;
			}
		} else {
			throw new Error("Iframe contentWindow is not available");
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
						reject(new Error(`Request timeout for resource: ${resource}`));
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

	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	private async handleHandshakeMessage(_message: HandshakeMessage): Promise<void> {
		console.log("[DEBUG] Received HANDSHAKE from akbot, sending acknowledgment");
		await this.sendMessage({
			type: MessageTypes.HANDSHAKE,
			source: CONFIG.APP_SOURCE,
			data: {
				version: CONFIG.APP_VERSION,
			},
		});

		if (!this.isConnected) {
			console.log("[DEBUG] Connection established via HANDSHAKE from akbot");
			this.isConnected = true;
			if (this.connectionResolve) {
				this.connectionResolve();
				this.connectionResolve = null;
			}
			// Process any queued messages
			if (this.messageQueue.length > 0) {
				await this.processMessageQueue();
			}
		}
	}

	private handleErrorMessage(message: ErrorMessage): void {
		const { code, message: errorMessage } = message.data;
		console.error(`Error from akbot: ${code} - ${errorMessage}`);

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
		console.log(`[DEBUG] Received EVENT message with name: ${message.data.eventName}`);
		console.log(`[DEBUG] Payload:`, message.data.payload);

		if (message.data.eventName === "IFRAME_READY" && !this.isConnected) {
			console.log(`Connection established via EVENT: IFRAME_READY`);
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
			console.log("[DEBUG] Received message:", message);

			if (!message || !message.type || message.source !== CONFIG.AKBOT_SOURCE) {
				console.warn("[DEBUG] Invalid message format or source:", message);
				return;
			}

			console.log(`[DEBUG] Processing message of type: ${message.type}`);

			switch (message.type) {
				case MessageTypes.HANDSHAKE:
					console.log("[DEBUG] Handling handshake message");
					await this.handleHandshakeMessage(message as HandshakeMessage);
					break;
				case MessageTypes.HANDSHAKE_ACK:
					console.log("[DEBUG] Handling handshake acknowledgment");
					await HttpService.post("http://localhost:9980/ai/api/init-db");
					this.isConnected = true;
					if (this.connectionResolve) {
						this.connectionResolve();
						this.connectionResolve = null;
					}
					// Process any queued messages
					if (this.messageQueue.length > 0) {
						await this.processMessageQueue();
					}
					break;
				case MessageTypes.EVENT:
					console.log("[DEBUG] Handling event message");
					this.handleEventMessage(message as EventMessage);
					break;
				case MessageTypes.ERROR:
					console.log("[DEBUG] Handling error message");
					this.handleErrorMessage(message as ErrorMessage);
					break;
			}

			// Notify all matching listeners
			this.listeners
				.filter((listener) => listener.type === message.type)
				.forEach((listener) => {
					try {
						listener.callback(message);
					} catch (error) {
						console.error("[DEBUG] Error in message listener:", error);
					}
				});
		} catch (error) {
			console.error("[DEBUG] Error processing incoming message:", error);
		}
	}
}

// Create a singleton instance
export const iframeCommService = new IframeCommService();
