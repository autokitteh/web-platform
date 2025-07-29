import React, { useMemo, useState } from "react";

import { useLocation, useParams } from "react-router-dom";

import { ChatbotIframe } from "../chatbotIframe/chatbotIframe";
import { defaultChatbotWidth } from "@src/constants";
import { EventListenerName } from "@src/enums";
import { useEventListener, useResize } from "@src/hooks";
import { useProjectStore, useSharedBetweenProjectsStore } from "@src/store";

import { Drawer } from "@components/molecules";

interface ChatbotDrawerProps {
	onClose: () => void;
	configMode?: boolean;
}

export const ChatbotDrawer = ({ onClose, configMode: forcedConfigMode }: ChatbotDrawerProps) => {
	const location = useLocation();
	const { projectsList } = useProjectStore();
	const { projectId } = useParams();
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
		const isValidProject = projectId && projectsList.some((p) => p.id === projectId);
		const isProjectsPath = pathname.startsWith("/projects") && isValidProject;

		const configMode = forcedConfigMode !== undefined ? forcedConfigMode : isProjectsPath;

		if (configMode) {
			const shouldShow = isProjectsPath;
			return {
				shouldShow,
				configMode,
				isProjectsPath,
				currentProjectId: projectId,
			};
		} else {
			const allowedNonConfigPaths = ["/welcome", "/chat", "/dashboard", "/intro", "/projects"];
			const isAllowedNonConfigPath = allowedNonConfigPaths.some((path) => pathname.includes(path));
			const shouldShow = isAllowedNonConfigPath;
			return {
				shouldShow,
				configMode,
				isProjectsPath,
				currentProjectId: projectId,
			};
		}
	}, [location.pathname, projectsList, forcedConfigMode, projectId]);

	// Handle AI button click animation
	useEventListener(EventListenerName.openAiChatbot, () => {
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

	useEventListener(EventListenerName.openAiConfig, () => {
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
				className="bg-gray-1100"
				name="chatbot"
				onCloseCallback={onClose}
				width={drawerWidth}
				wrapperClassName="p-0"
			>
				{showDrawer ? (
					<ChatbotIframe
						className="size-full"
						configMode={!!configMode}
						displayResizeButton
						hideCloseButton={false}
						hideHistoryButton={false}
						projectId={projectId}
						showFullscreenToggle={false}
						title="AutoKitteh AI Assistant"
					/>
				) : null}
			</Drawer>
		</div>
	);
};
