import React, { useCallback } from "react";

import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useSharedBetweenProjectsStore } from "@src/store";
import { extractSettingsPath } from "@src/utilities";

import { ChatbotDrawer, EventsDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();

	const { basePath } = extractSettingsPath(location.pathname);
	const { closeDrawer } = useSharedBetweenProjectsStore();

	const handleClose = useCallback(() => {
		if (!projectId) return;
		closeDrawer(projectId, DrawerName.projectSettings);
		navigate(basePath);

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, basePath]);

	useEventListener(EventListenerName.hideProjectConfigSidebar, handleClose);

	return (
		<div className="relative mt-1.5 flex h-full flex-row overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<EventsDrawer />
		</div>
	);
};
