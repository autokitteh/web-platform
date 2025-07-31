import React, { useMemo, useState } from "react";

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
	const { isDrawerOpen } = useDrawerStore();
	const [isAnimating, setIsAnimating] = useState(false);
	const [showDrawer, setShowDrawer] = useState(true);
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

	const { shouldShow, configMode } = useMemo(() => {
		const pathname = location.pathname;

		const isProjectsPath = pathname.startsWith("/projects") && projectId;
		const isDrawerOpenInStore = isDrawerOpen("chatbot");

		const configMode = forcedConfigMode !== undefined ? forcedConfigMode : isProjectsPath;

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
	}, [location.pathname, forcedConfigMode, projectId, isDrawerOpen]);

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
		<div className="relative">
			<Drawer
				bgClickable
				bgTransparent
				className="rounded-r-lg bg-gray-1100 pt-8"
				divId="project-sidebar-chatbot"
				name="chatbot"
				onCloseCallback={onClose}
				width={drawerWidth}
				wrapperClassName="p-0 h-[95vh] top-[4.25vh] right-[0.4vw] rounded-r-lg"
			>
				{showDrawer ? (
					<ChatbotIframe
						className="size-full"
						configMode={!!configMode}
						displayResizeButton
						hideCloseButton={false}
						projectId={projectId}
						title="AutoKitteh AI Assistant"
					/>
				) : null}
			</Drawer>
		</div>
	);
};
