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
	const [chatbotConfigMode, setChatbotConfigMode] = useState(false);

	useEventListener(EventListenerName.openAiChatbot, () => {
		setChatbotConfigMode(false);
		openDrawer("chatbot");
	});

	useEventListener(EventListenerName.openAiConfig, () => {
		setChatbotConfigMode(true);
		openDrawer("chatbot");
	});

	useEventListener(EventListenerName.toggleProjectChatBot, () => {
		if (projectId) {
			setExpandedProjectNavigation(projectId, true);
		}
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
