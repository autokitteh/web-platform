import React from "react";

import { Outlet } from "react-router-dom";

import { ChatbotDrawer, ProjectConfigViewDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	return (
		<div className="relative mt-1.5 h-full overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<ProjectConfigViewDrawer />
		</div>
	);
};
