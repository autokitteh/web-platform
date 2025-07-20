import React from "react";

import { iframeCommService } from "@services/iframeComm.service";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";

import { Button, IconButton } from "@components/atoms";

import { HistoryIcon, TrashIcon, CompressIcon, ExpandIcon } from "@assets/image/icons";

interface ChatbotToolbarProps {
	configMode?: boolean;
	hideCloseButton?: boolean;
	hideHistoryButton?: boolean;
	showFullscreenToggle?: boolean;
	isFullscreen?: boolean;
	onToggleFullscreen?: (isFullscreen: boolean) => void;
}

export const ChatbotToolbar: React.FC<ChatbotToolbarProps> = ({
	configMode,
	hideCloseButton,
	hideHistoryButton = false,
	showFullscreenToggle = false,
	isFullscreen = false,
	onToggleFullscreen,
}) => {
	const hideChatbotIframe = () => {
		triggerEvent(EventListenerName.toggleIntroChatBot);
		triggerEvent(EventListenerName.toggleDashboardChatBot);
		triggerEvent(EventListenerName.toggleProjectChatBot);
	};

	if (hideCloseButton) {
		return null;
	}

	return (
		<div className="absolute right-8 top-8 z-10 flex gap-2 rounded-full bg-gray-1250 p-2">
			{!configMode ? (
				<>
					{!hideHistoryButton ? (
						<IconButton
							aria-label="Show History"
							className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
							id="history-chatbot-button"
							key="history"
							onClick={() => iframeCommService.sendEvent("HISTORY_BUTTON", {})}
						>
							<HistoryIcon className="size-6 fill-white" />
						</IconButton>
					) : null}
					<IconButton
						aria-label="Clear Chat"
						className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
						id="clear-chatbot-button"
						key="clear"
						onClick={() => iframeCommService.sendEvent("CLEAR_CHAT", {})}
					>
						<TrashIcon className="size-6 stroke-white" />
					</IconButton>
				</>
			) : null}
			{showFullscreenToggle && onToggleFullscreen ? (
				<IconButton
					aria-label={isFullscreen ? "Exit full screen" : "Enter full screen"}
					className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
					id="chatbot-fullscreen-toggle"
					key="fullscreen"
					onClick={() => onToggleFullscreen(isFullscreen)}
				>
					{isFullscreen ? (
						<CompressIcon className="size-6 fill-white" />
					) : (
						<ExpandIcon className="size-6 fill-white" />
					)}
				</IconButton>
			) : null}
			<Button
				aria-label="Close AI Chat"
				className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
				id="close-chatbot-button"
				onClick={hideChatbotIframe}
			>
				<svg
					className="size-5 text-white"
					fill="none"
					stroke="currentColor"
					viewBox="0 0 24 24"
					xmlns="http://www.w3.org/2000/svg"
				>
					<path d="M6 18L18 6M6 6l12 12" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} />
				</svg>
			</Button>
		</div>
	);
};
