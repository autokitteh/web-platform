import React, { useState } from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";

import { useModalStore } from "@store";

import { Button, Loader } from "@components/atoms";
import { Modal } from "@components/molecules";
import AkbotIframe from "@components/organisms/akBotIframe/akBotIframe";

const akBotUrl = "/akbot";
console.log("BotModal - Environment Variables:", {
	VITE_AKBOT_URL: import.meta.env.VITE_AKBOT_URL,
	VITE_AKBOT_ORIGIN: import.meta.env.VITE_AKBOT_ORIGIN,
	"Used URL": akBotUrl,
});

export const BotModal = () => {
	const [isConnected, setIsConnected] = useState(false);

	const handleConnect = () => {
		setIsConnected(true);
	};

	return (
		<Modal className="h-screen w-screen bg-gray-1200" name={ModalName.botModal}>
			<div className="mt-20 flex h-5/6 rounded border">
				<AkbotIframe onConnect={handleConnect} src={akBotUrl} />
			</div>
		</Modal>
	);
};
