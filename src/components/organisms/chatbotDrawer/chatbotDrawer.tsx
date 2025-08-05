import React, { useEffect, useRef } from "react";

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
		isChatbotDrawerOpen,
		setIsChatbotDrawerOpen,
		setChatbotHelperConfigMode,
		setExpandedProjectNavigation,
	} = useSharedBetweenProjectsStore();

	const currentChatbotWidth = chatbotWidth[projectId!] || defaultChatbotWidth.initial;
	const previousProjectIdRef = useRef<string | undefined>();

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

	useEffect(() => {
		if (projectId && isChatbotDrawerOpen[projectId]) {
			const isProjectSwitch = previousProjectIdRef.current && previousProjectIdRef.current !== projectId;

			if (isProjectSwitch) {
				closeDrawer("chatbot");

				setTimeout(() => {
					openDrawer("chatbot");
				}, 150);
			} else {
				openDrawer("chatbot");
			}
		}

		// Update the previous project ID
		previousProjectIdRef.current = projectId;
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, isChatbotDrawerOpen]);

	useEventListener(EventListenerName.displayProjectAiAssistantSidebar, () => {
		openDrawer("chatbot");
		setIsChatbotDrawerOpen(projectId!, false);
		setChatbotHelperConfigMode(projectId!, false);
		setTimeout(() => {
			setIsChatbotDrawerOpen(projectId!, true);
		}, 300);
	});

	useEventListener(EventListenerName.displayProjectStatusSidebar, () => {
		openDrawer("chatbot");
		setIsChatbotDrawerOpen(projectId!, false);
		setChatbotHelperConfigMode(projectId!, true);

		setTimeout(() => {
			setIsChatbotDrawerOpen(projectId!, true);
		}, 300);
	});

	useEventListener(EventListenerName.hideProjectAiAssistantOrStatusSidebar, () => {
		if (projectId) {
			setIsChatbotDrawerOpen(projectId, false);
			setChatbotHelperConfigMode(projectId, false);
		}
		closeDrawer("chatbot");
	});

	const handleChatbotClose = () => {
		if (projectId) {
			setExpandedProjectNavigation(projectId, true);
			setIsChatbotDrawerOpen(projectId, false);
			setChatbotHelperConfigMode(projectId, false);
		}
		closeDrawer("chatbot");
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
			wrapperClassName="p-0 relative"
		>
			{isChatbotDrawerOpen[projectId!] ? (
				<ChatbotIframe
					className="mb-2"
					displayResizeButton
					hideCloseButton={false}
					projectId={projectId}
					title="AutoKitteh AI Assistant"
				/>
			) : null}
		</Drawer>
	);
};
