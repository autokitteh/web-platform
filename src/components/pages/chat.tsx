import React, { useState, useEffect } from "react";

import { useSearchParams } from "react-router-dom";

import { CONFIG, iframeCommService } from "@services/iframeComm.service";

import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";

export const ChatPage = () => {
	const [searchParams] = useSearchParams();
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);

	useEffect(() => {
		const startValue = searchParams.get("start");
		if (startValue) {
			// Decode the URL-encoded message
			const decodedMessage = decodeURIComponent(startValue);
			setPendingMessage(decodedMessage);
		}
	}, [searchParams]);

	const handleIframeConnect = () => {
		if (pendingMessage) {
			const messageToSend = pendingMessage;
			setPendingMessage(null);
			// eslint-disable-next-line no-console
			console.log("Sending welcome message to chatbot:", messageToSend);
			iframeCommService.sendMessage({
				type: "WELCOME_MESSAGE",
				source: CONFIG.APP_SOURCE,
				data: {
					message: messageToSend,
				},
			});
		}
	};

	return (
		<div className="flex size-full min-h-screen flex-col bg-gray-1250">
			<div className="size-full">
				<ChatbotIframe className="size-full" onConnect={handleIframeConnect} title="AutoKitteh AI Assistant" />
			</div>
		</div>
	);
};
