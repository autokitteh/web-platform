import React, { useEffect } from "react";

import { Outlet, useLocation, useNavigate, useParams } from "react-router-dom";

import { useSharedBetweenProjectsStore } from "@src/store";

import { ChatbotDrawer, EventsDrawer } from "@components/organisms";

export const ProjectWrapper = () => {
	const { projectId } = useParams();
	const navigate = useNavigate();
	const location = useLocation();
	const { shouldReopenProjectSettingsAfterEvents, setShouldReopenProjectSettingsAfterEvents } =
		useSharedBetweenProjectsStore();

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

	return (
		<div className="relative mt-1.5 flex h-full flex-row overflow-hidden">
			<Outlet />
			<ChatbotDrawer />
			<EventsDrawer />
		</div>
	);
};
