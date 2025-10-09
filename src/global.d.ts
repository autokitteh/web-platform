import { PushParams } from "@src/types/hooks";

declare global {
	interface Window {
		_hsq: PushParams[];
		dataLayer: any[];
		clarity?: {
			(action: "identify", userId: string, sessionId: string, pageId: string, friendlyName: string): void;
			(action: "set", key: string, value: string, data?: any): void;
			(action: "event", eventName: string, properties?: Record<string, any>): void;
		};
	}
}
