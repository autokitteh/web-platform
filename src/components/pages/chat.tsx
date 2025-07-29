import React, { useState, useEffect } from "react";

import Cookies from "js-cookie";
import { useSearchParams, useNavigate } from "react-router-dom";

import { systemCookies } from "@constants";
import { CONFIG, iframeCommService } from "@services/iframeComm.service";

import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";

export const ChatPage = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [searchParams, _setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);

	useEffect(() => {
		// Check for start parameter in URL first (direct access)
		const startValue = searchParams.get("start");
		if (startValue) {
			// Decode the URL-encoded message
			const decodedMessage = decodeURIComponent(startValue);
			setPendingMessage(decodedMessage);

			// Remove the query parameter from URL
			const newSearchParams = new URLSearchParams(searchParams);
			newSearchParams.delete("start");
			navigate({ search: newSearchParams.toString() }, { replace: true });
		} else {
			// Check for start message in cookie (after login redirect)
			const cookieStartValue = Cookies.get(systemCookies.chatStartMessage);
			if (cookieStartValue) {
				// Decode the URL-encoded message
				const decodedMessage = decodeURIComponent(cookieStartValue);
				setPendingMessage(decodedMessage);

				// Remove the cookie after reading
				Cookies.remove(systemCookies.chatStartMessage, { path: "/" });
			}
		}
	}, [searchParams, navigate]);

	const handleIframeConnect = () => {
		if (pendingMessage) {
			const messageToSend = pendingMessage;
			setPendingMessage(null);

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
			<div className="size-full p-8">
				<ChatbotIframe
					className="size-full"
					configMode={false}
					hideCloseButton
					isTransparent
					onConnect={handleIframeConnect}
					padded
					title="AutoKitteh AI Assistant"
				/>
			</div>
		</div>
	);
};
