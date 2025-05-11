import React, { useState } from "react";

import { ModalName } from "@enums/components";

import { Modal } from "@components/molecules";
import ChatbotIframe from "@components/organisms/chatbotIframe/chatbotIframe";

export const BotModal = () => {
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_isConnected, setIsConnected] = useState(false);

	const handleConnect = () => {
		setIsConnected(true);
	};

	return (
		<Modal className="h-screen w-screen bg-gray-1200" name={ModalName.botModal}>
			<div className="mt-20 flex h-5/6 rounded border">
				<ChatbotIframe onConnect={handleConnect} />
			</div>
		</Modal>
	);
};
