import React, { useEffect } from "react";

import { EventsTable } from "../events";
import { useEventsDrawerStore } from "@src/store";

export const EventsList = ({ isDrawer }: { isDrawer?: boolean }) => {
	const resetState = useEventsDrawerStore((state) => state.resetState);

	useEffect(() => {
		if (!isDrawer) {
			resetState();
		}
	}, [isDrawer, resetState]);

	if (isDrawer) {
		return null;
	}

	return <EventsTable />;
};
