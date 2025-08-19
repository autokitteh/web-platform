import React from "react";

import { Outlet } from "react-router-dom";

import { ChatbotDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	return (
		<div className="projectWrapper mt-1.5 h-full">
			<Outlet />
			<ChatbotDrawer />
		</div>
	);
};
