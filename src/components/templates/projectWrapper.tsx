import React, { useEffect } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { triggerEvent } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer, ProjectConfigViewDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const { isProjectDrawerState, shouldReopenProjectConfigAfterEvents, setShouldReopenProjectConfigAfterEvents } =
		useSharedBetweenProjectsStore();
	const isConfigOpen = projectId ? isProjectDrawerState[projectId] : undefined;
	const { openDrawer } = useDrawerStore();
	const location = useLocation();

	useEffect(() => {
		if (!isConfigOpen) return;
		openDrawer("projectConfig");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfigOpen]);

	useEffect(() => {
		const shouldReopenConfig =
			projectId && shouldReopenProjectConfigAfterEvents[projectId] && location.state?.fromEvents === true;

		if (shouldReopenConfig) {
			setShouldReopenProjectConfigAfterEvents(projectId, false);
			setTimeout(() => {
				triggerEvent(EventListenerName.displayProjectConfigSidebar);
			}, 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, shouldReopenProjectConfigAfterEvents, location.state]);

	return (
		<div className="relative mt-1.5 h-full overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<ProjectConfigViewDrawer />
		</div>
	);
};
