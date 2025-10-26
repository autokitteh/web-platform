import { useEffect, useState } from "react";

import { iframeCommService } from "@services/iframeComm.service";
import { MessageTypes } from "@src/types/iframeCommunication.type";

interface DatadogReadyData {
	sessionId: string;
	timestamp: string;
	service: string;
}

interface ChatbotDatadogStatus {
	isReady: boolean;
	sessionId?: string;
	timestamp?: string;
	service?: string;
}

export const useChatbotDatadogStatus = (): ChatbotDatadogStatus => {
	const [status, setStatus] = useState<ChatbotDatadogStatus>({
		isReady: false,
	});

	useEffect(() => {
		const listener = iframeCommService.addListener(MessageTypes.EVENT, (message) => {
			if (message.data && typeof message.data === "object") {
				const eventData = message.data as { eventName: string; payload: unknown };

				if (eventData.eventName === "DATADOG_READY") {
					const payload = eventData.payload as DatadogReadyData;

					console.log("[Chatbot Datadog Status] ✅ Chatbot Datadog is ready:", payload);

					setStatus({
						isReady: true,
						sessionId: payload.sessionId,
						timestamp: payload.timestamp,
						service: payload.service,
					});
				}
			}
		});

		return () => {
			iframeCommService.removeListener(listener);
		};
	}, []);

	return status;
};
