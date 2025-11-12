import React, { useCallback, useEffect } from "react";

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
	const { shouldReopenProjectSettingsAfterEvents, setShouldReopenProjectSettingsAfterEvents } =
		useSharedBetweenProjectsStore();

	const { basePath } = extractSettingsPath(location.pathname);
	const { closeDrawer } = useSharedBetweenProjectsStore();

	useEffect(() => {
		const shouldReopenConfig = projectId && shouldReopenProjectSettingsAfterEvents[projectId];

		if (shouldReopenConfig) {
			setShouldReopenProjectSettingsAfterEvents(projectId, false);
			setTimeout(() => {
				navigate(`/projects/${projectId}/explorer/settings`);
			}, 100);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectId, shouldReopenProjectSettingsAfterEvents, location.state]);

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
