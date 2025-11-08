import React, { useState } from "react";

import { useLocation, useParams } from "react-router-dom";

import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useSharedBetweenProjectsStore, useToastStore } from "@src/store";

import { EventsList } from "@components/organisms/shared";

export const EventsDrawer = () => {
	const location = useLocation();
	const { projectId: projectIdUrlParam } = useParams();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const [connectionId, setConnectionId] = useState<string | undefined>(undefined);
	const [triggerId, setTriggerId] = useState<string | undefined>(undefined);
	const { addToast } = useToastStore();

	const open = (event: CustomEvent<{ connectionId?: string; projectId?: string; triggerId?: string }>) => {
		if (!projectIdUrlParam) return;
		setConnectionId(event?.detail?.connectionId);
		setTriggerId(event?.detail?.triggerId);
		openDrawer(projectIdUrlParam, DrawerName.events);
	};

	const close = () => {
		if (!projectIdUrlParam) {
			addToast({
				message: "Couldn't close events drawer - no project ID found",
				type: "error",
			});
			return;
		}
		setConnectionId(undefined);
		setTriggerId(undefined);
		closeDrawer(projectIdUrlParam, DrawerName.events);
	};

	useEventListener(EventListenerName.displayProjectEventsSidebar, open);
	useEventListener(EventListenerName.hideProjectEventsSidebar, close);

	if (!location.pathname.startsWith("/projects") || !projectIdUrlParam) {
		return null;
	}

	return (
		<EventsList
			connectionId={connectionId}
			isDrawer
			projectId={projectIdUrlParam}
			triggerId={triggerId}
			type="project"
		/>
	);
};
