import React, { useEffect } from "react";

import { Outlet, useParams } from "react-router-dom";

import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer, ProjectConfigViewDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const { isProjectDrawerState } = useSharedBetweenProjectsStore();
	const isConfigOpen = projectId ? isProjectDrawerState[projectId] : undefined;
	const { openDrawer } = useDrawerStore();

	useEffect(() => {
		if (!isConfigOpen) return;
		openDrawer("projectConfig");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfigOpen]);

	return (
		<div className="relative mt-1.5 h-full overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<ProjectConfigViewDrawer />
		</div>
	);
};
