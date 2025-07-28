import React, { useMemo, useState } from "react";

import { motion, AnimatePresence } from "motion/react";
import { useLocation, useParams } from "react-router-dom";

import { ChatbotIframe } from "../chatbotIframe/chatbotIframe";
import { EventListenerName } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { useProjectStore } from "@src/store";

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
		<Drawer
			bgClickable
			bgTransparent
			className="bg-gray-1100"
			name="chatbot"
			onCloseCallback={onClose}
			wrapperClassName="w-1/2 p-0"
		>
			<AnimatePresence mode="wait">
				{showDrawer ? (
					<motion.div
						animate={{ opacity: 1, x: 0 }}
						className="size-full"
						exit={{ opacity: 0, x: "-100%" }}
						initial={{ opacity: 0, x: "100%" }}
						key="chatbot-drawer"
						transition={{
							duration: 0.3,
							ease: "easeInOut",
						}}
					>
						<ChatbotIframe
							className="size-full"
							configMode={!!configMode}
							hideCloseButton={false}
							hideHistoryButton={false}
							projectId={projectId}
							showFullscreenToggle={false}
							title="AutoKitteh AI Assistant"
						/>
					</motion.div>
				) : null}
			</AnimatePresence>
		</Drawer>
	);
};
