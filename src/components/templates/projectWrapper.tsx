import React, { useEffect } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { triggerEvent } from "@src/hooks";
import { useDrawerStore, useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer, ProjectFilesDrawer, ProjectSettingsViewDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const { isProjectDrawerState, shouldReopenProjectSettingsAfterEvents, setShouldReopenProjectSettingsAfterEvents } =
		useSharedBetweenProjectsStore();
	const isConfigOpen = projectId ? isProjectDrawerState[projectId] : undefined;
	const { openDrawer } = useDrawerStore();
	const location = useLocation();

	useEffect(() => {
		if (!isConfigOpen) return;
		openDrawer(DrawerName.projectSettings);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isConfigOpen]);

	useEffect(() => {
		const shouldReopenConfig =
			projectId && shouldReopenProjectSettingsAfterEvents[projectId] && location.state?.fromEvents === true;

		if (shouldReopenConfig) {
			setShouldReopenProjectSettingsAfterEvents(projectId, false);
			setTimeout(() => {
				triggerEvent(EventListenerName.displayProjectSettingsSidebar);
			}, 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, shouldReopenProjectSettingsAfterEvents, location.state]);

	return (
		<div className="relative mt-1.5 h-full overflow-hidden">
			<Outlet />
			<ProjectFilesDrawer />
			<ChatbotDrawer />
			<ProjectSettingsViewDrawer />
		</div>
	);
};
