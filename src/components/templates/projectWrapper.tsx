import React, { useEffect, useState } from "react";

import { Outlet, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const {
		setExpandedProjectNavigation,
		setIsChatbotDrawerOpen,
		chatbotHelperConfigMode,
		setChatbotHelperConfigMode,
	} = useSharedBetweenProjectsStore();
	const [chatbotConfigMode, setChatbotConfigMode] = useState<boolean | undefined>(undefined);

	useEffect(() => {
		if (projectId) {
			const storedMode = chatbotHelperConfigMode[projectId];
			if (storedMode !== undefined) {
				setChatbotConfigMode(!storedMode);
			} else {
				setChatbotConfigMode(false);
			}
		} else {
			setChatbotConfigMode(undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEventListener(EventListenerName.displayProjectAiAssistantSidebar, () => {
		setChatbotConfigMode(false);
		setChatbotHelperConfigMode(projectId!, false);
		if (projectId) {
			setIsChatbotDrawerOpen(projectId, true);
		}
		openDrawer("chatbot");
	});

	useEventListener(EventListenerName.displayProjectStatusSidebar, () => {
		setChatbotConfigMode(true);
		setChatbotHelperConfigMode(projectId!, true);

		openDrawer("chatbot");
	});

	useEventListener(EventListenerName.hideProjectAiAssistantOrStatusSidebar, () => {
		closeDrawer("chatbot");
		if (projectId) {
			setIsChatbotDrawerOpen(projectId, false);
		}
	});

	const handleChatbotClose = () => {
		if (projectId) {
			setExpandedProjectNavigation(projectId, true);
			setIsChatbotDrawerOpen(projectId, false);
		}
		closeDrawer("chatbot");
	};

	return (
		<div className="projectWrapper mt-1.5 h-full">
			<Outlet />
			<ChatbotDrawer configMode={chatbotConfigMode} onClose={handleChatbotClose} />
		</div>
	);
};
