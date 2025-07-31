import React from "react";

import { Outlet } from "react-router-dom";

import { SystemLogLayout } from "./systemLogLayout";
import { EventListenerName } from "@src/enums";
import { useEventListener, useWindowDimensions } from "@src/hooks";
import { useDrawerStore, useProjectStore } from "@src/store";

import { ProjectConfigTopbar, Sidebar } from "@components/organisms";

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
	const hideSidebar = !projectsList.length && (isMobile || isIOS) && location.pathname === "/";
	const isChatbotOpen = isDrawerOpen("chatbot");

	useEventListener(EventListenerName.toggleDashboardChatBot, (newState) => {
		if (isChatbotOpen || newState) {
			closeDrawer("chatbot");
		} else {
			openDrawer("chatbot");
		}
		return;
	});

	useEventListener(EventListenerName.toggleIntroChatBot, (newState) => {
		if (isChatbotOpen || !newState) {
			closeDrawer("chatbot");
		} else {
			openDrawer("chatbot");
		}
	});

	return (
		<SystemLogLayout
			className={className}
			hideSystemLog={hideSystemLog}
			sidebar={hideSidebar ? null : <Sidebar />}
			topbar={hideTopbar ? null : <ProjectConfigTopbar />}
		>
			<Outlet />
		</SystemLogLayout>
	);
};
