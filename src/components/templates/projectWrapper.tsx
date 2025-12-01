import React from "react";

import { Outlet } from "react-router-dom";

import { ChatbotDrawer, EventsDrawer, GlobalConnectionsDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	return (
		<div className="relative mt-1.5 flex h-full flex-row overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<EventsDrawer />
			<GlobalConnectionsDrawer />
		</div>
	);
};
