import React from "react";

import { useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useSharedBetweenProjectsStore } from "@src/store";

import { EventsList } from "@components/organisms/shared";

export const EventsDrawer = () => {
	const location = useLocation();
	const { projectId } = useParams();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);

	const open = () => {
		if (!projectId) return;
		openDrawer(projectId, DrawerName.events);
	};

	const close = () => {
		if (!projectId) return;
		closeDrawer(projectId, DrawerName.events);
	};

	useEventListener(EventListenerName.displayProjectEventsSidebar, open);
	useEventListener(EventListenerName.hideProjectEventsSidebar, close);

	if (!location.pathname.startsWith("/projects")) {
		return null;
	}

	return <EventsList fromNavigation={false} isDrawer type="project" />;
};
