import React, { useState } from "react";

import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";
import { EventListenerName } from "@src/enums";
import { useEventListener, useWindowDimensions } from "@src/hooks";
import { useDrawerStore, useProjectStore } from "@src/store";

import { ChatbotDrawer, ProjectConfigTopbar, Sidebar } from "@components/organisms";

export const AppLayout = ({
	className,
	hideTopbar,
	hideSystemLog,
}: {
	className?: string;
	hideSystemLog?: boolean;
	hideTopbar?: boolean;
}) => {
	const { isIOS, isMobile } = useWindowDimensions();
	const { projectsList } = useProjectStore();
	const { openDrawer, closeDrawer, isDrawerOpen } = useDrawerStore();
	const [chatbotConfigMode, setChatbotConfigMode] = useState(false);
	const hideSidebar = !projectsList.length && (isMobile || isIOS) && location.pathname === "/";
	const isChatbotOpen = isDrawerOpen("chatbot");

	useEventListener(EventListenerName.toggleDashboardChatBot, (newState) => {
		if (isChatbotOpen || newState) {
			closeDrawer("chatbot");
		} else {
			setChatbotConfigMode(false);
			openDrawer("chatbot");
		}
		return;
	});

	useEventListener(EventListenerName.toggleIntroChatBot, (newState) => {
		if (isChatbotOpen || !newState) {
			closeDrawer("chatbot");
		} else {
			setChatbotConfigMode(false);
			openDrawer("chatbot");
		}
	});

	useEventListener(EventListenerName.openAiChatbot, () => {
		setChatbotConfigMode(false);
		openDrawer("chatbot");
	});

	useEventListener(EventListenerName.openAiConfig, () => {
		setChatbotConfigMode(true);
		openDrawer("chatbot");
	});

	useEventListener(EventListenerName.toggleProjectChatBot, () => {
		closeDrawer("chatbot");
	});

	const handleChatbotClose = () => {
		closeDrawer("chatbot");
	};

	return (
		<>
			<SystemLogLayout
				className={className}
				hideSystemLog={hideSystemLog}
				sidebar={hideSidebar ? null : <Sidebar />}
				topbar={hideTopbar ? null : <ProjectConfigTopbar />}
			>
				<Outlet />
			</SystemLogLayout>
			<ChatbotDrawer configMode={chatbotConfigMode} onClose={handleChatbotClose} />
		</>
	);
};
