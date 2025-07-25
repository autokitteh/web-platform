import React, { useMemo } from "react";

import { useLocation, useParams } from "react-router-dom";

import { ChatbotIframe } from "../chatbotIframe/chatbotIframe";
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
			<ChatbotIframe
				className="size-full"
				configMode={!!configMode}
				hideCloseButton={false}
				hideHistoryButton={false}
				projectId={projectId}
				showFullscreenToggle={false}
				title="AutoKitteh AI Assistant"
			/>
		</Drawer>
	);
};
