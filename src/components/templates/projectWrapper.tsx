import React from "react";

import { Outlet } from "react-router-dom";

import { ChatbotDrawer, EventsDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	return (
		<div className="relative my-1.5 flex h-full flex-row overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<EventsDrawer />
		</div>
	);
};
