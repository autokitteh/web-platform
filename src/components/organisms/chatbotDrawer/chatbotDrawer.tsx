import React, { useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import { ChatbotIframe } from "../chatbotIframe/chatbotIframe";
import { defaultChatbotWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { useEventListener, useResize } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { Drawer } from "@components/molecules";

export const ChatbotDrawer = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const {
		chatbotWidth,
		setChatbotWidth,
		isProjectDrawerState,
		setIsProjectDrawerState,
		setExpandedProjectNavigation,
	} = useSharedBetweenProjectsStore();

	const currentDrawerState = projectId ? isProjectDrawerState[projectId] : undefined;

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
		openDrawer("chatbot");
		setExpandedProjectNavigation(projectId, true);
		setIsProjectDrawerState(projectId, "ai-assistant");
	};
	const close = () => {
		if (!projectId) return;
		setIsProjectDrawerState(projectId);
		setExpandedProjectNavigation(projectId, false);
		closeDrawer("chatbot");
	};

	useEffect(() => {
		if (!projectId) return;

		if (currentDrawerState !== "ai-assistant") return;
		open();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, currentDrawerState]);

	useEventListener(EventListenerName.displayProjectAiAssistantSidebar, () => {
		if (!projectId) return;
		open();
	});

	useEventListener(EventListenerName.hideProjectAiAssistantSidebar, () => {
		if (!projectId) return;
		close();
	});

	const handleChatbotClose = () => {
		if (!projectId) return;
		close();
	};

	if (!location.pathname.startsWith("/projects")) {
		return null;
	}
	return (
		<Drawer
			bgClickable
			bgTransparent
			className="rounded-r-lg bg-gray-1100 pt-4"
			divId="project-sidebar-chatbot"
			isScreenHeight={false}
			name="chatbot"
			onCloseCallback={handleChatbotClose}
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
