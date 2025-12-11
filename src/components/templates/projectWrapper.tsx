import React, { useEffect } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";

import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { extractSettingsPath } from "@src/utilities/navigation";

import { ChatbotDrawer, EventsDrawer, ProjectConfigurationDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const location = useLocation();
	const { openDrawer, closeDrawer, setSettingsPath } = useSharedBetweenProjectsStore();
	const { projectId } = useParams<{ projectId: string }>();
	const { settingsPath } = extractSettingsPath(location.pathname);
	const isSettingsOpen = Boolean(settingsPath && projectId);

	useEffect(() => {
		if (isSettingsOpen && projectId) {
			openDrawer(projectId, DrawerName.settings);
		} else if (projectId) {
			closeDrawer(projectId, DrawerName.settings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [isSettingsOpen, projectId]);

	useEffect(() => {
		if (projectId && settingsPath) {
			setSettingsPath(projectId, settingsPath);
		}
	}, [projectId, settingsPath, setSettingsPath]);

	return (
		<div className="relative my-1.5 flex h-full flex-row overflow-hidden">
			<Outlet />
			{isSettingsOpen ? <ProjectConfigurationDrawer /> : null}
			<ChatbotDrawer />
			<EventsDrawer />
		</div>
	);
};
