import React, { useMemo, useState, useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import { ChatbotIframe } from "../chatbotIframe/chatbotIframe";
import { defaultChatbotWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { useEventListener, useResize } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { Drawer } from "@components/molecules";

interface ChatbotDrawerProps {
	onClose: () => void;
	configMode?: boolean;
}

export const ChatbotDrawer = ({ onClose, configMode: forcedConfigMode }: ChatbotDrawerProps) => {
	const location = useLocation();
	const { projectId } = useParams();
	const { isDrawerOpen, openDrawer, closeDrawer } = useDrawerStore();
	const [isAnimating, setIsAnimating] = useState(false);
	const [showDrawer, setShowDrawer] = useState(true);
	const { chatbotWidth, setChatbotWidth, isChatbotDrawerOpen, setIsChatbotDrawerOpen, chatbotMode } =
		useSharedBetweenProjectsStore();

	const currentChatbotWidth = chatbotWidth[projectId!] || defaultChatbotWidth.initial;

	// Restore drawer state when navigating to a project
	useEffect(() => {
		if (projectId && location.pathname.startsWith("/projects")) {
			const storedDrawerState = isChatbotDrawerOpen[projectId];
			// If no stored state exists, default to closed
			const shouldBeOpen = storedDrawerState === true;

			if (shouldBeOpen && !isDrawerOpen("chatbot")) {
				openDrawer("chatbot");
			} else if (!shouldBeOpen && isDrawerOpen("chatbot")) {
				closeDrawer("chatbot");
			}
		}
	}, [projectId, location.pathname, isChatbotDrawerOpen, isDrawerOpen, openDrawer, closeDrawer]);

	// Save drawer state when it changes
	useEffect(() => {
		if (projectId) {
			const isOpen = isDrawerOpen("chatbot");
			if (isChatbotDrawerOpen[projectId] !== isOpen) {
				setIsChatbotDrawerOpen(projectId, isOpen);
			}
		}
	}, [projectId, isDrawerOpen, isChatbotDrawerOpen, setIsChatbotDrawerOpen]);

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

	const { shouldShow, configMode } = useMemo(() => {
		const pathname = location.pathname;

		const isProjectsPath = pathname.startsWith("/projects") && projectId;
		const isDrawerOpenInStore = isDrawerOpen("chatbot");

		// Prioritize forcedConfigMode from parent, then stored mode, then default
		let configMode: boolean;
		if (forcedConfigMode !== undefined) {
			configMode = forcedConfigMode;
		} else if (projectId && chatbotMode[projectId] !== undefined) {
			configMode = !chatbotMode[projectId]; // true = AI Assistant (configMode false), false = Status Mode (configMode true)
		} else {
			configMode = false; // Default to AI Assistant mode (configMode = false)
		}

		if (isProjectsPath) {
			const shouldShow = isDrawerOpenInStore && isProjectsPath;
			return {
				shouldShow,
				configMode,
				isProjectsPath,
				currentProjectId: projectId,
			};
		} else {
			const allowedNonConfigPaths = ["/welcome", "/chat", "/dashboard", "/intro"];
			const isAllowedNonConfigPath = allowedNonConfigPaths.some((path) => pathname.includes(path));
			const shouldShow = isDrawerOpenInStore && isAllowedNonConfigPath;
			return {
				shouldShow,
				configMode,
				isProjectsPath,
				currentProjectId: projectId,
			};
		}
	}, [location.pathname, forcedConfigMode, projectId, isDrawerOpen, chatbotMode]);

	useEventListener(EventListenerName.displayProjectAiAssistantSidebar, () => {
		if (isAnimating) return;
		setIsAnimating(true);
		setShowDrawer(false);

		setTimeout(() => {
			setShowDrawer(true);
			setTimeout(() => {
				setIsAnimating(false);
			}, 300);
		}, 300);
	});

	useEventListener(EventListenerName.displayProjectStatusSidebar, () => {
		if (isAnimating) return;
		setIsAnimating(true);
		setShowDrawer(false);

		setTimeout(() => {
			setShowDrawer(true);
			setTimeout(() => {
				setIsAnimating(false);
			}, 300);
		}, 300);
	});

	if (!shouldShow) {
		return null;
	}
	return (
		<Drawer
			bgClickable
			bgTransparent
			className="rounded-r-lg bg-gray-1100 pt-8"
			divId="project-sidebar-chatbot"
			isScreenHeight={false}
			name="chatbot"
			onCloseCallback={onClose}
			width={drawerWidth}
			wrapperClassName="p-0 relative"
		>
			{showDrawer ? (
				<ChatbotIframe
					className="mb-2"
					configMode={!!configMode}
					displayResizeButton
					hideCloseButton={false}
					hideIframe={!showDrawer}
					projectId={projectId}
					title="AutoKitteh AI Assistant"
				/>
			) : null}
		</Drawer>
	);
};
