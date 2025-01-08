import { createContext, useContext } from "react";

import { EventsDrawerContextType } from "@src/interfaces/components";

export const EventsDrawerContext = createContext<EventsDrawerContextType>({
	isDrawer: false,
	sourceId: "",
	projectId: "",
	filterType: "",
});

export const useEventsDrawer = () => useContext(EventsDrawerContext);
