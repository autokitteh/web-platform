import React, { useState, useEffect } from "react";

import { Outlet, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const { openDrawer, closeDrawer } = useDrawerStore();
	const { setExpandedProjectNavigation, setIsChatbotDrawerOpen, chatbotMode, setChatbotMode } =
		useSharedBetweenProjectsStore();
	const [chatbotConfigMode, setChatbotConfigMode] = useState<boolean | undefined>(undefined);

	// Reset and restore chatbot mode when projectId changes
	useEffect(() => {
		if (projectId) {
			const storedMode = chatbotMode[projectId];
			if (storedMode !== undefined) {
				setChatbotConfigMode(!storedMode); // true = AI Assistant (configMode false), false = Status Mode (configMode true)
			} else {
				// Default to AI Assistant mode if no stored mode
				setChatbotConfigMode(false);
			}
		} else {
			setChatbotConfigMode(undefined);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	// Update stored mode when chatbotMode store changes for current project
	useEffect(() => {
		if (projectId && chatbotMode[projectId] !== undefined) {
			const storedMode = chatbotMode[projectId];
			const expectedConfigMode = !storedMode;
			if (chatbotConfigMode !== expectedConfigMode) {
				setChatbotConfigMode(expectedConfigMode);
			}
		}
	}, [chatbotMode, projectId, chatbotConfigMode]);

	// Save chatbot mode when it changes (but not during initial restoration)
	useEffect(() => {
		if (projectId && chatbotConfigMode !== undefined) {
			// Only save if the mode actually differs from stored mode to avoid infinite loops
			const storedMode = chatbotMode[projectId];
			const currentMode = !chatbotConfigMode; // configMode false = AI Assistant (true), configMode true = Status Mode (false)

			if (storedMode !== currentMode) {
				setChatbotMode(projectId, currentMode);
			}
		}
	}, [projectId, chatbotConfigMode, setChatbotMode, chatbotMode]);

	useEventListener(EventListenerName.displayProjectAiAssistantSidebar, () => {
		setChatbotConfigMode(false);
		openDrawer("chatbot");
		if (projectId) {
			setIsChatbotDrawerOpen(projectId, true);
			setChatbotMode(projectId, true);
		}
	});

	useEventListener(EventListenerName.displayProjectStatusSidebar, () => {
		setChatbotConfigMode(true);
		openDrawer("chatbot");
		if (projectId) {
			setIsChatbotDrawerOpen(projectId, true);
			setChatbotMode(projectId, false);
		}
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
		<>
			<Outlet />
			<ChatbotDrawer configMode={chatbotConfigMode} onClose={handleChatbotClose} />
		</>
	);
};
