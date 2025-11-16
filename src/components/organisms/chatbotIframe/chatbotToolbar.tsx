import React from "react";

import { ChatbotToolbarProps } from "@interfaces/components";
import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { cn } from "@src/utilities";

import { Button, IconSvg } from "@components/atoms";

import { Close } from "@assets/image/icons";

export const ChatbotToolbar: React.FC<ChatbotToolbarProps> = ({ hideCloseButton }) => {
	const hideAiAssistantIframe = () => {
		triggerEvent(EventListenerName.hideProjectAiAssistantSidebar);
	};

	const wrapperClass = cn("absolute right-4 top-2 z-10 flex flex-col-reverse gap-2 rounded-full p-2");

	return (
		<div className={wrapperClass}>
			{hideCloseButton ? null : (
				<Button
					ariaLabel="Close AI Assistant"
					className="rounded-full bg-transparent p-1.5 hover:bg-gray-800"
					id="close-chatbot-button"
					onClick={hideAiAssistantIframe}
				>
					<IconSvg className="fill-white" src={Close} />
				</Button>
			)}
		</div>
	);
};
