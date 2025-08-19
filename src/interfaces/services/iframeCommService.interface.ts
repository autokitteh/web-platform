import { AkbotMessage, MessageTypes } from "@src/types/iframeCommunication.type";

export interface MessageListener {
	id: string;
	type: MessageTypes | string;
	callback: (message: AkbotMessage) => void;
}

export interface PendingRequest {
	requestId: string;
	resource: string;
	resolve: (value: unknown) => void;
	reject: (error: Error) => void;
	retries: number;
}
