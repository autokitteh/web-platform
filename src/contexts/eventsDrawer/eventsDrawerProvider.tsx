import React from "react";

import { EventsDrawerContext } from "@contexts/eventsDrawer/useEventsDrawer";
import { LoggerService } from "@services/logger.service";
import { namespaces } from "@src/constants";
import { useCacheStore, useProjectStore } from "@src/store";

export const EventsDrawerProvider = ({
	children,
	connectionId,
	filterType,
	isDrawer,
	projectId,
	triggerId,
}: {
	children: React.ReactNode;
	connectionId?: string;
	filterType?: string;
	isDrawer: boolean;
	projectId?: string;
	triggerId?: string;
}) => {
	const { connections, triggers } = useCacheStore();
	const { projectsList } = useProjectStore();
	const connection = connections?.find((c) => c.connectionId === connectionId);
	const trigger = triggers?.find((t) => t.triggerId === triggerId);
	const project = projectsList.find((p) => p.id === projectId);

	if (!project) {
		LoggerService.error(namespaces.eventsDrawer, `Couldn't get events in drawer for projectId: ${projectId}`);

		return null;
	}

	const displayedEntity = connection ? "connection" : trigger ? "trigger" : "project";
	const displayedEntityName = connection ? connection.name : trigger ? trigger.name : project.name;

	const title = `Events for ${displayedEntity} ${displayedEntityName}`;

	return (
		<EventsDrawerContext.Provider value={{ isDrawer, title, projectId, filterType, triggerId, connectionId }}>
			{children}
		</EventsDrawerContext.Provider>
	);
};
