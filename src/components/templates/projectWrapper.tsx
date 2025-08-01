/* eslint-disable no-console */
import React, { useState, useEffect } from "react";

import { Outlet, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { useEventListener } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const { openDrawer, closeDrawer, isDrawerOpen } = useDrawerStore();
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

	useEventListener(EventListenerName.displayProjectAiAssistantSidebar, () => {
		setChatbotConfigMode(false);
		openDrawer("chatbot");
		if (projectId) {
			setIsChatbotDrawerOpen(projectId, true);
			setChatbotMode(projectId, true);
		}
	});

	useEventListener(EventListenerName.displayProjectStatusSidebar, () => {
		console.log("[ProjectWrapper] displayProjectStatusSidebar event received", {
			projectId,
			currentConfigMode: chatbotConfigMode,
			currentDrawerState: isDrawerOpen("chatbot"),
			currentChatbotMode: projectId ? chatbotMode[projectId] : undefined,
		});

		console.log("[ProjectWrapper] Setting configMode to true");
		setChatbotConfigMode(true);

		console.log("[ProjectWrapper] Opening drawer");
		openDrawer("chatbot");

		if (projectId) {
			console.log("[ProjectWrapper] Setting chatbot state for project:", projectId);
			setIsChatbotDrawerOpen(projectId, true);
			setChatbotMode(projectId, false);
			console.log("[ProjectWrapper] State changes applied for project:", projectId);
		}
		console.log("[ProjectWrapper] displayProjectStatusSidebar event processing complete");
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
