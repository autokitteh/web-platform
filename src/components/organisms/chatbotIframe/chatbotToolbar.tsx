import React from "react";

// import { iframeCommService } from "@services/iframeComm.service";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";
// import { IconButton } from "@components/molecules";

import { Close } from "@assets/image/icons";
// import {HistoryIcon, TrashIcon, CompressIcon, ExpandIcon,} from "@assets/image/icons";

interface ChatbotToolbarProps {
	configMode?: boolean;
	hideHistoryButton?: boolean;
	showFullscreenToggle?: boolean;
	isFullscreen?: boolean;
	onToggleFullscreen?: (isFullscreen: boolean) => void;
}

export const ChatbotToolbar: React.FC<ChatbotToolbarProps> = () =>
	// 	{
	// 	configMode,
	// 	hideHistoryButton = false,
	// 	showFullscreenToggle = false,
	// 	isFullscreen = false,
	// 	onToggleFullscreen,
	// }
	{
		const hideChatbotIframe = () => {
			triggerEvent(EventListenerName.toggleIntroChatBot);
			triggerEvent(EventListenerName.toggleDashboardChatBot);
			// eslint-disable-next-line no-console
			console.log("ChatbotToolbar - hideChatbotIframe - closing chatbot iframe");
			triggerEvent(EventListenerName.toggleProjectChatBot);
		};

		// if (hideCloseButton) {
		// 	return null;
		// }

		const wrapperClass = cn("absolute right-4 top-1 z-10 flex flex-col-reverse gap-2 rounded-full p-2");

		return (
			<div className={wrapperClass}>
				{/* {!configMode ? (
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
			) : null} */}
				<Button
					aria-label="Close AI Chat"
					className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
					id="close-chatbot-button"
					onClick={hideChatbotIframe}
				>
					<IconSvg className="fill-white" src={Close} />
				</Button>
			</div>
		);
	};
