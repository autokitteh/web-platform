import { createContext, useContext } from "react";

import { EventsDrawerContextType } from "@src/interfaces/components";

export const EventsDrawerContext = createContext<EventsDrawerContextType>({
	isDrawer: false,
	triggerId: "",
	connectionId: "",
	projectId: "",
	filterType: "",
	title: "",
});

export const useEventsDrawer = () => useContext(EventsDrawerContext);
