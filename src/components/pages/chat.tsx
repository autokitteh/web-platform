import React, { useState, useEffect } from "react";

import { useTranslation } from "react-i18next";
import { useSearchParams, useNavigate, useLocation } from "react-router-dom";

import { CONFIG, iframeCommService } from "@services/iframeComm.service";

import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";

export const ChatPage = () => {
	const { t } = useTranslation("global");
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [searchParams, _setSearchParams] = useSearchParams();
	const navigate = useNavigate();
	const [pendingMessage, setPendingMessage] = useState<string | null>(null);

	const location = useLocation();

	useEffect(() => {
		if (location.state?.chatStartMessage) {
			setPendingMessage(location.state.chatStartMessage);
		}
	}, [searchParams, navigate, location.state]);

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
					hideCloseButton
					isTransparent
					onConnect={handleIframeConnect}
					padded
					title={t("aiAssistant.title")}
				/>
			</div>
		</div>
	);
};
