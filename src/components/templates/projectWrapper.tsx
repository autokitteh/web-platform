import React, { useEffect } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks";
import { useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer, ProjectSettingsViewDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const { isProjectDrawerState, shouldReopenProjectSettingsAfterEvents, setShouldReopenProjectSettingsAfterEvents } =
		useSharedBetweenProjectsStore();
	const isConfigOpen = projectId ? isProjectDrawerState[projectId] : undefined;
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const isDrawerOpen = useSharedBetweenProjectsStore((state) => state.isDrawerOpen);
	const location = useLocation();

	useEffect(() => {
		if (projectId && isDrawerOpen(projectId, DrawerName.projectSettings)) {
			openDrawer(projectId, DrawerName.projectSettings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId]);

	useEffect(() => {
		if (!isConfigOpen || !projectId) return;
		openDrawer(projectId, DrawerName.projectSettings);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfigOpen]);

	useEffect(() => {
		const shouldReopenConfig =
			projectId && shouldReopenProjectSettingsAfterEvents[projectId] && location.state?.fromEvents === true;

		if (shouldReopenConfig) {
			setShouldReopenProjectSettingsAfterEvents(projectId, false);
			setTimeout(() => {
				triggerEvent(EventListenerName.displayProjectConfigSidebar);
			}, 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, shouldReopenProjectSettingsAfterEvents, location.state]);

	return (
		<div className="relative mt-1.5 flex h-full flex-row overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<ProjectSettingsViewDrawer />
		</div>
	);
};
