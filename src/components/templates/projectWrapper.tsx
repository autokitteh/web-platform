import React, { useEffect } from "react";

import { Outlet, useLocation, useParams } from "react-router-dom";

import { DrawerName } from "@src/enums/components";
import { useSharedBetweenProjectsStore } from "@src/store";
import { extractSettingsPath } from "@src/utilities/navigation";

import { ChatbotDrawer, EventsDrawer, GlobalConnectionsDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const location = useLocation();
	const { openDrawer } = useSharedBetweenProjectsStore();
	const { projectId } = useParams<{ projectId: string }>();

	useEffect(() => {
		const { settingsPath } = extractSettingsPath(location.pathname);
		if (settingsPath && projectId) {
			openDrawer(projectId, DrawerName.settings);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [location.pathname, projectId]);
	return (
		<div className="relative my-1.5 flex h-full flex-row overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<EventsDrawer />
			<GlobalConnectionsDrawer />
		</div>
	);
};
