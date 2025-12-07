import React from "react";

import { useTranslation } from "react-i18next";

import { ModalName } from "@enums/components";

import { Button } from "@components/atoms";
import { Modal } from "@components/molecules";
import { ChatbotIframe } from "@components/organisms/chatbotIframe/chatbotIframe";

type AiChatModalProps = {
	isOpen: boolean;
	onClose: () => void;
	onConnect?: () => void;
};

export const AiChatModal = ({ isOpen, onClose, onConnect }: AiChatModalProps) => {
	const { t: tAi } = useTranslation("dashboard", { keyPrefix: "ai" });

	return (
		<Modal
			className="relative size-full border-none bg-black p-0"
			closeButtonClass="hidden"
			forceOpen={isOpen}
			hideCloseButton
			name={ModalName.aiChat}
			onCloseCallbackOverride={onClose}
			wrapperClass="p-2"
		>
			<Button
				aria-label={tAi("modal.closeLabel")}
				className="absolute right-3 top-3 z-10 bg-transparent p-1.5 hover:bg-gray-700 sm:right-6 sm:top-6"
				onClick={onClose}
			>
				<svg
					className="size-4 text-white sm:size-5"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
				</svg>
			</Button>
			<ChatbotIframe
				className="size-full"
				hideCloseButton
				onConnect={onConnect}
				padded
				title={tAi("modal.assistantTitle")}
			/>
		</Modal>
	);
};
