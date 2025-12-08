import React, { useCallback, useEffect } from "react";

import { useLocation, useParams } from "react-router-dom";

import { EventsList } from "@shared-components";
import { EventListenerName } from "@src/enums";
import { DrawerName } from "@src/enums/components";
import { useEventListener } from "@src/hooks";
import { useEventsDrawerStore, useSharedBetweenProjectsStore, useToastStore } from "@src/store";

export const EventsDrawer = () => {
	const location = useLocation();
	const { projectId: projectIdUrlParam } = useParams();
	const openDrawer = useSharedBetweenProjectsStore((state) => state.openDrawer);
	const closeDrawer = useSharedBetweenProjectsStore((state) => state.closeDrawer);
	const { setState, resetState, connectionId, triggerId } = useEventsDrawerStore();
	const { addToast } = useToastStore();

	const open = (event: CustomEvent<{ connectionId?: string; projectId?: string; triggerId?: string }>) => {
		if (!projectIdUrlParam) return;
		setState({ connectionId: event?.detail?.connectionId, triggerId: event?.detail?.triggerId });
		openDrawer(projectIdUrlParam, DrawerName.events);
	};

	const close = useCallback(() => {
		if (!projectIdUrlParam) {
			addToast({
				message: "Couldn't close events drawer - no project ID found",
				type: "error",
			});
			return;
		}
		resetState();
		closeDrawer(projectIdUrlParam, DrawerName.events);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [projectIdUrlParam]);

	useEventListener(EventListenerName.displayProjectEventsSidebar, open);
	useEventListener(EventListenerName.hideProjectEventsSidebar, close);

	useEffect(() => {
		const handleEscapeKey = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				close();
			}
		};

		document.addEventListener("keydown", handleEscapeKey);

		return () => {
			document.removeEventListener("keydown", handleEscapeKey);
		};
	}, [close]);

	if (!location.pathname.startsWith("/projects") || !projectIdUrlParam) {
		return null;
	}
	const section = connectionId ? "connections" : triggerId ? "triggers" : "project";

	return (
		<EventsList
			connectionId={connectionId}
			isDrawer
			projectId={projectIdUrlParam}
			section={section}
			triggerId={triggerId}
		/>
	);
};
