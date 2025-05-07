/* eslint-disable no-console */
import { v4 as uuidv4 } from "uuid";

import { HttpService } from "./http.service";
import { AkbotMessage, EventMessage, IframeMessage, MessageTypes } from "@type/iframe-communication.type";

const appSource = "web-platform-new";
const akBotSource = "akbot";
// Debug environment variables
console.log("Environment variable check:", {
	VITE_AKBOT_ORIGIN: import.meta.env.VITE_AKBOT_ORIGIN,
	VITE_AKBOT_URL: import.meta.env.VITE_AKBOT_URL,
});
const akBotOrigin = import.meta.env.VITE_AKBOT_ORIGIN || "http://localhost:3000";
const appVersion = "1.0"; // This could be dynamically imported from package.json

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
}

class IframeCommService {
	private listeners: MessageListener[] = [];
	private pendingRequests: Map<string, PendingRequest> = new Map();
	private iframeRef: HTMLIFrameElement | null = null;
	private isConnected = false;
	private connectionPromise: Promise<void> | null = null;
	private connectionResolve: (() => void) | null = null;

	constructor() {
		console.log("iframeCommService instance created", new Date().toISOString());

		this.handleIncomingMessages = this.handleIncomingMessages.bind(this);
		window.addEventListener("message", this.handleIncomingMessages);
	}

	/**
	 * Set the iframe reference for communication
	 */
	public setIframe(iframe: HTMLIFrameElement): void {
		this.iframeRef = iframe;
		if (this.iframeRef) {
			// Initiate handshake when iframe is set
			if (!this.isConnected && !this.connectionPromise) {
				console.log("Initiating handshake with new iframe");
				this.initiateHandshake();
			} else {
				console.log("Connection already established or handshake in progress, skipping handshake");
			}
		}
	}

	/**
	 * Clean up event listeners
	 */
	public destroy(): void {
		// window.removeEventListener("message", this.handleIncomingMessages);
		// this.listeners = [];
		// this.pendingRequests.clear();
		// this.isConnected = false;
		// this.iframeRef = null;
	}

	/**
	 * Start the handshake process with the iframe
	 */
	private initiateHandshake(): void {
		if (!this.iframeRef) {
			throw new Error("Iframe reference not set");
		}

		// Prevent multiple handshakes
		if (this.isConnected || this.connectionPromise) {
			console.log("Handshake already in progress or connection already established.");
			return;
		}

		console.log("Initiating handshake with akbot iframe");
		this.connectionPromise = new Promise((resolve) => {
			this.connectionResolve = resolve;
		});

		const handshakeMessage = {
			type: MessageTypes.HANDSHAKE,
			source: appSource,
			data: {
				version: appVersion,
			},
		};
		console.log(`Sending handshake message: ${JSON.stringify(handshakeMessage)}, target origin: ${akBotOrigin}`);
		this.sendMessage(handshakeMessage);
		this.connectionPromise?.then(() => {
			this.isConnected = true;
			if (this.connectionResolve) {
				this.connectionResolve();
			}
			return this.isConnected;
		});
	}

	/**
	 * Wait for the handshake to complete
	 */
	public async waitForConnection(): Promise<void> {
		if (this.isConnected) {
			return Promise.resolve();
		}
		return this.connectionPromise || Promise.reject(new Error("No connection attempt in progress"));
	}

	/**
	 * Send a message to the iframe
	 */
	public sendMessage<T>(message: IframeMessage<T>): void {
		if (!this.iframeRef) {
			throw new Error("Iframe reference not set");
		}

		// Clone the message to avoid mutations
		const messageToSend = { ...message, source: appSource };
		console.log(`Sending message to iframe:`, messageToSend, `target origin: ${akBotOrigin}`);

		// Use the correct iframe content window to send the message
		if (this.iframeRef.contentWindow) {
			try {
				// Always use "*" in development mode for flexibility
				// const isDev = import.meta.env.DEV === true;
				const targetOrigin = "*";

				this.iframeRef.contentWindow.postMessage(messageToSend, targetOrigin);
			} catch (error) {
				console.error("Error sending message to iframe:", error);
			}
		} else {
			console.error("Iframe contentWindow is not available");
		}
	}

	/**
	 * Send an event to the iframe
	 */
	public sendEvent<T>(eventName: string, payload: T): void {
		const message: EventMessage = {
			type: MessageTypes.EVENT,
			source: appSource,
			data: {
				eventName,
				payload,
			},
		};
		this.sendMessage(message);
	}

	/**
	 * Request data from the iframe
	 */
	public async requestData<T>(resource: string): Promise<T> {
		if (!this.isConnected) {
			await this.waitForConnection();
		}

		return new Promise<T>((resolve, reject) => {
			const requestId = uuidv4();

			console.log("Requesting data from iframe AAAAAA");

			this.pendingRequests.set(requestId, {
				requestId,
				resource,
				resolve: (value) => resolve(value as T),
				reject,
			});

			this.sendMessage({
				type: MessageTypes.DATA_REQUEST,
				source: appSource,
				data: {
					requestId,
					resource,
				},
			});

			// Set a timeout to reject if no response received
			setTimeout(() => {
				if (this.pendingRequests.has(requestId)) {
					this.pendingRequests.delete(requestId);
					reject(new Error(`Request timeout for resource: ${resource}`));
				}
			}, 10000);
		});
	}

