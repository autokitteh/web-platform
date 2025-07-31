import React, { useState } from "react";

import { Outlet, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const { setExpandedProjectNavigation } = useSharedBetweenProjectsStore();
	const [chatbotConfigMode, setChatbotConfigMode] = useState<boolean | undefined>(undefined);

	useEventListener(EventListenerName.displayProjectAiAssistantSidebar, () => {
		setChatbotConfigMode(false);
		openDrawer("chatbot");
	});

	useEventListener(EventListenerName.displayProjectStatusSidebar, () => {
		setChatbotConfigMode(true);
		openDrawer("chatbot");
	});

	useEventListener(EventListenerName.hideProjectAiAssistantOrStatusSidebar, () => {
		closeDrawer("chatbot");
	});

	const handleChatbotClose = () => {
		if (projectId) {
			setExpandedProjectNavigation(projectId, true);
		}
		closeDrawer("chatbot");
	};

	return (
		<>
			<Outlet />
			<ChatbotDrawer configMode={chatbotConfigMode} onClose={handleChatbotClose} />
		</>
	);
};
