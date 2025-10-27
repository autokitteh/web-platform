import React from "react";

import { useLocation, useParams } from "react-router-dom";

import { ChatbotIframe } from "../chatbotIframe/chatbotIframe";
import { defaultChatbotWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { useEventListener, useResize } from "@src/hooks";
import { useSharedBetweenProjectsStore } from "@src/store";

import { Drawer } from "@components/molecules";

export const ChatbotDrawer = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const { chatbotWidth, setChatbotWidth } = useSharedBetweenProjectsStore();

	const currentChatbotWidth = chatbotWidth[projectId!] || defaultChatbotWidth.initial;

	const [drawerWidth] = useResize({
		direction: "horizontal",
		min: defaultChatbotWidth.min,
		max: defaultChatbotWidth.max,
		initial: currentChatbotWidth,
		value: currentChatbotWidth,
		id: "chatbot-drawer-resize",
		onChange: (width) => {
			if (projectId) {
				setChatbotWidth(projectId, width);
			}
		},
		invertDirection: true,
	});

	const open = () => {
		if (!projectId) return;
		openDrawer(projectId, "chatbot");
	};

	const close = () => {
		if (!projectId) return;
		closeDrawer(projectId, "chatbot");
	};

	useEventListener(EventListenerName.displayProjectAiAssistantSidebar, () => open());

	useEventListener(EventListenerName.hideProjectAiAssistantSidebar, () => close());

	if (!location.pathname.startsWith("/projects")) {
		return null;
	}
	return (
		<Drawer
			bgTransparent
			className="rounded-r-lg bg-gray-1100 pt-4"
			divId="project-sidebar-chatbot"
			isScreenHeight={false}
			name="chatbot"
			onCloseCallback={close}
			width={drawerWidth}
			wrapperClassName="p-0 relative absolute"
		>
			<ChatbotIframe
				displayResizeButton
				hideCloseButton={false}
				projectId={projectId}
				title="AutoKitteh AI Assistant"
			/>
		</Drawer>
	);
};