	/**
	 * Listen for specific message types
	 */
	public addListener(type: MessageTypes | string, callback: (message: AkbotMessage) => void): string {
		const id = uuidv4();
		console.log(`Requesting data from iframe ${type}`);

		this.listeners.push({ id, type, callback });
		return id;
	}

	/**
	 * Remove a specific listener by ID
	 */
	public removeListener(id: string): void {
		this.listeners = this.listeners.filter((listener) => listener.id !== id);
	}

	/**
	 * Handle incoming messages
	 */
	private async handleIncomingMessages(event: MessageEvent): Promise<void> {
		console.log("Received message from bot:", event);

		console.log(`Received message from ${event.origin}, expected origin: ${akBotOrigin}`);

		// Get the actual iframe URL if available
		const actualIframeOrigin = this.iframeRef?.src ? new URL(this.iframeRef.src).origin : null;

		console.log("actualIframeOrigin", this.iframeRef, actualIframeOrigin);

		// const isDevelopment = import.meta.env.DEV || import.meta.env.MODE === "development";
		// const isFromExpectedOrigin =
		// 	event.origin === akBotOrigin ||
		// 	(isDevelopment && actualIframeOrigin && event.origin === actualIframeOrigin);

		// // Validate message origin for security
		// if (!isFromExpectedOrigin) {
		// 	console.warn(`Origin mismatch: expected ${akBotOrigin}, got ${event.origin}`);
		// 	// Continue processing in development mode to aid debugging
		// 	if (!isDevelopment) return;
		// }

		const message = event.data as AkbotMessage;
		console.log("Message data:", message);

		if (message.type === MessageTypes.EVENT) {
			console.log(`[DEBUG] Received EVENT message with name: ${message.data.eventName}`);
			console.log(`[DEBUG] Payload:`, message.data.payload);

			// Add specific handling for NAVIGATE_TO_PROJECT
			if (message.data.eventName === "NAVIGATE_TO_PROJECT") {
				console.log(`[DEBUG] 🚀 NAVIGATE_TO_PROJECT event received:`, message.data.payload);
			}
		}

		// Validate that it's a properly formatted message
		if (!message || !message.type || message.source !== akBotSource) {
			console.warn("Invalid message format or source");
			return;
		}

		console.log(`Processing message of type: ${message.type}`);

		// Handle handshake completion
		if (message.type === MessageTypes.HANDSHAKE_ACK) {
			console.log(`Connection established via HANDSHAKE_ACKNOWLEDGMENT`);

			HttpService.post("http://localhost:9980/ai/api/init-db");

			this.isConnected = true;
			if (this.connectionResolve) {
				this.connectionResolve();
				this.connectionResolve = null;
			}
		} else if (
			message.type === MessageTypes.EVENT &&
			message.data.eventName === "IFRAME_READY" &&
			!this.isConnected
		) {
			console.log(`Connection established via EVENT: IFRAME_READY`);
			this.isConnected = true;
			if (this.connectionResolve) {
				this.connectionResolve();
				this.connectionResolve = null;
			}
		}
		// Handle also the HANDSHAKE message from akbot to web-platform-new
		else if (message.type === MessageTypes.HANDSHAKE) {
			console.log(`Received HANDSHAKE from akbot, sending acknowledgment`);
			// Send acknowledgment back to akbot
			this.sendMessage({
				type: MessageTypes.HANDSHAKE,
				source: appSource,
				data: {
					version: appVersion,
				},
			});

			// Mark as connected if not already
			if (!this.isConnected) {
				console.log(`Connection established via HANDSHAKE from akbot`);
				this.isConnected = true;
				if (this.connectionResolve) {
					this.connectionResolve();
					this.connectionResolve = null;
				}
			}
		} else if (message.type === MessageTypes.ERROR) {
			const { code, message: errorMessage } = message.data;

			console.error(`Error from akbot: ${code} - ${errorMessage}`);

			// Check if this error is related to a pending request
			if (code.startsWith("REQUEST_") && code.includes("_") && this.pendingRequests.has(code.split("_")[1])) {
				const requestId = code.split("_")[1];
				const pendingRequest = this.pendingRequests.get(requestId);

				if (pendingRequest) {
					pendingRequest.reject(new Error(errorMessage));
					this.pendingRequests.delete(requestId);
				}
			}
		}

		// Notify all matching listeners
		this.listeners
			.filter((listener) => listener.type === message.type)
			.forEach((listener) => {
				try {
					listener.callback(message);
				} catch (error) {
					console.error("Error in message listener:", error);
				}
			});
	}
}

// Create a singleton instance
export const iframeCommService = new IframeCommService();
