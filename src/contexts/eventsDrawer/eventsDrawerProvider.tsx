import React from "react";

import { EventsDrawerContext } from "@contexts/eventsDrawer/useEventsDrawer";

export const EventsDrawerProvider = ({
	children,
	filterType,
	isDrawer,
	projectId,
	sourceId,
}: {
	children: React.ReactNode;
	filterType?: string;
	isDrawer: boolean;
	projectId?: string;
	sourceId?: string;
}) => (
	<EventsDrawerContext.Provider value={{ isDrawer, sourceId, projectId, filterType }}>
		{children}
	</EventsDrawerContext.Provider>
);
